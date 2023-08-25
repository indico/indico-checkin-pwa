import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {QrCodeIcon, CalendarDaysIcon} from '@heroicons/react/20/solid';
import {useLiveQuery} from 'dexie-react-hooks';
import EventItem from '../Components/Events/EventItem.tsx';
import {Button, Typography} from '../Components/Tailwind/index.jsx';
import db from '../db/db';
import useAppState from '../hooks/useAppState';
import {refreshEvents} from './Events/refresh.js';

const Homepage = () => {
  const navigate = useNavigate();
  const {enableModal} = useAppState();
  const events = useLiveQuery(() => db.events.toArray());
  const regforms = useLiveQuery(() => db.regForms.toArray());

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      const events = await db.events.toArray();
      refreshEvents(events, controller.signal, enableModal);
    }

    refresh().catch(err => enableModal('Something went wrong when updating events', err.message));
    return () => controller.abort();
  }, [enableModal]);

  const navigateToEvent = event => {
    navigate(`/event/${event.id}`, {state: {autoRedirect: true}});
  };

  const onAddEvent = () => {
    navigate('/event/new');
  };

  // Still loading
  if (!events || !regforms) {
    return null;
  }

  const regformsByEvent = regforms.reduce((acc, regform) => {
    acc[regform.eventId] = (acc[regform.eventId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="px-4 pt-1">
      {events.length > 0 && (
        <>
          <div className="flex flex-row justify-between items-center">
            <Typography variant="h3">Events</Typography>
            <Button onClick={onAddEvent}>
              <QrCodeIcon className="min-w-[1.25rem] h-5" />
              Add event
            </Button>
          </div>
          <div className="mt-6 flex flex-col gap-4">
            {events.map(event => {
              return (
                <EventItem
                  key={event.id}
                  item={event}
                  onClick={() => navigateToEvent(event)}
                  quantity={regformsByEvent[event.id]}
                />
              );
            })}
          </div>
        </>
      )}
      {events.length === 0 && (
        <div
          className="mt-0 flex items-center justify-center text-center p-6
                     aspect-square m-auto rounded-xl bg-gray-100 dark:bg-gray-800"
        >
          <div className="flex flex-col gap-2 justify-center">
            <CalendarDaysIcon className="w-20 self-center text-gray-500 dark:text-gray-400" />
            <Typography variant="h2">No events found</Typography>
            <Typography variant="body1">Scan a QR code to add one</Typography>
            <div className="mt-6 self-center">
              <Button onClick={onAddEvent}>
                <QrCodeIcon className="min-w-[1.25rem] h-5" />
                Add event
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
