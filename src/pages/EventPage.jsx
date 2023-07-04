import {useLocation} from 'react-router-dom';

const EventPage = () => {
  const {state} = useLocation();
  const {id, title, date, attendees} = state; // Destructure the state object containing the Event object

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-6">
      <h1 className="text-center">{title}</h1>
    </div>
  );
};

export default EventPage;
