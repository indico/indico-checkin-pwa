import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {ShieldCheckIcon} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import Table, {rowProps} from '../../Components/Tailwind/Table';
import {ParticipantTable, ServerParticipantTable} from '../../db/db';
import {
  changeRegFormParticipant,
  getEventDetailsFromIds,
  getRegFormParticipants,
} from '../../db/utils';
import {RegFormData} from '../../Models/EventData';
import {authFetch} from '../../utils/network';

const RegistrationFormPage = () => {
  const {id, regFormId} = useParams();
  const [eventData, setEventData] = useState<RegFormData | null>(null);
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState<ParticipantTable[]>([]);

  // TODO: Keep changing from using HIstory state to IndexedDB

  useEffect(() => {
    // Fetch the RegistrationFormPage data from IndexedDB
    const getRegFormPageData = async () => {
      // Get the full event data
      const fullData = await getEventDetailsFromIds({
        eventId: Number(id),
        regFormId: Number(regFormId),
      });

      if (!fullData || !fullData.event || !fullData.regForm) {
        console.log('Error getting full event details from ids');
        return;
      }

      // Set the eventData
      const newEventData: RegFormData = {
        event: {
          id: fullData.event.id,
          title: fullData.event.title,
          date: fullData.event.date,
          serverBaseUrl: fullData.event.server_base_url,
        },
        id: fullData.regForm.id,
        label: fullData.regForm.label,
        participants: fullData.regForm.participants,
      };
      setEventData(newEventData);
    };

    getRegFormPageData();
  }, [id, regFormId]);

  useEffect(() => {
    const getAttendees = async () => {
      if (!eventData) return;

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
          const serverAttendee: ServerParticipantTable = response.find(
            (serverAttendee: any) => serverAttendee.registration_id === attendee.id
          );
          // Update the checked_in status
          if (serverAttendee) {
            const hasChanges = await changeRegFormParticipant(attendee, serverAttendee);
            if (hasChanges) updatedParticipant = true;
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
    return eventData
      ? attendees.map(attendee => ({
          columns: [attendee.full_name],
          useRightIcon: attendee.checked_in,
          onClick: () => {
            // Navigate to the Participant Details Page
            navigate(`/event/${eventData.event?.id}/${eventData.id}/${attendee.id}`);
          },
        }))
      : [];
  }, [attendees, eventData, navigate]);

  const navigateBack = () => {
    navigate(-1);
  };

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      {eventData && (
        <>
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
        </>
      )}
    </div>
  );
};

export default RegistrationFormPage;
