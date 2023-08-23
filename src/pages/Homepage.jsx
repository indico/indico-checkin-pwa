import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {QrCodeIcon, CalendarDaysIcon} from '@heroicons/react/20/solid';
import {useLiveQuery} from 'dexie-react-hooks';
import EventItem from '../Components/Events/EventItem.tsx';
import {Button, Typography} from '../Components/Tailwind/index.jsx';
import db from '../db/db';
import {getRegistrationForms} from '../db/utils.ts';
import {formatDateObj} from '../utils/date.ts';

const Homepage = () => {
  const [numEventRegForms, setNumEventRegForms] = useState([]);

  // Listen to events updates
  const events = useLiveQuery(() =>
    db.events.toArray().then(currEvents =>
      // Convert the date to human-friendly format
      currEvents.map(event => {
        event.date = formatDateObj(new Date(event.date));
        return event;
      })
    )
  );

  useEffect(() => {
    const updateRegForms = async () => {
      if (!events) return;

      const eventNumForms = [];
      // Get the regForms for each event
      for (const event of events) {
        const regForms = await getRegistrationForms(event.id);
        if (regForms) eventNumForms.push(regForms.length);
        else eventNumForms.push(0);
      }

      setNumEventRegForms(eventNumForms);
    };

    updateRegForms();
  }, [events]);

  const navigate = useNavigate();

  const navigateToEvent = item => {
    navigate(`/event/${item.id}`);
  };

  const onAddEvent = () => {
    navigate('/event/new');
  };

  return (
    <div className="px-6 pt-1">
      {events?.length > 0 && (
        <>
          <div className="flex flex-row justify-between items-center">
            <Typography variant="h3">Events</Typography>
            <Button onClick={onAddEvent}>
              <QrCodeIcon className="min-w-[1.25rem] h-5" />
              Add event
            </Button>
          </div>
          <div className="mt-6 flex flex-col gap-4">
            {events.map((item, idx) => {
              return (
                <EventItem
                  key={idx}
                  item={item}
                  onClick={() => navigateToEvent(item)}
                  quantity={numEventRegForms[idx]}
                />
              );
            })}
          </div>
        </>
      )}
      {events?.length === 0 && (
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
