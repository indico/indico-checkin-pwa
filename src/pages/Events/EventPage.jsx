import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {UserIcon} from '@heroicons/react/20/solid';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {getRegistrationForms} from '../../db/utils';
import EventData from '../../Models/EventData';
import {authFetch} from '../../utils/network';
import {clickableClassname} from '../../utils/styles';

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
      console.log('Registration Forms:', regForms);
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

  /**
   * Handle the click event on a registration form
   * @param {*} idx
   * @returns
   */
  const onFormClick = (idx = 0) => {
    if (idx < 0 || idx >= event?.registrationForms?.length) {
      // Invalid index
      return;
    }

    navigate(`/event/${eventID}/${event.registrationForms[idx].id}`, {
      state: event.getRegFormData(idx),
    });
  };

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      <div className="flex flex-row w-100">
        <Breadcrumbs className="ml-5" routeNames={[event.title]} />
      </div>

      <div className="mt-6">
        <Typography variant="h3" className="ml-5">
          Registration Forms
        </Typography>

        {event.registrationForms.length > 0 ? (
          event.registrationForms.map((regForm, idx) => (
            <div
              className={`flex justify-between mx-auto w-4/5 rounded-lg h-full mt-6 py-5 pl-4 pr-8 shadow-lg bg-gray-200 dark:bg-gray-800 ${clickableClassname}`}
              key={idx}
              onClick={() => onFormClick(idx)}
            >
              <div className="flex items-center">
                <IconFeather className="w-6 h-6 mr-3 text-primary " />

                <Typography variant="body1" className="text-center dark:text-white">
                  {regForm.label}
                </Typography>
              </div>

              <div className="flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-white text-primary dark:bg-darkSecondary dark:text-secondary">
                <UserIcon className="w-4 h-4 mr-1" />

                <Typography variant="body1">{regForm.participants.length}</Typography>
              </div>
            </div>
          ))
        ) : (
          <div className="mx-auto w-full h-full justify-center align-center mt-6">
            <Typography variant="body1" className="text-center">
              No Registration Forms Available.
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPage;
