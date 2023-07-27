import {useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {ShieldCheckIcon} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import Table, {rowProps} from '../../Components/Tailwind/Table';
import {ParticipantTable} from '../../db/db';
import {changeRegFormParticipant, getRegFormParticipants} from '../../db/utils';
import {RegFormData} from '../../Models/EventData';
import {authFetch} from '../../utils/network';

const RegistrationFormPage = () => {
  const {state: eventData}: {state: RegFormData} = useLocation(); // Get the state object passed from the previous page
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState<ParticipantTable[]>([]);

  useEffect(() => {
    const getAttendees = async () => {
      let newAttendees = await getRegFormParticipants(eventData.participants);
      if (!newAttendees) return; // If the event is not defined, then return

      // Update the attendees data by comparing with the server
      const response = await authFetch(
        eventData.event?.serverBaseUrl,
        `/api/checkin/event/${eventData.event?.id}/registration/${eventData.id}/registrations`
      );
      if (response) {
        let updatedParticipant = false;
        for (const attendee of newAttendees) {
          const serverAttendee = response.find(
            (serverAttendee: any) => serverAttendee.registration_id === attendee.id
          );
          // Update the checked_in status
          if (serverAttendee && serverAttendee.checked_in !== attendee.checked_in) {
            await changeRegFormParticipant(attendee, serverAttendee.checked_in); // Update the checked_in status in the database
            updatedParticipant = true;
          }
        }

        if (updatedParticipant) {
          // Re-fetch the attendees
          newAttendees = await getRegFormParticipants(eventData.participants);
        }
      }

      if (newAttendees) setAttendees(newAttendees);
    };

    getAttendees();
  }, [eventData]);

  // Build the table rows array
  const tableRows: rowProps[] = useMemo(() => {
    return attendees.map(attendee => ({
      columns: [attendee.name],
      useRightIcon: attendee.checked_in,
      onClick: () => console.log('test click'),
    }));
  }, [attendees]);

  const navigateBack = () => {
    navigate(-1);
  };

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      <div className="flex flex-row w-100 items-center justify-between">
        <Breadcrumbs
          className="ml-2"
          routeNames={[eventData.event?.title, eventData.label]}
          routeHandlers={[navigateBack, null]}
        />

        <Typography variant="body3" className="mr-2">
          {eventData.event?.date}
        </Typography>
      </div>

      <Table
        columnLabels={['Attendees']}
        searchColIdx={0}
        rows={tableRows}
        className="w-5/6 m-auto mt-6"
        RightIcon={ShieldCheckIcon}
      />
    </div>
  );
};

export default RegistrationFormPage;
