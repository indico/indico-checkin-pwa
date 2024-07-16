import {NavigateFunction} from 'react-router-dom';
import {OAuth2Client, generateCodeVerifier} from '@badgateway/oauth2-client';
import {ErrorModalFunction} from '../../context/ModalContextProvider';
import db, {
  addEventIfNotExists,
  addParticipant,
  addRegformIfNotExists,
  getServer,
  updateParticipant,
} from '../../db/db';
import {getParticipantByUuid as getParticipant} from '../../utils/client';
import {discoveryEndpoint, redirectUri} from '../Auth/utils';
import {QRCodeEventData, QRCodeParticipantData} from '../Auth/utils';
import {handleError} from '../Events/sync';

async function startOAuthFlow(data: QRCodeEventData, errorModal: ErrorModalFunction) {
  const {
    server: {baseUrl, clientId, scope},
  } = data;
  const client = new OAuth2Client({
    server: baseUrl,
    clientId: clientId,
    discoveryEndpoint: discoveryEndpoint,
    fetch: fetch.bind(window),
    // XXX Need to manually specify, otherwise this will be 'client_secret_basic' which
    // doesn't work with Indico even though it is listed in '.well-known/oauth-authorization-server'
    authenticationMethod: 'client_secret_post',
  });

  const codeVerifier = await generateCodeVerifier();
  // Store the eventData in the browser's session storage. This is used later to verify the code challenge
  sessionStorage.setItem('eventData', JSON.stringify(data));
  sessionStorage.setItem('codeVerifier', codeVerifier);

  try {
    // Redirect the user to the Authentication Server (OAuth2 Server)
    // Which will redirect the user back to the redirectUri (Back to the App)
    document.location = await client.authorizationCode.getAuthorizeUri({
      // URL in the app that the user should get redirected to after authenticating
      redirectUri,
      codeVerifier,
      scope: [scope],
    });
  } catch (err: any) {
    errorModal({title: 'OAuth authorization failed', content: err.message});
  }
}

export async function handleEvent(
  data: QRCodeEventData,
  errorModal: ErrorModalFunction,
  navigate: NavigateFunction
) {
  // Check if the serverData is already in indexedDB
  const server = await getServer({baseUrl: data.server.baseUrl});
  if (server) {
    // No need to perform authentication
    let id!: number;
    const {eventId: eventIndicoId, regformId: regformIndicoId, title, date, regformTitle} = data;
    await db.transaction('readwrite', db.events, db.regforms, async () => {
      id = await addEventIfNotExists({
        indicoId: eventIndicoId,
        serverId: server.id,
        baseUrl: server.baseUrl,
        title,
        date,
      });
      await addRegformIfNotExists({indicoId: regformIndicoId, eventId: id, title: regformTitle});
    });

    navigate(`/event/${id}`, {replace: true});
  } else {
    // Perform OAuth2 Authorization Code Flow
    // TODO: test this
    await startOAuthFlow(data, errorModal);
  }
}

export async function handleParticipant(
  data: QRCodeParticipantData,
  errorModal: ErrorModalFunction,
  navigate: NavigateFunction,
  autoCheckin: boolean
) {
  const server = await db.servers.get({baseUrl: data.serverUrl});
  if (!server) {
    errorModal({
      title: 'The server of this participant does not exist',
      content: 'Scan an event QR code first and try again.',
    });
    return;
  }

  const response = await getParticipant({
    serverId: server.id,
    uuid: data.checkinSecret,
  });

  if (response.ok) {
    const {id, eventId, regformId, ...rest} = response.data;
    const event = await db.events.get({indicoId: eventId, serverId: server.id});
    if (!event) {
      errorModal({
        title: 'The event of this participant does not exist',
        content: 'Scan an event QR code first and try again.',
      });
      return;
    }

    const regform = await db.regforms.get({indicoId: regformId, eventId: event.id});
    if (!regform) {
      errorModal({
        title: 'The registration form of this participant does not exist',
        content: 'Scan an event QR code first and try again.',
      });
      return;
    }

    let participantId;
    await db.transaction('readwrite', db.participants, async () => {
      const participant = await db.participants.get({indicoId: id, regformId: regform.id});
      if (participant) {
        await updateParticipant(participant.id, response.data);
        participantId = participant.id;
      } else {
        participantId = await addParticipant({indicoId: id, regformId: regform.id, ...rest});
      }
    });

    const participantPage = `/event/${regform.eventId}/${regform.id}/${participantId}`;
    navigate(participantPage, {
      replace: true,
      state: {autoCheckin, fromScan: true},
    });
  } else {
    handleError(response, 'Could not fetch participant data', errorModal);
  }
}
