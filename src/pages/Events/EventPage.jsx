import {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {UserGroupIcon} from '@heroicons/react/20/solid';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {
  addRegFormParticipant,
  getRegFormParticipants,
  getRegistrationForms,
  removeRegFormParticipant,
  updateEvent,
  updateRegForm,
} from '../../db/utils';
import EventData from '../../Models/EventData';
import {
  mockEventDetailsResponse,
  mockParticipantsResponse,
  mockRegFormDetailsResponse,
} from '../../Models/mockResponses';
import {authFetch} from '../../utils/network';
import {clickableClassname} from '../../utils/styles';

const EventPage = () => {
  const {state} = useLocation();
  const navigate = useNavigate();
  const {title, date, server_base_url, id: eventID} = state; // Destructure the state object containing the Event object

  const [event, setEvent] = useState(new EventData(title, date, server_base_url));

  useEffect(() => {
    // Fetch the event data from the server
    const fetchEventData = async () => {
      //const response = await authFetch(server_base_url, `/api/checkin/event/${eventID}`);
      // TODO: Update with the info from the endpoint
      // Might need to update local data if the server data is different
      // console.log('Response: ', response);
      // TODO: Remove this after
      const mockResponse = mockEventDetailsResponse;
      // Compare the data from the server with the local data
      if (mockResponse.title !== title || mockResponse.start_dt !== date) {
        // Update the local data
        await updateEvent(eventID, mockResponse.title, mockResponse.start_dt);
      }

      // Get the data of each Stored Registration Form that belongs to this event
      const regForms = await getRegistrationForms(eventID);
      // console.log('Registration Forms:', regForms);

      // Compare the data from the server's Registration Forms with the local data
      for (let i = 0; i < regForms.length; i++) {
        const regForm = regForms[i];

        // Update Reg. Form Details if they are different
        /* const response = await authFetch(
        server_base_url,
        `/api/checkin/event/${eventID}/registration/${regForm.id}`
      ); */
        // console.log('Response: ', response);

        // TODO: Remove this after
        const mockResponse = mockRegFormDetailsResponse;
        // Compare the data from the server with the local data
        if (mockResponse.title !== regForm.label) {
          // Update the variable
          regForm.label = mockResponse.title;
          // Update the IndexedDB data
          await updateRegForm(eventID, mockResponse.title);
        }

        // Update the list of participants if they are different
        /* const response = await authFetch(
          server_base_url,
          `/api/checkin/event/${eventID}/registration/${regForm.id}/registrations`
        ); */
        // console.log('Response: ', response);
        const mockResponse2 = mockParticipantsResponse;
        // Compare the data from the server with the local data
        const currParticipants = await getRegFormParticipants(regForm.participants);
        // console.log('Current Participants:', currParticipants);

        // Find the participants that are no longer in the server's list
        const currParticipantIDs = currParticipants.map(p => p.id);
        const serverParticipantIDs = mockResponse2.map(p => p.registration_id);
        const addedParticipants = mockResponse2.filter(
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
          // Update the variable
          regForm.participants.push(participantData.id);
        }

        // Remove the participants that are no longer in the server's list
        for (const participant of removedParticipants) {
          // console.log('Removing participant...');
          // Remove the participant from the IndexedDB
          await removeRegFormParticipant(participant.id);
        }
        // Update the variable
        regForm.participants = regForm.participants.filter(id => {
          const removedIDs = removedParticipants.map(p => p.id);
          return !removedIDs.includes(id);
        });

        // TODO: Instead of updating the IndexedDB and local variable, could just update the IndexedDB and then get the updated data from the IndexedDB
      }

      // Create a new EventData object with the data from the server
      const newEventData = new EventData(title, date, server_base_url, regForms);

      if (regForms.length === 1) {
        // Navigate to the registration form page if there is only one registration form
        navigate(`/event/${eventID}/${regForms[0].id}`, {state: newEventData.getRegFormData(0)});
        return;
      }
      setEvent(newEventData);
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
        <Breadcrumbs className="ml-5" routeNames={[event.title]} routeHandlers={[null]} />
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
                <UserGroupIcon className="w-4 h-4 mr-1" />

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
