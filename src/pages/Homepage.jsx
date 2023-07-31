import {useNavigate} from 'react-router-dom';
import {useLiveQuery} from 'dexie-react-hooks';
import EventItem from '../Components/Events/EventItem.tsx';
import {Button, Typography} from '../Components/Tailwind/index.jsx';
import db from '../db/db';
import {formatDateObj} from '../utils/date.ts';

const Homepage = () => {
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
        <Button onClick={onAddEvent}>Add event</Button>
      </div>

      {events?.length > 0 ? (
        <div className="mt-6 flex flex-col gap-4">
          {events.map((item, idx) => {
            return <EventItem key={idx} item={item} onClick={() => navigateToEvent(item)} />;
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
