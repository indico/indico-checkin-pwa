import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {OAuth2Client} from '@badgateway/oauth2-client';
import {CheckCircleIcon} from '@heroicons/react/20/solid';
import {Button, Typography} from '../../Components/Tailwind';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import TopTab from '../../Components/TopTab';
import db from '../../db/db';
import {discoveryEndpoint, redirectUri, validateEventData} from './utils';

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getToken({baseUrl, clientId}, codeVerifier) {
  const client = new OAuth2Client({
    server: baseUrl,
    clientId: clientId,
    discoveryEndpoint: discoveryEndpoint,
    fetch: fetch.bind(window),
    // XXX Need to manually specify, otherwise this will be 'client_secret_basic' which
    // doesn't work with Indico even though it is listed in '.well-known/oauth-authorization-server'
    authenticationMethod: 'client_secret_post',
  });

  // The user is now at the redirectUri (Back to the App), so we can now get the access token
  return await client.authorizationCode.getTokenFromCodeRedirect(document.location, {
    /**
     * The redirect URI is not actually used for any redirects, but MUST be the
     * same as what you passed earlier to "authorizationCode"
     */
    redirectUri,
    codeVerifier,
  });
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

      if (!validateEventData(eventData)) {
        setError({title: 'Invalid QR Code data'});
        return;
      }

      const {
        codeVerifier,
        eventId: indicoEventId,
        regformId: indicoRegformId,
        title,
        date,
        regformTitle,
        server: {baseUrl, clientId, scope},
      } = eventData;

      // The user is now at the redirectUri (Back to the App), so we can now get the access token
      let oauth2Token;
      try {
        oauth2Token = await getToken(eventData.server, codeVerifier);
      } catch (err) {
        setError({title: 'OAuth authorization failed', description: err.message});
        return;
      }

      if (!oauth2Token) {
        setError({title: 'Failed to obtain OAuth token'});
        return;
      }

      let eventId;
      try {
        const serverId = await db.servers.add({
          baseUrl,
          clientId,
          scope,
          authToken: oauth2Token.accessToken,
        });
        eventId = await db.events.add({
          indicoId: indicoEventId,
          serverId,
          baseUrl,
          title,
          date,
          deleted: false,
        });
        await db.regforms.add({
          indicoId: indicoRegformId,
          eventId,
          title: regformTitle,
          registrationCount: 0,
          checkedInCount: 0,
          deleted: false,
        });
      } catch (err) {
        setError({title: 'OAuth authorization failed', description: err.message});
        return;
      }

      setSuccess(true);
      await wait(2000).then(() => navigate(`/event/${eventId}`, {replace: true}));
    };

    onLoad();
  }, [navigate]);

  if (error) {
    return (
      <>
        <TopTab />
        <div className="mx-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <div className="flex flex-col items-center justify-center p-6 rounded-xl gap-2">
            <Typography variant="h3">{error.title}</Typography>
            <Typography variant="body1">{error.description}</Typography>
            <Button className="mt-4" onClick={() => navigate('/scan', {replace: true})}>
              Try again
            </Button>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <TopTab />
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
                className={`absolute top-[-0.5rem] left-1/2 -translate-x-1/2 w-28 text-green-500 transition
                            ease-linear delay-1000 ${success ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default AuthRedirectPage;
