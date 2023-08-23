import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {ShieldCheckIcon, TrashIcon, UserGroupIcon} from '@heroicons/react/20/solid';
import DropdownSettings from '../../Components/DropdownSettings';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import Table, {rowProps} from '../../Components/Tailwind/Table';
import db, {ParticipantTable} from '../../db/db';
import {getEventDetailsFromIds} from '../../db/utils';
import useAppState from '../../hooks/useAppState';
import {RegFormData} from '../../Models/EventData';
import {camelizeKeys} from '../../utils/case';
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
        title: fullData.regForm.title,
        checkedInCount: fullData.regForm.checkedInCount,
        registrationCount: fullData.regForm.registrationCount,
      };
      setEventData(newEventData);
    };

    getRegFormPageData();
  }, [id, regFormId, enableModal]);

  useEffect(() => {
    const getAttendees = async () => {
      if (!eventData) return;

      try {
        // Update the attendees data by comparing with the server
        const participants = camelizeKeys(
          await authFetch(
            eventData.event?.serverBaseUrl,
            `/api/checkin/event/${eventData.event?.id}/registration/${eventData.id}/registrations`
          )
        );

        setAttendees(participants);
        await db.participants.clear();
        await db.participants.bulkAdd(participants);
      } catch (err) {
        console.error(err);
        enableModal('Failed to get participant data');
      }
    };

    setIsLoading(true);
    getAttendees().finally(() => setIsLoading(false));
  }, [eventData, enableModal]);

  // Build the table rows array
  const tableRows: rowProps[] = useMemo(() => {
    return eventData
      ? attendees.map(attendee => ({
          columns: [attendee.fullName],
          useRightIcon: attendee.checkedIn,
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
    <div className="pt-1">
      {eventData && (
        <>
          <div className="px-4">
            <div className="flex flex-row w-100 items-start justify-between gap-4">
              <div className="pt-2">
                <Breadcrumbs
                  routeNames={[eventData.event?.title, eventData.title]}
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
            <div className="mt-6 flex flex-col gap-2">
              <table className="border-spacing-4">
                <tbody>
                  <tr>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                        <Typography variant="body1">Checked-in participants</Typography>
                      </div>
                    </td>
                    <td className="text-right">
                      <span
                        className="bg-green-100 text-green-800 dark:text-green-200 text-base font-medium px-2.5 py-0.5
                                   rounded-full dark:bg-green-600"
                      >
                        {eventData.checkedInCount}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-6 h-6 text-primary" />
                        <Typography variant="body1">Total participants</Typography>
                      </div>
                    </td>
                    <td className="text-right">
                      <span
                        className="bg-blue-100 dark:bg-blue-600 text-blue-800 text-base font-medium px-2.5 py-0.5
                                   rounded-full dark:text-blue-200"
                      >
                        {eventData.registrationCount}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-6">
            {isLoading && <LoadingIndicator className="mt-20" />}
            {!isLoading && (
              <Table columnLabels={['Attendees']} rows={tableRows} RightIcon={ShieldCheckIcon} />
            )}
          </div>
        </>
      )}
      {!isLoading && attendees.length === 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 px-3 pb-2">
          <div className="flex flex-col gap-2 items-center justify-center px-6 pt-10 pb-12 rounded-xl">
            <UserGroupIcon className="w-16 text-gray-500" />
            <Typography variant="h3">There are no participants yet</Typography>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationFormPage;
