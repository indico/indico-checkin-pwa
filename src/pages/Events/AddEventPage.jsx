import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {OAuth2Client, generateCodeVerifier} from '@badgateway/oauth2-client';
import QrScannerPlugin, {calcAspectRatio} from '../../Components/QrScanner/QrScannerPlugin';
import {Typography} from '../../Components/Tailwind';
import db from '../../db/db';
import {addEvent, addRegistrationForm} from '../../db/utils';
import useAppState from '../../hooks/useAppState';
import {camelizeKeys} from '../../utils/case';
import {discoveryEndpoint, redirectURI, validateQRCodeData} from '../Auth/utils';
import classes from './Events.module.css';

const AddEventPage = () => {
  const navigate = useNavigate();
  const {showModal, enableModal} = useAppState();
  const [hasPermission, setHasPermission] = useState(true);
  const [processing, setProcessing] = useState(false); // Determines if a QR Code is being processed

  const onScanResult = async (decodedText, _decodedResult) => {
    if (processing) {
      // Prevent multiple scans at the same time
      return;
    }
    setProcessing(true);

    let eventData;
    try {
      eventData = JSON.parse(decodedText);
    } catch (e) {
      enableModal('Error parsing the QRCode data', e?.message);
      setProcessing(false);
      return;
    }

    eventData = camelizeKeys(eventData);

    if (!validateQRCodeData(eventData)) {
      enableModal('Invalid QR Code data', 'Some data is either missing or incorrect');
      setProcessing(false);
      return;
    }

    // Check if the serverData is already in indexedDB
    const server = await db.servers.get({baseUrl: eventData.server.baseUrl});
    if (server) {
      // No need to perform authentication
      const {eventId, regformId, title, date, regformTitle} = eventData;
      try {
        await addEvent({id: eventId, title, date, serverId: server.id});
        await addRegistrationForm({
          id: regformId,
          eventId: eventId,
          title: regformTitle,
        });

        // Navigate to homepage
        navigate('/');
      } catch (err) {
        console.log('Error adding data to IndexedDB: ', err);
        enableModal('Error adding data to the DB', err?.message);
      }
      setProcessing(false);
      return;
    }

    console.log("Server doesn't exist in IndexedDB. Proceeding to authentication...");
    // Perform OAuth2 Authorization Code Flow
    const {
      server: {baseUrl, clientId, scope},
    } = eventData;
    const client = new OAuth2Client({
      server: baseUrl,
      clientId: clientId,
      discoveryEndpoint: discoveryEndpoint,
      fetch: window.fetch.bind(window), // Use the browser's native fetch API   TODO: Confirm this is correct

      // These endpoints can be manually specified if the server doesn't support discovery
      // The tokenEndpoint and authorizationEndpoint are optional and will be inferred from the server's discovery document if not provided
      /* authorizationEndpoint: 'https://sg1.cern.ch/oauth/authorize',
      tokenEndpoint: 'https://sg1.cern.ch/oauth/token', */
    });

    /**
     * This generates a security code that must be passed to the various steps.
     * This is used for 'PKCE' which is an advanced security feature.
     *
     * It doesn't break servers that don't support it, but it makes servers that
     * so support it more secure.
     *
     * It's optional to pass this, but recommended.
     */
    const codeVerifier = await generateCodeVerifier();

    // Store the eventData in the browser's session storage. This is used later to verify the code challenge
    const sessionData = {...eventData, codeVerifier};
    sessionStorage.setItem('eventData', JSON.stringify(sessionData));

    try {
      // Redirect the user to the Authentication Server (OAuth2 Server)
      // Which will redirect the user back to the redirectUri (Back to the App)
      document.location = await client.authorizationCode.getAuthorizeUri({
        // URL in the app that the user should get redirected to after authenticating
        redirectUri: redirectURI, // TODO: Check this later
        codeVerifier,
        scope: [scope],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const onPermRefused = () => {
    setHasPermission(false);
  };

  return (
    <div>
      <div className="justify-center items-center flex pt-3 pb-6">
        <Typography variant="h3 " className="font-semibold dark:text-white">
          Scan the Event QR Code
        </Typography>
      </div>
      {showModal ? (
        <div className="w-full aspect-square" />
      ) : (
        <QrScannerPlugin
          fps={15}
          qrbox={250}
          aspectRatio={calcAspectRatio()}
          disableFlip={false}
          qrCodeSuccessCallback={onScanResult}
          onPermRefused={onPermRefused}
        />
      )}
      <div className="justify-center items-center flex py-6 mx-6">
        {hasPermission ? (
          <Typography variant="h3" className={`text-center font-bold ${classes.scanningText}`}>
            QR CODE SCANNING
          </Typography>
        ) : (
          <Typography variant="body1" className="text-center">
            Please give permission to access the camera and refresh the page
          </Typography>
        )}
      </div>
    </div>
  );
};

export default AddEventPage;
