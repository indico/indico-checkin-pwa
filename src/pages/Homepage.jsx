import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {CalendarDaysIcon, ServerStackIcon} from '@heroicons/react/20/solid';
import {useLiveQuery} from 'dexie-react-hooks';
import EventItem from '../Components/Events/EventItem.tsx';
import {Typography} from '../Components/Tailwind/index.jsx';
import TopTab from '../Components/TopTab.jsx';
import db from '../db/db';
import useAppState from '../hooks/useAppState';
import {wait} from '../utils/wait.ts';
import {syncEvents} from './Events/sync.js';

const Homepage = () => {
  const navigate = useNavigate();
  const {enableModal} = useAppState();
  const servers = useLiveQuery(() => db.servers.toArray());
  const events = useLiveQuery(() => db.events.toArray());
  const regforms = useLiveQuery(() => db.regforms.toArray());

  useEffect(() => {
    const controller = new AbortController();

    async function sync() {
      const events = await db.events.toArray();
      syncEvents(events, controller.signal, enableModal);
    }

    sync().catch(err => enableModal('Something went wrong when updating events', err.message));
    return () => controller.abort();
  }, [enableModal]);

  const navigateToEvent = async event => {
    await wait(100);
    navigate(`/event/${event.id}`);
  };

  // Still loading
  if (!servers || !events || !regforms) {
    return null;
  }

  const serversById = servers.reduce((acc, server) => {
    acc[server.id] = server;
    return acc;
  }, {});

  const eventsByServer = events.reduce((acc, event) => {
    if (!acc[event.serverId]) {
      acc[event.serverId] = [];
    }
    acc[event.serverId].push(event);
    return acc;
  }, {});

  const regformsByEvent = regforms.reduce((acc, regform) => {
    acc[regform.eventId] = (acc[regform.eventId] || 0) + 1;
    return acc;
  }, {});

  if (events.length === 0) {
    return (
      <>
        <TopTab />
        <NoEventsBanner />
      </>
    );
  }

  if (servers.length === 1) {
    return (
      <>
        <TopTab />
        <div className="flex flex-col gap-4 px-4 pt-1">
          {events.map(event => {
            return (
              <EventItem
                key={event.id}
                event={event}
                onClick={() => navigateToEvent(event)}
                quantity={regformsByEvent[event.id]}
              />
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <TopTab />
      <div className="flex flex-col gap-8 px-4 pt-1">
        {Object.entries(eventsByServer).map(([serverId, events]) => {
          const server = serversById[serverId];
          const host = new URL(server.baseUrl).host;
          return (
            <div key={serverId} className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <ServerStackIcon className="w-5 text-gray-700 dark:text-gray-400" />
                <Typography variant="body2">{host}</Typography>
              </div>
              <div className="flex flex-col gap-4">
                {events.map(event => {
                  return (
                    <EventItem
                      key={event.id}
                      event={event}
                      onClick={() => navigateToEvent(event)}
                      quantity={regformsByEvent[event.id]}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Homepage;

function NoEventsBanner() {
  return (
    <div
      className="flex items-center justify-center text-center mx-4 p-6
             aspect-square m-auto rounded-xl bg-gray-100 dark:bg-gray-800"
    >
      <div className="flex flex-col gap-2 justify-center">
        <CalendarDaysIcon className="w-20 self-center text-gray-500 dark:text-gray-400" />
        <Typography variant="h2">No events found</Typography>
        <Typography variant="body1">Scan a QR code to add one</Typography>
      </div>
    </div>
  );
}
