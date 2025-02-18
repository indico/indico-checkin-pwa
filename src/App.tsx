import './App.css';
import {useEffect, lazy, Suspense} from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Params,
  Outlet,
  useLocation,
  ScrollRestoration,
} from 'react-router-dom';
import BottomNav from './Components/BottomNav';
import Modal from './Components/Tailwind/Modal/Modal';
import db, {
  getEvent,
  getEvents,
  getParticipant,
  getRegform,
  getRegforms,
  getServers,
  countParticipants,
} from './db/db';
import {useLogError} from './hooks/useError';
import useSettings from './hooks/useSettings';
import AuthRedirectPage from './pages/Auth/AuthRedirectPage';
import EventPage from './pages/event/EventPage';
import Homepage from './pages/home/Homepage';
import LoadingFallback from './pages/LoadingFallback';
import {NotFoundPage} from './pages/NotFound';
import ParticipantPage from './pages/participant/ParticipantPage';
import RegformPage from './pages/regform/RegformPage';
import CheckinConfirmation from './pages/scan/CheckinConfirmation';
import SettingsPage from './pages/Settings';

// Expose the db instance as a global variable for easier debugging
(window as typeof window & {db: typeof db}).db = db;

const ScanPage = lazy(() => import('./pages/scan/Scan'));
const SelfScan = lazy(() => import('./pages/scan/SelfScan'));

function isNumeric(v?: string) {
  return v && /^[1-9]\d*$/.test(v);
}

const getNumericParams = (params: Params) => {
  const numeric = ['eventId', 'regformId', 'participantId'];

  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (numeric.includes(key) && !isNumeric(value)) {
        throw new TypeError(`Invalid url parameter ${key}: <${value}>`);
      }
      return [key, Number(value)];
    })
  );
};

function RootPage() {
  const {pathname} = useLocation();
  const bottomNavVisible =
    pathname !== '/scan' &&
    pathname !== '/selfscan' &&
    pathname !== '/auth/redirect' &&
    !pathname.startsWith('/checkin-confirmation/');

  return (
    <>
      <ScrollRestoration />
      <Outlet />
      {bottomNavVisible && <BottomNav />}
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootPage />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '/',
        element: <Homepage />,
        loader: async () => {
          const servers = await getServers();
          const events = await getEvents();
          const regforms = await getRegforms();
          return {servers, events, regforms};
        },
      },
      {
        path: '/event/:eventId',
        element: <EventPage />,
        loader: async ({params}) => {
          const {eventId} = getNumericParams(params);
          const event = await getEvent(eventId);
          const regforms = await getRegforms(eventId);
          return {event, regforms, params: {eventId}};
        },
      },
      {
        path: '/event/:id/:regformId',
        element: <RegformPage />,
        loader: async ({params}) => {
          const {id: eventId, regformId} = getNumericParams(params);
          const event = await getEvent(eventId);
          const regform = await getRegform({id: regformId, eventId});
          const participantCount = await countParticipants(regformId);
          return {event, regform, participantCount, params: {eventId, regformId}};
        },
      },
      {
        path: '/event/:id/:regformId/:participantId',
        element: <ParticipantPage />,
        loader: async ({params}) => {
          const {id: eventId, regformId, participantId} = getNumericParams(params);
          const event = await getEvent(eventId);
          const regform = await getRegform({id: regformId, eventId});
          const participant = await getParticipant({id: participantId, regformId});
          return {event, regform, participant, params: {eventId, regformId, participantId}};
        },
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      {
        path: '/scan',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ScanPage />
          </Suspense>
        ),
      },
      {
        path: '/selfscan',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SelfScan />
          </Suspense>
        ),
      },
      {
        path: '/auth/redirect',
        element: <AuthRedirectPage />,
      },
      {
        path: '/checkin-confirmation/:eventId/:regformId/:participantId',
        element: <CheckinConfirmation />,
        loader: async ({params}) => {
          const {eventId, regformId, participantId} = getNumericParams(params);
          const event = await getEvent(eventId);
          const regform = await getRegform({id: regformId, eventId});
          const participant = await getParticipant({id: participantId, regformId});
          return {event, regform, participant};
        },
      },
    ],
  },
]);

export default function App() {
  const {darkMode} = useSettings();
  const logError = useLogError();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    function onError(event: ErrorEvent) {
      logError(event.error);
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      logError(event.reason);
    }

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, [logError]);

  return (
    <div className="h-full min-h-screen w-screen overflow-auto bg-gray-50 pb-32 dark:bg-gray-900">
      <RouterProvider router={router} />
      <Modal />
    </div>
  );
}
