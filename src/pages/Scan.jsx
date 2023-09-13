import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {OAuth2Client, generateCodeVerifier} from '@badgateway/oauth2-client';
import beep1 from '../assets/beep1.mp3';
import beep2 from '../assets/beep2.mp3';
import blip from '../assets/blip.mp3';
import levelUp from '../assets/level-up.mp3';
import QrScannerPlugin, {calcAspectRatio} from '../Components/QrScanner/QrScannerPlugin';
import {Typography} from '../Components/Tailwind';
import {LoadingIndicator} from '../Components/Tailwind/LoadingIndicator';
import TopTab from '../Components/TopTab';
import db from '../db/db';
import {useErrorModal} from '../hooks/useModal';
import useSettings from '../hooks/useSettings';
import {camelizeKeys} from '../utils/case';
import {getParticipant, useIsOffline} from '../utils/client';
import {
  validateParticipantData,
  validateEventData,
  discoveryEndpoint,
  redirectUri,
} from './Auth/utils';
import {handleError} from './Events/sync';

const soundEffects = {
  'None': null,
  'Beep 1': beep1,
  'Beep 2': beep2,
  'Blip': blip,
  'Level up': levelUp,
};

function playAudio(audio) {
  new Audio(audio).play();
}

async function handleEvent(data, errorModal, setProcessing, navigate) {
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
        id = await db.events.add({
          indicoId: eventId,
          serverId: server.id,
          baseUrl: server.baseUrl,
          title,
          date,
          deleted: false,
        });
      }

      const regform = await db.regforms.where({indicoId: regformId, eventId: id}).first();
      if (!regform) {
        await db.regforms.add({
          indicoId: regformId,
          eventId: id,
          title: regformTitle,
          registrationCount: 0,
          checkedInCount: 0,
          deleted: false,
        });
      }
    });

    setProcessing(false);
    navigate(`/event/${id}`);
    return;
  }

  console.log("Server doesn't exist in IndexedDB. Proceeding to authentication...");
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
  sessionStorage.setItem('eventData', JSON.stringify({...data, codeVerifier}));

  try {
    // Redirect the user to the Authentication Server (OAuth2 Server)
    // Which will redirect the user back to the redirectUri (Back to the App)
    document.location = await client.authorizationCode.getAuthorizeUri({
      // URL in the app that the user should get redirected to after authenticating
      redirectUri,
      codeVerifier,
      scope: [scope],
    });
  } catch (err) {
    errorModal({title: 'OAuth authorization failed', content: err.message});
  } finally {
    setProcessing(false);
  }
}

async function handleParticipant(data, errorModal, setProcessing, navigate, autoCheckin, audio) {
  const server = await db.servers.get({baseUrl: data.serverUrl});
  if (!server) {
    errorModal({
      title: 'The server of this participant does not exist',
      content: 'Scan an event QR code first and try again.',
    });
    setProcessing(false);
    return;
  }

  const event = await db.events.get({indicoId: data.eventId});
  if (!event) {
    errorModal({
      title: 'The event of this participant does not exist',
      content: 'Scan an event QR code first and try again.',
    });
    setProcessing(false);
    return;
  }

  const regform = await db.regforms.get({indicoId: data.regformId});
  if (!regform) {
    errorModal({
      title: 'The registration form of this participant does not exist',
      content: 'Scan an event QR code first and try again.',
    });
    setProcessing(false);
    return;
  }

  const participant = await db.participants.get({indicoId: data.registrationId});
  if (participant) {
    setProcessing(false);
    if (audio) {
      playAudio(audio);
    }
    navigate(`/event/${event.id}/${regform.id}/${participant.id}`, {
      state: {autoCheckin},
    });
  } else {
    const response = await getParticipant(server, event, regform, {indicoId: data.registrationId});
    if (response.ok) {
      const {id, fullName, registrationDate, registrationData, state, checkedIn, checkedInDt} =
        response.data;
      const participantId = await db.participants.add({
        indicoId: id,
        regformId: regform.id,
        fullName,
        registrationDate,
        registrationData,
        state,
        checkedIn,
        checkedInDt,
        notes: '',
      });
      setProcessing(false);
      navigate(`/event/${event.id}/${regform.id}/${participantId}`, {
        state: {autoCheckin},
      });
      if (audio) {
        playAudio(audio);
      }
    } else {
      setProcessing(false);
      handleError(response, 'Could not fetch participant data');
    }
  }
}

const ScanPage = () => {
  const [hasPermission, setHasPermission] = useState(true);
  const [processing, setProcessing] = useState(false); // Determines if a QR Code is being processed
  const {autoCheckin} = useSettings();
  const navigate = useNavigate();
  const {soundEffect} = useSettings();
  const errorModal = useErrorModal();
  const offline = useIsOffline();

  const onScanResult = async (decodedText, _decodedResult) => {
    if (processing) {
      // Prevent multiple scans at the same time
      return;
    }
    setProcessing(true);

    let scannedData;
    try {
      scannedData = JSON.parse(decodedText);
    } catch (e) {
      errorModal({title: 'Error parsing the QRCode data', content: e.message});
      setProcessing(false);
      return;
    }

    scannedData = camelizeKeys(scannedData);
    if (validateEventData(scannedData)) {
      if (offline) {
        errorModal({
          title: 'You are offline',
          content: 'Internet connection is required to add a registration form',
        });
        setProcessing(false);
        return;
      }
      handleEvent(scannedData, errorModal, setProcessing, navigate);
    } else if (validateParticipantData(scannedData)) {
      scannedData.eventId = parseInt(scannedData.eventId, 10);
      handleParticipant(
        scannedData,
        errorModal,
        setProcessing,
        navigate,
        autoCheckin,
        soundEffects[soundEffect]
      );
    } else {
      errorModal({
        title: 'QRCode Data is not valid',
        content: 'Some fields are missing. Please try again.',
      });
      setProcessing(false);
    }

    // TODO: Make QR Code UI More responsive to what is happening
  };

  const onPermRefused = () => {
    setHasPermission(false);
  };

  return (
    <div>
      <TopTab />
      {!processing && (
        <div className="mt-[-1rem]">
          <QrScannerPlugin
            fps={10}
            qrbox={250}
            aspectRatio={calcAspectRatio()}
            disableFlip={false}
            qrCodeSuccessCallback={onScanResult}
            onPermRefused={onPermRefused}
          />
        </div>
      )}
      {processing && (
        <div className="mx-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <div className="relative flex flex-col items-center justify-center gap-4 px-6 pt-10 pb-36 rounded-xl">
            <Typography variant="h3">Authenticating..</Typography>
            <div className="relative">
              <div
                className={`absolute left-1/2 -translate-x-1/2 transition ease-linear delay-1000`}
              >
                <LoadingIndicator size="lg" />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="justify-center items-center flex py-6 mx-6">
        {!hasPermission && (
          <Typography variant="body1" className="text-center">
            Please give permission to access the camera and refresh the page
          </Typography>
        )}
      </div>
    </div>
  );
};

export default ScanPage;
