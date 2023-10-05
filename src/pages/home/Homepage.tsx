import {useEffect} from 'react';
import {CalendarDaysIcon, ServerStackIcon} from '@heroicons/react/20/solid';
import BottomNav from '../../Components/BottomNav';
import {Typography} from '../../Components/Tailwind';
import TopNav from '../../Components/TopNav';
import db, {Event, Regform, Server} from '../../db/db';
import {useErrorModal} from '../../hooks/useModal';
import {useQuery, isLoading} from '../../utils/db';
import {syncEvents} from '../Events/sync';
import EventItem from './EventItem';

export default function Homepage() {
  return (
    <>
      <TopNav />
      <HomepageContent />
      <BottomNav backBtnText="Home" />
    </>
  );
}

function HomepageContent() {
  const errorModal = useErrorModal();
  const servers = useQuery(() => db.servers.toArray());
  const events = useQuery(() => db.events.toArray());
  const regforms = useQuery(() => db.regforms.toArray());

  useEffect(() => {
    const controller = new AbortController();

    async function sync() {
      const events = await db.events.toArray();
      await syncEvents(events, controller.signal, errorModal);
    }

    sync().catch(err =>
      errorModal({title: 'Something went wrong when updating events', content: err.message})
    );
    return () => controller.abort();
  }, [errorModal]);

  if (isLoading(servers) || isLoading(events) || isLoading(regforms)) {
    return null;
  }

  if (events.length === 0) {
    return <NoEventsBanner />;
  } else if (servers.length === 1) {
    return <SingleServerList events={events} regforms={regforms} />;
  } else {
    return <MultipleServerList servers={servers} events={events} regforms={regforms} />;
  }
}

function NoEventsBanner() {
  return (
    <div
      className="m-auto mx-4 flex items-center justify-center rounded-xl
                 bg-gray-100 p-6 text-center dark:bg-gray-800"
    >
      <div className="flex flex-col justify-center gap-2">
        <CalendarDaysIcon className="w-20 self-center text-gray-500 dark:text-gray-400" />
        <Typography variant="h2">No events found</Typography>
        <Typography variant="body1">Scan a QR code to add one</Typography>
      </div>
    </div>
  );
}

function SingleServerList({events, regforms}: {events: Event[]; regforms: Regform[]}) {
  const regformCount = countRegforms(regforms);

  return (
    <div className="px-4 pt-2">
      <EventList events={events} regformCount={regformCount} />
    </div>
  );
}

function MultipleServerList({
  servers,
  events,
  regforms,
}: {
  servers: Server[];
  events: Event[];
  regforms: Regform[];
}) {
  const serversById = groupServersById(servers);
  const eventsByServer = groupEventsByServer(events);
  const regformCount = countRegforms(regforms);

  return (
    <div className="flex flex-col gap-8 px-4 pt-2">
      {Object.entries(eventsByServer).map(([serverId, events]) => {
        const server = serversById[Number(serverId)];
        const host = new URL(server.baseUrl).host;
        return (
          <div key={serverId} className="flex flex-col gap-4">
            <ServerTitle host={host} />
            <EventList events={events} regformCount={regformCount} />
          </div>
        );
      })}
    </div>
  );
}

function ServerTitle({host}: {host: string}) {
  return (
    <div className="flex items-center gap-2">
      <ServerStackIcon className="w-5 text-gray-700 dark:text-gray-400" />
      <Typography variant="body2">{host}</Typography>
    </div>
  );
}

function EventList({
  events,
  regformCount,
}: {
  events: Event[];
  regformCount: {[key: number]: number};
}) {
  return (
    <div className="flex flex-col gap-4">
      {events.map(event => (
        <EventItem key={event.id} event={event} regformCount={regformCount[event.id!] || 0} />
      ))}
    </div>
  );
}

function countRegforms(regforms: Regform[]) {
  interface Map {
    [key: number]: number;
  }

  return regforms.reduce((acc, regform) => {
    acc[regform.eventId] = (acc[regform.eventId] || 0) + 1;
    return acc;
  }, {} as Map);
}

function groupServersById(servers: Server[]) {
  interface ServerMap {
    [key: number]: Server;
  }

  return servers.reduce((acc, server) => {
    acc[server.id!] = server;
    return acc;
  }, {} as ServerMap);
}

function groupEventsByServer(events: Event[]) {
  interface EventMap {
    [key: number]: Event[];
  }

  return events.reduce((acc, event) => {
    if (!acc[event.serverId]) {
      acc[event.serverId] = [];
    }
    acc[event.serverId].push(event);
    return acc;
  }, {} as EventMap);
}
