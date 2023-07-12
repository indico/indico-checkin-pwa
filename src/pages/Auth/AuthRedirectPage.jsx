import {useEffect} from 'react';
import {OAuth2Client} from '@badgateway/oauth2-client';
import {addEvent, addServer} from '../../db/utils';
import {discoveryEndpoint, redirectURI} from './utils';

const AuthRedirectPage = () => {
  useEffect(() => {
    const onLoad = async () => {
      // Get the event data from the browser's session storage
      const sessionStorageData = JSON.parse(sessionStorage.getItem('eventData'));
      if (sessionStorageData === null) {
        // The eventData is not in the browser's session storage, so ignore
        return;
      }

      const {
        codeVerifier,
        event_id,
        title,
        date,
        server: {base_url, client_id, scope},
      } = sessionStorageData;
      console.log('SessionStorage data: ', sessionStorageData);

      // Check if these variables are null
      if (
        codeVerifier === null ||
        base_url === null ||
        client_id === null ||
        scope === null ||
        event_id === null ||
        title === null ||
        date === null
      ) {
        // The stored data is not complete, so ignore
        return;
      }

      // Delete the eventData from the browser's session storage
      sessionStorage.removeItem('eventData');

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

        // Add the Event to IndexedDB if it doesn't already exist
        // TODO: Change to logic to add RegistrationForm even if event already exists
        addEvent({id: event_id, title, date, server_base_url: base_url});
      } catch (err) {
        console.log('Error adding data to IndexedDB: ', err);
      }
    };

    onLoad(); // Run on page load
  }, []);

  return <div>Auth Redirect page</div>;
};

export default AuthRedirectPage;
