import {NavigateFunction} from 'react-router-dom';
import {OAuth2Client, generateCodeVerifier} from '@badgateway/oauth2-client';
import {ErrorModalFunction} from '../../context/ModalContextProvider';
import {CustomQRCodes} from '../../context/SettingsProvider';
import db, {
  addEventIfNotExists,
  addParticipant,
  addRegformIfNotExists,
  getServer,
  updateParticipant,
} from '../../db/db';
import {HandleError} from '../../hooks/useError';
import {
  getParticipantByUuid as getParticipant,
  getParticipantDataFromCustomQRCode,
} from '../../utils/client';
import {isRecord} from '../../utils/typeguards';
import {
  discoveryEndpoint,
  redirectUri,
  QRCodeEventData,
  QRCodeParticipantData,
  parseQRCodeParticipantData,
} from '../Auth/utils';

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
  } catch (e) {
    errorModal({title: 'OAuth authorization failed', content: e instanceof Error ? e.message : ''});
  }
}

export async function handleEvent(
  data: QRCodeEventData,
  errorModal: ErrorModalFunction,
  navigate: NavigateFunction,
  customQRCodes: CustomQRCodes,
  setCustomQRCodes: (v: CustomQRCodes) => void
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
    if (data.customCodeHandlers && isRecord(data.customCodeHandlers)) {
      const customCodeHandlers = data.customCodeHandlers;
      let newCustomQRCodes = {...customQRCodes};
      for (const customCodeHandler in customCodeHandlers) {
        newCustomQRCodes = {
          ...newCustomQRCodes,
          [customCodeHandler]: {
            regex: customCodeHandlers[customCodeHandler],
            baseUrl: server.baseUrl,
          },
        };
      }
      setCustomQRCodes(newCustomQRCodes);
      localStorage.setItem('customQRCodes', JSON.stringify(newCustomQRCodes));
    }
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
  handleError: HandleError,
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
    uuid: data.checkinSecret ?? '',
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
    handleError(response, 'Could not fetch participant data');
  }
}

export async function parseCustomQRCodeData(
  decodedText: string,
  errorModal: ErrorModalFunction,
  customQRCodes: CustomQRCodes
): Promise<QRCodeParticipantData | null> {
  for (const customQRCode in customQRCodes) {
    const customQRCodeData = customQRCodes[customQRCode];
    let regex;
    try {
      regex = new RegExp(customQRCodeData.regex);
    } catch {
      return null;
    }
    if (regex.test(decodedText)) {
      const server = await db.servers.get({baseUrl: customQRCodeData.baseUrl});
      if (!server) {
        errorModal({
          title: 'The server of this participant does not exist',
          content: 'Scan an event QR code first and try again.',
        });
        return null;
      }
      const response = await getParticipantDataFromCustomQRCode({
        serverId: server.id,
        data: decodedText,
        qrCodeName: customQRCode,
      });
      if (response.ok) {
        const parsedData = parseQRCodeParticipantData(response.data);
        if (parsedData) {
          return parsedData;
        }
      }
    }
  }
  return null;
}
