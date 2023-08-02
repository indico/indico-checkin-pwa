import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {QrCodeIcon} from '@heroicons/react/20/solid';
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

  // console.log('events:', JSON.stringify(events));

  const navigate = useNavigate();

  const navigateToEvent = item => {
    navigate(`/event/${item.id}`);
  };

  const onAddEvent = () => {
    navigate('/event/new');
  };

  return (
    <div className="px-6 pt-1">
      <div className="flex flex-row justify-between items-center">
        <Typography variant="h3">Events</Typography>
        <Button className="flex gap-2" onClick={onAddEvent}>
          <QrCodeIcon className="min-w-[1.25rem] h-5" />
          Add event
        </Button>
      </div>

      {events?.length > 0 ? (
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
      ) : (
        <div>
          <Typography variant="h4">No Events Found.</Typography>
        </div>
      )}
    </div>
  );
};

export default Homepage;
