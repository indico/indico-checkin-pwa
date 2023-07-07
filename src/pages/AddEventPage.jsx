import {useState} from 'react';
import {OAuth2Client, generateCodeVerifier} from '@badgateway/oauth2-client';
import QrScannerPlugin from '../Components/QrScannerPlugin';
import {Typography} from '../Components/Tailwind';

const redirectURI = 'https://localhost:3000';

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

    console.log('server data:', base_url, client_id);
    // Perform OAuth2 Authorization Code Flow
    const client = new OAuth2Client({
      server: base_url,
      clientId: client_id,
      discoveryEndpoint: '.well-known/oauth-authorization-server',
      fetch: window.fetch.bind(window), // Use the browser's native fetch API   TODO: Confirm this is correct

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

    console.log('Going to perform authentication...');
    // In a browser this might work as follows:
    const authRes = await client.authorizationCode.getAuthorizeUri({
      // URL in the app that the user should get redirected to after authenticating
      redirectUri: redirectURI, // TODO: Check this later
      codeVerifier,
      scope: [scope],
    });
    console.log('authRes: ', authRes);
    document.location = authRes;
    // todo: find a react example to redirect and get the code

    console.log('Finished redirect...');
    console.log('document location:', document.location);

    // The user is now at the redirectUri (Back to the App), so we can now get the access token
    const oauth2Token = await client.authorizationCode.getTokenFromCodeRedirect(document.location, {
      /**
       * The redirect URI is not actually used for any redirects, but MUST be the
       * same as what you passed earlier to "authorizationCode"
       */
      redirectUri: redirectURI,
      codeVerifier,
    });

    console.log('oauth2Token: ', oauth2Token);

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
