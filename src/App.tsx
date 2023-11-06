import './App.css';
import {useEffect, lazy, Suspense} from 'react';
import {createBrowserRouter, RouterProvider, Params} from 'react-router-dom';
import Modal from './Components/Tailwind/Modal/Modal';
import db, {
  getEvent,
  getEvents,
  getParticipant,
  getParticipants,
  getRegform,
  getRegforms,
  getServers,
} from './db/db';
import useSettings from './hooks/useSettings';
import AuthRedirectPage from './pages/Auth/AuthRedirectPage';
import EventPage from './pages/event/EventPage';
import Homepage from './pages/home/Homepage';
import LoadingFallback from './pages/LoadingFallback';
import {NotFoundPage} from './pages/NotFound';
import ParticipantPage from './pages/participant/ParticipantPage';
import RegformPage from './pages/regform/RegformPage';
import SettingsPage from './pages/Settings';

// Expose the db instance as a global variable for easier debugging
(window as any).db = db;

const ScanPage = lazy(() => import('./pages/scan/Scan'));

function isNumeric(v?: string) {
  return v && /^[1-9]\d*$/.test(v);
}

const getNumericParams = (params: Params) => {
  const numeric = ['eventId', 'regformId', 'participantId'];

  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (numeric.includes(key) && !isNumeric(value)) {
        throw new TypeError(`Invalid param ${key}: <${value}>`);
      }
      return [key, Number(value)];
    })
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Homepage />,
    errorElement: <NotFoundPage />,
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
    errorElement: <NotFoundPage />,
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
    errorElement: <NotFoundPage />,
    loader: async ({params}) => {
      const {id: eventId, regformId} = getNumericParams(params);
      const event = await getEvent(eventId);
      const regform = await getRegform({id: regformId, eventId});
      const participants = await getParticipants(regformId);
      return {event, regform, participants, params: {eventId, regformId}};
    },
  },
  {
    path: '/event/:id/:regformId/:participantId',
    element: <ParticipantPage />,
    errorElement: <NotFoundPage />,
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
    path: '/auth/redirect',
    element: <AuthRedirectPage />,
  },
]);

export default function App() {
  const {darkMode} = useSettings();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="h-full min-h-screen w-screen overflow-auto bg-gray-50 pb-32 dark:bg-gray-900">
      <RouterProvider router={router} />
      <Modal />
    </div>
  );
}
