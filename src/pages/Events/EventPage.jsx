import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {UserGroupIcon} from '@heroicons/react/20/solid';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import {
  addRegFormParticipant,
  getRegFormParticipants,
  getRegistrationForms,
  removeRegFormParticipant,
  updateEvent,
  updateRegForm,
} from '../../db/utils';
import EventData from '../../Models/EventData';
import {authFetch} from '../../utils/network';
import {clickableClassname} from '../../utils/styles';

const EventPage = () => {
  const {state} = useLocation();
  const navigate = useNavigate();
  const {title, date, server_base_url, id: eventID} = state; // Destructure the state object containing the Event object
  const [event, setEvent] = useState(new EventData(title, date, server_base_url));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Fetch the event data from the server
    const fetchEventData = async () => {
      const response = await authFetch(server_base_url, `/api/checkin/event/${eventID}`);
      // console.log('Response: ', response);
      // const mockResponse = mockEventDetailsResponse;
      if (response) {
        // Compare the data from the server with the local data
        if (response.title !== title || response.start_dt !== date) {
          // Update the local data
          await updateEvent(eventID, response.title, response.start_dt);
        }
      }

      // Get the data of each Stored Registration Form that belongs to this event
      const prevRegForms = await getRegistrationForms(eventID);
      // console.log('Registration Forms:', prevRegForms);

      // Compare the data from the server's Registration Forms with the local data
      for (let i = 0; i < prevRegForms.length; i++) {
        const regForm = prevRegForms[i];

        // Update Reg. Form Details if they are different
        const regFormResponse = await authFetch(
          server_base_url,
          `/api/checkin/event/${eventID}/registration/${regForm.id}`
        );
        // console.log('regFormResponse: ', i, regFormResponse);

        // const mockResponse = mockRegFormDetailsResponse;
        if (regFormResponse) {
          // Compare the data from the server with the local data
          if (regFormResponse.title !== regForm.label) {
            // Update the IndexedDB data
            await updateRegForm(eventID, regFormResponse.title);
          }
        }

        // Update the list of participants if they are different
        const formRegistrationsResponse = await authFetch(
          server_base_url,
          `/api/checkin/event/${eventID}/registration/${regForm.id}/registrations`
        );
        // console.log('formRegistrationsResponse: ', formRegistrationsResponse);
        // const mockResponse2 = mockParticipantsResponse;
        if (formRegistrationsResponse) {
          // Compare the data from the server with the local data
          const currParticipants = await getRegFormParticipants(regForm.participants);
          // console.log('Current Participants:', currParticipants);

          // Find the participants that are no longer in the server's list
          const currParticipantIDs = currParticipants.map(p => p.id);
          const serverParticipantIDs = formRegistrationsResponse.map(p => p.registration_id);
          const addedParticipants = formRegistrationsResponse.filter(
            participant => !currParticipantIDs.includes(participant.registration_id)
          );
          const removedParticipants = currParticipants.filter(
            participant => !serverParticipantIDs.includes(participant.id)
          );

          // Add the new participants to the IndexedDB
          for (const participant of addedParticipants) {
            // console.log('Adding new participant...');
            // Add the participant to the IndexedDB
            const participantData = {
              id: participant.registration_id,
              name: participant.full_name,
              checked_in: participant.checked_in,
              regForm_id: regForm.id,
            };
            await addRegFormParticipant(participantData);
          }

          // Remove the participants that are no longer in the server's list
          for (const participant of removedParticipants) {
            // console.log('Removing participant...');
            // Remove the participant from the IndexedDB
            await removeRegFormParticipant(participant.id);
          }
        }
      }

      // Get the updated list of Registration Forms of this event from the IndexedDB
      const updatedRegForms = await getRegistrationForms(eventID);

      // Create a new EventData object with the data from the server
      const newEventData = new EventData(title, date, server_base_url, updatedRegForms);

      if (updatedRegForms.length === 1) {
        // Navigate to the registration form page if there is only one registration form
        navigate(`/event/${eventID}/${updatedRegForms[0].id}`, {
          state: newEventData.getRegFormData(0),
        });
        return;
      }
      setEvent(newEventData);
    };

    fetchEventData().finally(() => setIsLoading(false));

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

  const regforms = event.registrationForms.map((regForm, idx) => (
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
        <UserGroupIcon className="w-4 h-4 mr-1" />
        <Typography variant="body1">{regForm.participants.length}</Typography>
      </div>
    </div>
  ));

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      <div className="flex flex-row w-100">
        <Breadcrumbs className="ml-5" routeNames={[event.title]} routeHandlers={[null]} />
      </div>

      <div className="mt-6">
        {isLoading && <LoadingIndicator />}
        {!isLoading && event.registrationForms.length > 0 && (
          <>
            <Typography variant="h3" className="ml-5">
              Registration Forms
            </Typography>
            {regforms}
          </>
        )}
        {!isLoading && event.registrationForms.length === 0 && (
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
