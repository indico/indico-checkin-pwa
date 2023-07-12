import {useEffect} from 'react';
import {OAuth2Client} from '@badgateway/oauth2-client';
import {addEvent, addServer} from '../../db/utils';
import {discoveryEndpoint, redirectURI} from './utils';

const AuthRedirectPage = () => {
  useEffect(() => {
    const onLoad = async () => {
      // Get the code verifier, base_url and client_id from the browser's session storage
      const codeVerifier = sessionStorage.getItem('codeVerifier');
      const base_url = sessionStorage.getItem('base_url');
      const client_id = sessionStorage.getItem('client_id');
      const scope = sessionStorage.getItem('scope');
      console.log('SessionStorage data: ', codeVerifier, base_url, client_id, scope);

      // Check if these variables are null
      if (codeVerifier === null || base_url === null || client_id === null || scope === null) {
        // The user is not authenticated, so ignore
        return;
      }

      // Delete the code verifier from the browser's session storage
      sessionStorage.removeItem('codeVerifier');
      sessionStorage.removeItem('base_url');
      sessionStorage.removeItem('client_id');
      sessionStorage.removeItem('scope');

      const client = new OAuth2Client({
        server: base_url,
        clientId: client_id,
        discoveryEndpoint: discoveryEndpoint,
        fetch: window.fetch.bind(window), // Use the browser's native fetch API   TODO: Confirm this is correct

        // The tokenEndpoint and authorizationEndpoint are optional and will be inferred from the server's discovery document if not provided
        authorizationEndpoint: 'https://sg1.cern.ch/oauth/authorize',
        tokenEndpoint: 'https://sg1.cern.ch/oauth/token',
      });

      // The user is now at the redirectUri (Back to the App), so we can now get the access token
      const oauth2Token = await client.authorizationCode.getTokenFromCodeRedirect(
        document.location,
        {
          /**
           * The redirect URI is not actually used for any redirects, but MUST be the
           * same as what you passed earlier to "authorizationCode"
           */
          redirectUri: redirectURI,
          codeVerifier,
        }
      );

      // Check if there is a token
      if (oauth2Token.accessToken === null) {
        // The user is not authenticated, so ignore
        return;
      }

      // Store the data in IndexedDB
      try {
        // Add the server to IndexedDB if it doesn't already exist
        addServer({base_url, client_id, scope, auth_token: oauth2Token.accessToken});

        // Add the Event to IndexedDB
        // addEvent()
      } catch (err) {
        console.log('Error adding data to IndexedDB: ', err);
      }
    };

    onLoad(); // Run on page load
  }, []);

  return <div>Auth Redirect page</div>;
};

export default AuthRedirectPage;
