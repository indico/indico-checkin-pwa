import {useState} from 'react';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import {OAuth2Client, generateCodeVerifier} from '@badgateway/oauth2-client';
import {VideoCameraSlashIcon} from '@heroicons/react/20/solid';
import QrScannerPlugin from '../../Components/QrScanner/QrScannerPlugin';
import {Typography} from '../../Components/Tailwind';
import LoadingBanner from '../../Components/Tailwind/LoadingBanner';
import TopNav from '../../Components/TopNav';
import {ErrorModalFunction} from '../../context/ModalContextProvider';
import db, {addEvent, addParticipant, addRegform} from '../../db/db';
import {useErrorModal} from '../../hooks/useModal';
import useSettings from '../../hooks/useSettings';
import {camelizeKeys} from '../../utils/case';
import {getParticipant, useIsOffline} from '../../utils/client';
import {
  validateParticipantData,
  validateEventData,
  discoveryEndpoint,
  redirectUri,
} from '../Auth/utils';
import {QRCodeEventData, QRCodeParticipantData} from '../Auth/utils';
import {handleError} from '../Events/sync';

async function handleEvent(
  data: QRCodeEventData,
  errorModal: ErrorModalFunction,
  navigate: NavigateFunction
) {
  // Check if the serverData is already in indexedDB
  const server = await db.servers.get({baseUrl: data.server.baseUrl});
  if (server) {
    // No need to perform authentication
    let id;
    const {eventId, regformId, title, date, regformTitle} = data;
    await db.transaction('readwrite', db.events, db.regforms, async () => {
      const event = await db.events.where({indicoId: eventId, serverId: server.id}).first();

      if (event) {
        id = event.id;
      } else {
        id = await addEvent({
          indicoId: eventId,
          serverId: server.id,
          baseUrl: server.baseUrl,
          title,
          date,
        });
      }

      const regform = await db.regforms.where({indicoId: regformId, eventId: id}).first();
      if (!regform) {
        await addRegform({
          indicoId: regformId,
          eventId: id!,
          title: regformTitle,
        });
      }
    });

    navigate(`/event/${id}`, {replace: true, state: {backBtnText: 'Home'}});
    return;
  }

  // Perform OAuth2 Authorization Code Flow
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

async function handleParticipant(
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

  const event = await db.events.get({indicoId: data.eventId});
  if (!event) {
    errorModal({
      title: 'The event of this participant does not exist',
      content: 'Scan an event QR code first and try again.',
    });
    return;
  }

  const regform = await db.regforms.get({indicoId: data.regformId});
  if (!regform) {
    errorModal({
      title: 'The registration form of this participant does not exist',
      content: 'Scan an event QR code first and try again.',
    });
    return;
  }

  const regformPage = `/event/${event.id}/${regform.id}`;
  const participant = await db.participants.get({indicoId: data.registrationId});
  if (participant) {
    if (participant.checkinSecret !== data.checkinSecret) {
      errorModal({
        title: 'QR code data is not valid',
        content: 'Please try again',
      });
      return;
    }

    const participantPage = `${regformPage}/${participant.id}`;
    navigate(participantPage, {
      replace: true,
      state: {autoCheckin, backBtnText: regform.title, backNavigateTo: regformPage},
    });
  } else {
    const response = await getParticipant({
      serverId: server.id,
      eventId: event.indicoId,
      regformId: regform.indicoId,
      participantId: data.registrationId,
    });

    if (response.ok) {
      const {id, ...rest} = response.data;

      if (response.data.checkinSecret !== data.checkinSecret) {
        errorModal({
          title: 'QR code data is not valid',
          content: 'Please try again',
        });
        return;
      }

      const participantId = await addParticipant({
        indicoId: id,
        ...rest,
      });
      const participantPage = `${regformPage}/${participantId}`;
      navigate(participantPage, {
        replace: true,
        state: {autoCheckin, backBtnText: regform.title, backNavigateTo: regformPage},
      });
    } else {
      handleError(response, 'Could not fetch participant data', errorModal);
    }
  }
}

const ScanPage = () => {
  const [hasPermission, setHasPermission] = useState(true);
  const [processing, setProcessing] = useState(false); // Determines if a QR Code is being processed
  const {autoCheckin} = useSettings();
  const navigate = useNavigate();
  const errorModal = useErrorModal();
  const offline = useIsOffline();

  async function processCode(decodedText: string) {
    if (processing) {
      // Prevent multiple scans at the same time
      return;
    }
    setProcessing(true);

    let scannedData;
    try {
      scannedData = JSON.parse(decodedText);
    } catch (e: any) {
      errorModal({title: 'Error parsing the QRCode data', content: e.message});
      return;
    }

    scannedData = camelizeKeys(scannedData);
    if (validateEventData(scannedData)) {
      if (offline) {
        errorModal({
          title: 'You are offline',
          content: 'Internet connection is required to add a registration form',
        });
        return;
      }
      await handleEvent(scannedData, errorModal, navigate);
    } else if (validateParticipantData(scannedData)) {
      const participantData = {...scannedData, eventId: parseInt(scannedData.eventId, 10)};
      await handleParticipant(participantData, errorModal, navigate, autoCheckin);
    } else {
      errorModal({
        title: 'QR code data is not valid',
        content: 'Some fields are missing. Please try again',
      });
    }
  }

  const onScanResult = async (decodedText: string, _decodedResult: any) => {
    try {
      await processCode(decodedText);
    } catch (e: any) {
      errorModal({title: 'Error processing QR code', content: e.message});
    } finally {
      setProcessing(false);
    }

    // TODO: Make QR Code UI More responsive to what is happening
  };

  const onPermRefused = () => {
    setHasPermission(false);
  };

  return (
    <div>
      <TopNav />
      {!processing && (
        <div className="mt-[-1rem]">
          <QrScannerPlugin qrCodeSuccessCallback={onScanResult} onPermRefused={onPermRefused} />
        </div>
      )}
      {processing && <LoadingBanner text="Loading.." />}
      {!hasPermission && (
        <div className="mx-4 mt-2 rounded-xl bg-gray-100 dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center gap-2 px-6 pb-12 pt-10">
            <VideoCameraSlashIcon className="w-20 text-gray-500" />
            <Typography variant="h3" className="text-center">
              Please give permission to access the camera and refresh the page
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanPage;
