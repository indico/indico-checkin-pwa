import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {OAuth2Client, generateCodeVerifier} from '@badgateway/oauth2-client';
import QrScannerPlugin, {calcAspectRatio} from '../../Components/QrScanner/QrScannerPlugin';
import {Typography} from '../../Components/Tailwind';
import db from '../../db/db';
import {addEvent, addRegistrationForm} from '../../db/utils';
import useAppState from '../../hooks/useAppState';
import {discoveryEndpoint, redirectURI} from '../Auth/utils';
import classes from './Events.module.css';

const AddEventPage = () => {
  const [hasPermission, setHasPermission] = useState(true);
  const [processing, setProcessing] = useState(false); // Determines if a QR Code is being processed
  const navigation = useNavigate();
  const {enableModal, showModal} = useAppState();

  const onScanResult = async (decodedText, _decodedResult) => {
    if (processing) {
      // Prevent multiple scans at the same time
      return;
    }
    setProcessing(true);

    // handle scanned result
    // parse json object and detect if it is a valid event
    let eventData;
    try {
      eventData = JSON.parse(decodedText);
    } catch (e) {
      enableModal('Error parsing the QRCode data', e?.message);
      setProcessing(false);
      return;
    }
    // console.log('event data: ', decodedText);

    const {event_id, title, date, regform_id, regform_title, server: serverData} = eventData;
    const {base_url, client_id, scope} = serverData || {
      base_url: null,
      client_id: null,
      scope: null,
    };

    // Check if these variables are null
    if (
      base_url == null ||
      client_id == null ||
      scope == null ||
      event_id == null ||
      title == null ||
      date == null ||
      regform_id == null ||
      regform_title == null
    ) {
      // The QRCode data is not complete, so ignore
      enableModal('QRCode Data is not valid', 'Some fields are missing. Please try again.');
      setProcessing(false);
      return;
    }

    // Check if the serverData is already in indexedDB
    const serverExists = await db.servers.get({base_url: base_url});
    if (serverExists) {
      // No need to perform authentication
      try {
        addEvent({id: event_id, title, date, server_base_url: base_url});

        addRegistrationForm({
          id: regform_id,
          eventId: event_id,
          title: regform_title,
        });

        // Navigate to homepage
        navigation('/');
      } catch (err) {
        console.log('Error adding data to IndexedDB: ', err);
        enableModal('Error adding data to the DB', err?.message);
      }
      setProcessing(false);
      return;
    }

    console.log("Server doesn't exist in IndexedDB. Proceeding to authentication...");
    // Perform OAuth2 Authorization Code Flow
    const client = new OAuth2Client({
      server: base_url,
      clientId: client_id,
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

    // In a browser this might work as follows:
    const authRes = await client.authorizationCode.getAuthorizeUri({
      // URL in the app that the user should get redirected to after authenticating
      redirectUri: redirectURI, // TODO: Check this later
      codeVerifier,
      scope: [scope],
    });
    // console.log('authRes: ', authRes);

    // Store the eventData in the browser's session storage. This is used later to verify the code challenge
    const sessionObj = structuredClone(eventData);
    sessionObj.codeVerifier = codeVerifier;
    const sessionStr = JSON.stringify(sessionObj);
    sessionStorage.setItem('eventData', sessionStr);

    setProcessing(false);

    // Redirect the user to the Authentication Server (OAuth2 Server)
    // Which will redirect the user back to the redirectUri (Back to the App)
    document.location = authRes;
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
