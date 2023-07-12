import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useLiveQuery} from 'dexie-react-hooks';
import EventItem from '../Components/Events/EventItem.tsx';
import {Button, Typography} from '../Components/Tailwind/index.jsx';
import db from '../db/db';
import useSettings from '../hooks/useSettings.jsx';
import {formatDateObj} from '../utils/date.ts';

const Homepage = () => {
  const {setDarkMode} = useSettings();

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
  // console.log('events:', JSON.stringify(events));

  useEffect(() => {
    // On render, check if the user has a theme preference. If not, check if their system is set to dark mode. If so, set the theme to dark.
    // If neither, set the theme to light.
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, [setDarkMode]);

  const navigate = useNavigate();

  const navigateToEvent = item => {
    navigate(`/event/${item.id}`, {state: item});
  };

  const onAddEvent = () => {
    navigate('/event/new');
  };

  return (
    <div className="w-full h-full">
      <div className="px-6 pt-1">
        <div className="flex flex-row justify-between items-center mb-6">
          <Typography variant="h2">Events</Typography>

          <Button onClick={onAddEvent}>Add event</Button>
        </div>

        {events ? (
          <div className="flex flex-1">
            <div className="grid grid-cols-1 w-full" spacing={2}>
              {events.map((item, idx) => {
                return <EventItem key={idx} item={item} onClick={() => navigateToEvent(item)} />;
              })}
            </div>
          </div>
        ) : (
          <div>
            <Typography variant="h4">No Events Found.</Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
