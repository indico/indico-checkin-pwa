import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {ShieldCheckIcon, TrashIcon} from '@heroicons/react/20/solid';
import DropdownSettings from '../../Components/DropdownSettings';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import Table, {rowProps} from '../../Components/Tailwind/Table';
import {ParticipantTable, ServerParticipantTable} from '../../db/db';
import {
  changeRegFormParticipant,
  getEventDetailsFromIds,
  getRegFormParticipants,
} from '../../db/utils';
import useAppState from '../../hooks/useAppState';
import {RegFormData} from '../../Models/EventData';
import {authFetch} from '../../utils/network';

const RegistrationFormPage = () => {
  const {id, regFormId} = useParams();
  const [eventData, setEventData] = useState<RegFormData | null>(null);
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState<ParticipantTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {enableModal} = useAppState();

  useEffect(() => {
    // Fetch the RegistrationFormPage data from IndexedDB
    const getRegFormPageData = async () => {
      // Get the full event data
      const fullData = await getEventDetailsFromIds({
        eventId: Number(id),
        regFormId: Number(regFormId),
      });

      if (!fullData || !fullData.event || !fullData.regForm) {
        // console.log('Error getting full event details from ids');
        enableModal(
          'Error getting the Form Details',
          "Couldn't find the event or registration form data"
        );
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
  }, [id, regFormId, enableModal]);

  useEffect(() => {
    const getAttendees = async () => {
      if (!eventData) return;

      setIsLoading(true);
      let newAttendees = await getRegFormParticipants(eventData.participants);
      if (!newAttendees) {
        enableModal(
          'Error getting the attendees',
          "Couldn't fetch the attendees that belong to this registration form."
        );
        setIsLoading(false);
        return; // If the attendees couldn't be fetched, don't continue
      }

      try {
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
      } catch (err: any) {
        if (err instanceof Error) {
          enableModal('Error fetching the attendees', err.message);
        } else {
          enableModal('Error fetching the attendees', 'An unknown error occurred');
        }
        return;
      }

      if (newAttendees) setAttendees(newAttendees);
    };

    getAttendees().finally(() => setIsLoading(false));
  }, [eventData, enableModal]);

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
    if (!eventData || !eventData.event) return;
    navigate(`/event/${eventData.event?.id}`, {
      state: {autoRedirect: false}, // Don't auto redirect to the RegFormPage if there's only 1 form
      replace: true,
    });
  };

  return (
    <div className="px-6 pt-1">
      {eventData && (
        <>
          <div className="flex flex-row w-100 items-start justify-between gap-4">
            <div className="pt-2">
              <Breadcrumbs
                routeNames={[eventData.event?.title, eventData.label]}
                routeHandlers={[navigateBack, null]}
              />
            </div>
            <DropdownSettings
              items={[
                {icon: <TrashIcon />, text: 'Delete event'},
                {icon: <TrashIcon />, text: 'Delete registration form'},
              ]}
            />
          </div>
          <div className="mt-6">
            {isLoading && <LoadingIndicator className="mt-20" />}
            {!isLoading && (
              <Table
                columnLabels={['Attendees']}
                searchColIdx={0}
                rows={tableRows}
                RightIcon={ShieldCheckIcon}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RegistrationFormPage;
