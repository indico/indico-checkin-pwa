import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {OAuth2Client} from '@badgateway/oauth2-client';
import {addEvent, addRegistrationForm, addServer} from '../../db/utils';
import {discoveryEndpoint, redirectURI} from './utils';

const AuthRedirectPage = () => {
  const navigation = useNavigate();

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
        regform_id,
        regform_title,
        server: {base_url, client_id, scope},
      } = sessionStorageData;
      // console.log('SessionStorage data: ', sessionStorageData);

      // Check if these variables are null
      if (
        codeVerifier === null ||
        base_url === null ||
        client_id === null ||
        scope === null ||
        event_id === null ||
        title === null ||
        date === null ||
        regform_id === null ||
        regform_title === null
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
        addServer({base_url, client_id, scope, auth_token: oauth2Token.accessToken});

        addEvent({id: event_id, title, date, server_base_url: base_url});

        addRegistrationForm({
          id: regform_id,
          label: regform_title,
          event_id: event_id,
          participants: [],
        });

        navigation('/');
      } catch (err) {
        console.log('Error adding data to IndexedDB: ', err);
      }
    };

    onLoad(); // Run on page load
  }, [navigation]);

  return <div>Auth Redirect page</div>;
};

export default AuthRedirectPage;
