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

        {events?.length > 0 ? (
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
