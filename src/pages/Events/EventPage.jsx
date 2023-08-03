import {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {UserGroupIcon} from '@heroicons/react/20/solid';
import {ShieldCheckIcon, TrashIcon} from '@heroicons/react/24/solid';
import DropdownSettings from '../../Components/DropdownSettings';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import {
  addRegFormParticipant,
  getEventDetailsFromIds,
  getRegFormParticipants,
  getRegistrationForms,
  removeRegFormParticipant,
  updateEvent,
  updateRegForm,
} from '../../db/utils';
import useAppState from '../../hooks/useAppState';
import EventData from '../../Models/EventData';
import {authFetch} from '../../utils/network';

const EventPage = () => {
  const navigate = useNavigate();
  const {id: eventID} = useParams();

  const {state} = useLocation(); // Get the state passed from the previous page
  const {autoRedirect} = state || {autoRedirect: true}; // If no state was passed, set autoRedirect to true

  const [event, setEvent] = useState(new EventData());
  const [isLoading, setIsLoading] = useState(false);

  const {enableModal} = useAppState();

  useEffect(() => {
    setIsLoading(true);

    const fetchEventData = async () => {
      // Fetch the event data from the IndexedDB
      const fullData = await getEventDetailsFromIds({
        eventId: Number(eventID),
      });
      if (!fullData?.event) {
        console.log("Couldn't find event in DB with ID :", eventID);
        enableModal('Error fetching the event', "Couldn't find event in DB");
        return;
      }
      const newEventData = new EventData(
        fullData.event.title,
        fullData.event.date,
        fullData.event.server_base_url
      );

      // Fetch the event data from the server
      try {
        const response = await authFetch(
          newEventData.serverBaseUrl,
          `/api/checkin/event/${eventID}`
        );
        // console.log('Get event details Response: ', response);
        // const mockResponse = mockEventDetailsResponse;
        if (response) {
          // Compare the data from the server with the local data
          if (response.title !== newEventData.title || response.start_dt !== newEventData.date) {
            // Update the local data
            await updateEvent(Number(eventID), response.title, response.start_dt);
          }
        }
      } catch (err) {
        if (err instanceof Error) enableModal("Error fetching the event's details", err.message);
        else enableModal("Error fetching the event's details", 'An unknown error occurred');
        return;
      }

      // Get the data of each Stored Registration Form that belongs to this event
      const prevRegForms = await getRegistrationForms(Number(eventID));

      // Compare the data from the server's Registration Forms with the local data
      for (let i = 0; i < prevRegForms.length; i++) {
        const regForm = prevRegForms[i];

        try {
          // Update Reg. Form Details if they are different
          const regFormResponse = await authFetch(
            newEventData.serverBaseUrl,
            `/api/checkin/event/${eventID}/registration/${regForm.id}`
          );

          // const mockResponse = mockRegFormDetailsResponse;
          if (regFormResponse) {
            // Compare the data from the server with the local data
            if (regFormResponse.title !== regForm.label) {
              // Update the IndexedDB data
              await updateRegForm(Number(eventID), regFormResponse.title);
            }
          }
        } catch (err) {
          if (err instanceof Error) enableModal('Error fetching the Form details', err.message);
          else enableModal('Error fetching the Form details', 'An unknown error occurred');
          return;
        }

        try {
          // Update the list of participants if they are different
          const formRegistrationsResponse = await authFetch(
            newEventData.serverBaseUrl,
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
                state: participant.state,
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
        } catch (err) {
          if (err instanceof Error)
            enableModal('Error fetching the Form participants', err.message);
          else enableModal('Error fetching the Form participants', 'An unknown error occurred');
          return;
        }
      }

      // Get the updated list of Registration Forms of this event from the IndexedDB
      const updatedRegForms = await getRegistrationForms(Number(eventID));

      if (updatedRegForms.length === 1 && autoRedirect) {
        // Navigate to the registration form page if there is only one registration form
        navigate(`/event/${eventID}/${updatedRegForms[0].id}`);
        return;
      }

      // Update the Registration Forms of the newEventData object
      newEventData.registrationForms = updatedRegForms;

      // Get the number of checked-in participants for each registration form from the IndexedDB
      for (const regForm of newEventData.registrationForms) {
        const participants = await getRegFormParticipants(regForm.participants);
        regForm.num_checked_in = participants.filter(p => p.checked_in === true).length;
      }

      setEvent(newEventData);
    };

    fetchEventData().finally(() => setIsLoading(false));

    /* return () => {
      // TODO: Abort the fetch request
    }; */
  }, [eventID, navigate, autoRedirect, enableModal]);

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

    navigate(`/event/${eventID}/${event.registrationForms[idx].id}`);
  };

  const regforms = event.registrationForms.map((regForm, idx) => (
    <div
      key={idx}
      onClick={() => onFormClick(idx)}
      className="flex flex-wrap gap-2 justify-between p-6 bg-white border border-gray-200 rounded-lg shadow
                 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600"
    >
      <div className="flex flex-1 items-center">
        <IconFeather className="w-6 h-6 min-w-[1.5rem] mr-3 text-primary" />
        <Typography variant="body1" className="text-center dark:text-white">
          {regForm.label}
        </Typography>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex self-center items-center rounded-full overflow-hidden">
          <div className="flex items-center text-xs font-medium pl-2.5 py-0.5 bg-blue-100 text-primary dark:bg-darkSecondary dark:text-secondary">
            <ShieldCheckIcon className="w-4 h-4 mr-1" />
            <Typography variant="body1">{regForm.num_checked_in}</Typography>
          </div>
          <div className="flex items-center text-xs font-medium px-2.5 py-0.5 bg-blue-100 text-primary dark:bg-darkSecondary dark:text-secondary">
            <UserGroupIcon className="w-4 h-4 mr-1" />
            <Typography variant="body1">{regForm.participants.length}</Typography>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="px-6 pt-1">
      <div className="flex flex-row w-100 items-start justify-between gap-4">
        <div className="pt-2">
          <Breadcrumbs routeNames={[event.title]} routeHandlers={[null]} />
        </div>
        <DropdownSettings items={[{icon: <TrashIcon />, text: 'Delete event'}]} />
      </div>
      <div className="mt-6 flex flex-col gap-4">
        {isLoading && <LoadingIndicator className="mt-20" />}
        {!isLoading && event.registrationForms.length > 0 && <>{regforms}</>}
        {!isLoading && event.registrationForms.length === 0 && (
          <div>
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
