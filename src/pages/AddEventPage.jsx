import {useState} from 'react';
import {OAuth2Client, generateCodeVerifier} from '@badgateway/oauth2-client';
import QrScannerPlugin from '../Components/QrScannerPlugin';
import {Typography} from '../Components/Tailwind';

const AddEventPage = () => {
  const [data, setData] = useState('No Result');
  const [hasPermission, setHasPermission] = useState(true);

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
    console.log('event data: ', eventData);

    const {
      event_id,
      title,
      date,
      server: {base_url, client_id, scope},
    } = eventData;

    // Perform OAuth2 Authorization Code Flow
    const client = new OAuth2Client({
      server: base_url,
      clientId: client_id,
      discoveryEndpoint: '.well-known/oauth-authorization-server',
      fetch: window.fetch.bind(window), // Use the browser's native fetch API   TODO: Confirm this is correct

      // The tokenEndpoint and authorizationEndpoint are optional and will be inferred from the server's discovery document if not provided
      authorizationEndpoint: 'https://indico.cern.ch/oauth/authorize',
      tokenEndpoint: 'https://indico.cern.ch/oauth/token',
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
    document.location = await client.authorizationCode.getAuthorizeUri({
      // URL in the app that the user should get redirected to after authenticating
      redirectUri: 'https://localhost:3000',

      // Optional string that can be sent along to the auth server. This value will
      // be sent along with the redirect back to the app verbatim.
      state: 'some-string',

      codeVerifier,

      scope: [scope],
    });

    setData(decodedText);
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
