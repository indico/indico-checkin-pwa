import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {authFetch} from '../utils/network';

const EventPage = () => {
  const {state} = useLocation();
  const {title, date, server_base_url} = state; // Destructure the state object containing the Event object

  console.log('Server Base url:', server_base_url);

  useEffect(() => {
    // Fetch the event data from the server
    const fetchEventData = async () => {
      const response = await authFetch(
        `${server_base_url}/api/checkin/event/83`,
        null,
        server_base_url
      ); // TODO: Get the event ID
      console.log('Response: ', response);
    };

    fetchEventData();

    return () => {
      // TODO: Abort the fetch request
    };
  }, []);

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-6">
      <h1 className="text-center">{title}</h1>
    </div>
  );
};

export default EventPage;
