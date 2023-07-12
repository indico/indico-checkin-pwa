import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {OAuth2Client, generateCodeVerifier} from '@badgateway/oauth2-client';
import QrScannerPlugin from '../Components/QrScannerPlugin';
import {Typography} from '../Components/Tailwind';
import db from '../db/db';
import {addEvent, addRegistrationForm} from '../db/utils';
import {discoveryEndpoint, redirectURI} from './Auth/utils';

const AddEventPage = () => {
  const [data, setData] = useState('No Result');
  const [hasPermission, setHasPermission] = useState(true);

  const navigation = useNavigate();

  const onScanResult = async (decodedText, _decodedResult) => {
    // handle scanned result
    // parse json object and detect if it is a valid event
    let eventData;
    try {
      eventData = JSON.parse(decodedText);
    } catch (e) {
      console.error('error parsing JSON', e);
      return;
    }
    console.log('event data: ', decodedText);

    const {
      event_id,
      title,
      date,
      regform_id,
      regform_title,
      server: {base_url, client_id, scope},
    } = eventData;

    // Check if the serverData is already in indexedDB
    const serverExists = await db.servers.get({base_url: base_url});
    if (serverExists) {
      // No need to perform authentication
      try {
        addEvent({id: event_id, title, date, server_base_url: base_url});

        addRegistrationForm({
          id: regform_id,
          label: regform_title,
          event_id: event_id,
          participants: [],
        });

        // Navigate to homepage
        navigation('/');
      } catch (err) {
        console.log('Error adding data to IndexedDB: ', err);
      }
      return;
    }

    // Perform OAuth2 Authorization Code Flow
    const client = new OAuth2Client({
      server: base_url,
      clientId: client_id,
      discoveryEndpoint: discoveryEndpoint,
      fetch: window.fetch.bind(window), // Use the browser's native fetch API   TODO: Confirm this is correct

      // TODO: Remove these hard-coded values after CORS issues are solved
      // The tokenEndpoint and authorizationEndpoint are optional and will be inferred from the server's discovery document if not provided
      authorizationEndpoint: 'https://sg1.cern.ch/oauth/authorize',
      tokenEndpoint: 'https://sg1.cern.ch/oauth/token',
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
    console.log('authRes: ', authRes);

    // Store the eventData in the browser's session storage. This is used later to verify the code challenge
    const sessionObj = structuredClone(eventData);
    sessionObj.codeVerifier = codeVerifier;
    const sessionStr = JSON.stringify(sessionObj);
    sessionStorage.setItem('eventData', sessionStr);

    // Redirect the user to the Authentication Server (OAuth2 Server)
    // Which will redirect the user back to the redirectUri (Back to the App)
    document.location = authRes;
  };

  const onPermRefused = () => {
    setHasPermission(false);
  };

  return (
    <div>
      <div className="justify-center items-center flex py-6">
        <Typography variant="h4" color="white">
          Scan the Event QR Code
        </Typography>
      </div>

      <QrScannerPlugin
        fps={10}
        qrbox={250}
        aspectRatio={1}
        disableFlip={false}
        qrCodeSuccessCallback={onScanResult}
        onPermRefused={onPermRefused}
      />

      <div className="justify-center items-center flex py-6 mx-6">
        <Typography variant="body1" className="text-center">
          {hasPermission
            ? data
            : 'Please give permission to access the camera and refresh the page'}
        </Typography>
      </div>
    </div>
  );
};

export default AddEventPage;
