import {useEffect} from 'react';
import {OAuth2Client} from '@badgateway/oauth2-client';

const redirectURI = 'https://localhost:3000/auth/redirect';

const AuthRedirectPage = () => {
  useEffect(() => {
    const onLoad = async () => {
      // TODO: Store these between pages    (Session Storage? or Local)
      const base_url = 'https://sg1.cern.ch';
      const client_id = '50c37253-7b86-4368-8635-bfc534e810e2';

      const client = new OAuth2Client({
        server: base_url,
        clientId: client_id,
        discoveryEndpoint: '.well-known/oauth-authorization-server',
        fetch: window.fetch.bind(window), // Use the browser's native fetch API   TODO: Confirm this is correct

        // The tokenEndpoint and authorizationEndpoint are optional and will be inferred from the server's discovery document if not provided
        authorizationEndpoint: 'https://sg1.cern.ch/oauth/authorize',
        tokenEndpoint: 'https://sg1.cern.ch/oauth/token',
      });

      // Get the code verifier from the browser's session storage
      const codeVerifier = sessionStorage.getItem('codeVerifier');
      console.log('SessionStorage codeVerifier: ', codeVerifier);
      // Delete the code verifier from the browser's session storage
      sessionStorage.removeItem('codeVerifier');

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

      console.log('oauth2Token: ', oauth2Token);

      // setData(decodedText);
    };

    onLoad(); // Run on page load
  }, []);

  return <div>Auth Redirect page</div>;
};

export default AuthRedirectPage;
