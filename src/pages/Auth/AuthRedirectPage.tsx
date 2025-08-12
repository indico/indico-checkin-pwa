import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {OAuth2Client} from '@badgateway/oauth2-client';
import {CheckCircleIcon} from '@heroicons/react/20/solid';
import {Button, Typography} from '../../Components/Tailwind';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import TopNav from '../../Components/TopNav';
import {addEvent, addRegform, addServer} from '../../db/db';
import useSettings from '../../hooks/useSettings';
import {isRecord} from '../../utils/typeguards';
import {wait} from '../../utils/wait';
import {discoveryEndpoint, QRCodeEventData, redirectUri, validateEventData} from './utils';

async function getToken(baseUrl: string, clientId: string, codeVerifier: string) {
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
  return await client.authorizationCode.getTokenFromCodeRedirect(document.location.href, {
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
  const {state} = useLocation();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<{title?: string; description?: string} | null>(null);
  const {customQRCodes, setCustomQRCodes} = useSettings();

  useEffect(() => {
    const onLoad = async () => {
      let eventData: QRCodeEventData | string | null = sessionStorage.getItem('eventData');
      const codeVerifier = sessionStorage.getItem('codeVerifier');
      sessionStorage.removeItem('eventData');
      sessionStorage.removeItem('codeVerifier');

      if (!eventData || !codeVerifier) {
        return;
      }

      try {
        eventData = JSON.parse(eventData) as QRCodeEventData;
      } catch {
        setError({title: 'Error parsing QR code data'});
        return;
      }

      if (!validateEventData(eventData)) {
        setError({title: 'Invalid QR Code data'});
        return;
      }

      const {
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
        oauth2Token = await getToken(baseUrl, clientId, codeVerifier);
      } catch (e) {
        setError({
          title: 'OAuth authorization failed',
          description: e instanceof Error ? e.message : '',
        });
        return;
      }

      if (!oauth2Token) {
        setError({title: 'Failed to obtain OAuth token'});
        return;
      }

      let eventId: number;
      try {
        const serverId = await addServer({
          baseUrl,
          clientId,
          scope,
          authToken: oauth2Token.accessToken,
        });
        eventId = await addEvent({
          indicoId: indicoEventId,
          serverId,
          baseUrl,
          title,
          date,
        });
        await addRegform({
          indicoId: indicoRegformId,
          eventId,
          title: regformTitle,
        });
      } catch (e) {
        setError({
          title: 'OAuth authorization failed',
          description: e instanceof Error ? e.message : '',
        });
        return;
      }

      if (eventData.customCodeHandlers && isRecord(eventData.customCodeHandlers)) {
        const customCodeHandlers = eventData.customCodeHandlers;
        let newCustomQRCodes = {...customQRCodes};
        for (const customCodeHandler in customCodeHandlers) {
          newCustomQRCodes = {
            ...newCustomQRCodes,
            [customCodeHandler]: {
              regex: customCodeHandlers[customCodeHandler],
              baseUrl: baseUrl,
            },
          };
        }
        setCustomQRCodes(newCustomQRCodes);
        localStorage.setItem('customQRCodes', JSON.stringify(newCustomQRCodes));
      }

      setSuccess(true);
      await wait(2000).then(() =>
        navigate(`/event/${eventId}`, {
          replace: true,
          state,
        })
      );
    };

    onLoad();
  }, [navigate, state]);

  if (error) {
    return (
      <>
        <TopNav />
        <div className="mx-4 rounded-xl bg-gray-100 dark:bg-gray-800">
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl p-6">
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
        <TopNav />
        <div className="mx-4 rounded-xl bg-gray-100 dark:bg-gray-800">
          <div className="relative flex flex-col items-center justify-center gap-4 rounded-xl px-6 pb-36 pt-10">
            <Typography variant="h3">Authenticating..</Typography>
            <div className="relative">
              <div
                className={`absolute left-1/2 -translate-x-1/2 transition delay-1000 ease-linear ${
                  success ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <LoadingIndicator size="lg" />
              </div>
              <CheckCircleIcon
                className={`absolute left-1/2 top-[-0.5rem] w-28 -translate-x-1/2 text-green-500 transition
                            delay-1000 ease-linear ${success ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
          </div>
        </div>
      </>
    );
  }
};

export default AuthRedirectPage;
