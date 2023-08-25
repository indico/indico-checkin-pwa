import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {OAuth2Client} from '@badgateway/oauth2-client';
import {CheckCircleIcon} from '@heroicons/react/20/solid';
import {Button, Typography} from '../../Components/Tailwind';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import {addEvent, addRegistrationForm, addServer} from '../../db/utils';
import {discoveryEndpoint, redirectURI, validateQRCodeData} from './utils';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const AuthRedirectPage = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onLoad = async () => {
      let eventData = sessionStorage.getItem('eventData');
      sessionStorage.removeItem('eventData');

      if (!eventData) {
        return;
      }

      try {
        eventData = JSON.parse(eventData);
      } catch (err) {
        setError({title: 'Error parsing QR code data'});
        return;
      }

      if (!validateQRCodeData(eventData)) {
        setError({title: 'Invalid QR Code data'});
        return;
      }

      const {
        codeVerifier,
        eventId,
        regformId,
        title,
        date,
        regformTitle,
        server: {baseUrl, clientId, scope},
      } = eventData;

      const client = new OAuth2Client({
        server: baseUrl,
        clientId: clientId,
        discoveryEndpoint: discoveryEndpoint,
        fetch: window.fetch.bind(window), // Use the browser's native fetch API   TODO: Confirm this is correct

        // The tokenEndpoint and authorizationEndpoint are optional and will be inferred from the server's discovery document if not provided
        authorizationEndpoint: 'https://sg1.cern.ch/oauth/authorize',
        tokenEndpoint: 'https://sg1.cern.ch/oauth/token',
      });

      // The user is now at the redirectUri (Back to the App), so we can now get the access token
      let oauth2Token;
      try {
        oauth2Token = await client.authorizationCode.getTokenFromCodeRedirect(document.location, {
          /**
           * The redirect URI is not actually used for any redirects, but MUST be the
           * same as what you passed earlier to "authorizationCode"
           */
          redirectUri: redirectURI,
          codeVerifier,
        });
      } catch (err) {
        setError({title: 'OAuth authorization failed', description: err.message});
        return;
      }

      if (!oauth2Token) {
        setError({title: 'Failed to obtain OAuth token'});
        return;
      }

      try {
        const serverId = await addServer({
          baseUrl,
          clientId,
          scope,
          authToken: oauth2Token.accessToken,
        });
        await addEvent({id: eventId, serverId, title, date});
        await addRegistrationForm({
          id: regformId,
          eventId: eventId,
          title: regformTitle,
        });
      } catch (err) {
        setError({title: 'OAuth authorization failed', description: err.message});
        return;
      }

      setSuccess(true);
      await wait(2000).then(() => navigate(`/event/${eventId}`));
    };

    onLoad(); // Run on page load
  }, [navigate]);

  if (error) {
    return (
      <div className="mx-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="flex flex-col items-center justify-center p-6 rounded-xl gap-2">
          <Typography variant="h3">{error.title}</Typography>
          <Typography variant="body1">{error.description}</Typography>
          <Button className="mt-4" onClick={() => navigate('/event/new')}>
            Try again
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="mx-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="relative flex flex-col items-center justify-center gap-4 px-6 pt-10 pb-36 rounded-xl">
          <Typography variant="h3">Authenticating..</Typography>
          <div className="relative">
            <div
              className={`absolute left-1/2 -translate-x-1/2 transition ease-linear delay-1000 ${
                success ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <LoadingIndicator size="lg" />
            </div>
            <CheckCircleIcon
              className={`absolute top-[-0.5rem] left-1/2 -translate-x-1/2 w-28 text-green-500 transition ease-linear delay-1000 ${
                success ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default AuthRedirectPage;
