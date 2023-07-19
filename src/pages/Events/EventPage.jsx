import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {getRegistrationForms} from '../../db/utils';
import EventData from '../../Models/EventData';
import {authFetch} from '../../utils/network';

const EventPage = () => {
  const {state} = useLocation();
  const navigate = useNavigate();
  const {title, date, server_base_url, id: eventID} = state; // Destructure the state object containing the Event object

  const [event, setEvent] = useState(new EventData(title, date));

  console.log('Server Base url:', server_base_url);

  useEffect(() => {
    // Fetch the event data from the server
    const fetchEventData = async () => {
      // Get the data of each Stored Registration Form that belongs to this event
      const regForms = await getRegistrationForms(eventID);
      // console.log('Registration Forms:', regForms);
      const newEventData = new EventData(title, date, regForms);

      if (regForms.length === 1) {
        // Navigate to the registration form page if there is only one registration form
        navigate(`/event/${eventID}/${regForms[0].id}`, {state: newEventData.getRegFormData(0)});
        return;
      }
      setEvent(newEventData);

      const response = await authFetch(server_base_url, `/api/checkin/event/${eventID}`);
      // TODO: Update with the info from the endpoint
      // console.log('Response: ', response);
    };

    fetchEventData();

    /* return () => {
      // TODO: Abort the fetch request
    }; */
  }, [server_base_url, eventID, title, date, navigate]);

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      <Breadcrumbs className="ml-5" routeNames={[event.title]} />

      {event.registrationForms.map((regForm, idx) => (
        <div className="mx-auto w-full h-full justify-center align-center mt-6" key={idx}>
          <h1 className="text-center">{regForm.label}</h1>
        </div>
      ))}
    </div>
  );
};

export default EventPage;
