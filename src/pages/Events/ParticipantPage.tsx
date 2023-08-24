import {useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {
  ShieldCheckIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import {getEventDetailsFromIds, updateParticipant, updateRegForm} from '../../db/utils';
import useAppState from '../../hooks/useAppState';
import {ParticipantPageData} from '../../Models/EventData';
import {formatDate} from '../../utils/date';
import {authFetch} from '../../utils/network';
import {Field, FieldProps} from './fields';

const ParticipantPage = () => {
  const navigate = useNavigate();
  const {state} = useLocation();
  const {autoCheckin} = state || {autoCheckin: false};
  const {id, regFormId, registrantId} = useParams();

  const [eventData, setEventData] = useState<ParticipantPageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [triedCheckIn, setTriedCheckIn] = useState(false);
  const {enableModal} = useAppState();

  useEffect(() => {
    setIsLoading(true);
    // Fetch the Participant Page data from IndexedDB
    const getParticipantPageData = async () => {
      // Get the full event data
      const fullData = await getEventDetailsFromIds({
        eventId: Number(id),
        regFormId: Number(regFormId),
        participantId: Number(registrantId),
      });

      if (!fullData || !fullData.event || !fullData.regForm || !fullData.participant) {
        enableModal(
          'Error getting the participant data',
          "Couldn't fetch the event, form or participant data"
        );
        setIsLoading(false);
        return;
      }

      // Set the eventData
      const newEventData: ParticipantPageData = {
        event: {
          id: fullData.event.id,
          title: fullData.event.title,
          date: fullData.event.date,
          serverBaseUrl: fullData.event.server_base_url,
        },
        regForm: {
          id: fullData.regForm.id,
          title: fullData.regForm.title,
          checkedInCount: fullData.regForm.checkedInCount,
        },
        attendee: fullData.participant,
      };
      setEventData(newEventData);
      setIsLoading(false);
    };

    getParticipantPageData();
  }, [id, regFormId, registrantId, enableModal]);

  const updateCheckedInStatus = (newStatus: boolean) => {
    setEventData(prevState => {
      if (!prevState) return null;

      return {
        ...prevState,
        attendee: {
          ...prevState.attendee,
          checkedIn: newStatus,
        },
      };
    });
  };

  const performCheckIn = useCallback(
    async (newCheckInState: boolean) => {
      // Send the check in request to the backend
      if (!eventData) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await authFetch(
          eventData.event.serverBaseUrl,
          `/api/checkin/event/${eventData.event.id}/registration/${eventData.regForm.id}/${eventData.attendee.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify({checked_in: newCheckInState}),
          }
        );
        if (!response) {
          enableModal('Error checking in user', 'No response from the server');
          setIsLoading(false);
          return;
        }

        // Update the checked_in status in the database and the UI
        await updateParticipant(eventData.attendee.id, {checkedIn: newCheckInState});
        await updateRegForm(eventData.regForm.id, {
          checkedInCount: eventData.regForm.checkedInCount + (newCheckInState ? 1 : -1),
        });
        updateCheckedInStatus(newCheckInState);

        setIsLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          enableModal('Error checking in the user', err.message);
        } else {
          enableModal('Error checking in');
        }
        setIsLoading(false);
        return;
      }
    },
    [eventData, enableModal]
  );

  useEffect(() => {
    const performAutoCheckIn = async () => {
      // If autoCheckin is true, then automatically check in the user
      if (eventData && !triedCheckIn && autoCheckin) {
        setTriedCheckIn(true);
        if (eventData.attendee.checkedIn) {
          return;
        }
        await performCheckIn(true);
      }
    };

    performAutoCheckIn();
  }, [eventData, performCheckIn, autoCheckin, triedCheckIn]);

  const goToEvent = () => {
    if (!eventData) {
      return;
    }

    navigate(`/event/${eventData.event.id}`, {
      state: {autoRedirect: false}, // Don't auto redirect to the RegFormPage if there's only 1 form
      replace: true,
    });
  };

  const goToRegForm = () => {
    if (!eventData) {
      return;
    }

    navigate(`/event/${eventData.event.id}/${eventData.regForm.id}`, {
      replace: true,
    });
  };

  const onCheckInToggle = async () => {
    await performCheckIn(!eventData?.attendee?.checkedIn);
  };

  return (
    <>
      <div className="px-4 pt-1">
        {eventData && (
          <>
            <div className="flex items-center justify-between">
              <Breadcrumbs
                routeNames={[eventData.event?.title, eventData.regForm?.title]}
                routeHandlers={[goToEvent, goToRegForm]}
              />
            </div>
            <div className="mt-8 flex flex-col gap-4">
              <Typography variant="h2" className="text-center">
                {eventData.attendee.fullName}
              </Typography>
              <div className="mt-4 mb-4 flex items-center justify-center gap-4">
                <CheckInButton
                  isLoading={isLoading}
                  onCheckInToggle={onCheckInToggle}
                  eventData={eventData}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <InformationCircleIcon className="w-6 h-6 text-primary dark:text-blue-500" />
                    <Typography variant="body2">Registration Status</Typography>
                  </div>
                  <Typography variant="body2" className="font-bold capitalize">
                    {eventData.attendee.state}
                  </Typography>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDaysIcon className="w-6 h-6 text-primary dark:text-blue-500" />
                    <Typography variant="body2">Registration Date</Typography>
                  </div>
                  <Typography variant="body2" className="font-bold">
                    {formatDate(eventData.attendee.registrationDate)}
                  </Typography>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {eventData && (
        <div className="flex flex-col mt-6">
          {eventData.attendee.registrationData.map((data: object, i: number) => {
            const section: SectionProps = {
              ...data,
              isLast: i === eventData.attendee.registrationData.length - 1,
            };

            return <RegistrationSection key={section.id} {...section} />;
          })}
        </div>
      )}
    </>
  );
};

export default ParticipantPage;

interface SectionProps {
  id: number;
  title: string;
  description: string;
  fields: FieldProps[];
  isLast: boolean;
}

function RegistrationSection(section: SectionProps) {
  const {title, fields} = section;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div>
        <button
          type="button"
          disabled={fields.length === 0}
          className={`flex items-center justify-between w-full p-5 font-medium text-left border
                      border-gray-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-800
                      border-l-0 border-r-0 ${!section.isLast ? 'border-b-0' : ''}`}
          onClick={() => setIsOpen(o => !o)}
        >
          <Typography variant="h4" className="flex justify-between w-full">
            {title}
            {isOpen && <ChevronDownIcon className="w-6 h-6" />}
            {!isOpen && <ChevronLeftIcon className="w-6 h-6" />}
          </Typography>
        </button>
      </div>
      <div className={isOpen ? '' : 'hidden'}>
        <div className="flex flex-col gap-2 px-5 py-2">
          {fields.map(field => (
            <Field key={field.id} {...field} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CheckInButtonProps {
  isLoading: boolean;
  onCheckInToggle: () => void;
  eventData: ParticipantPageData;
}

function CheckInButton({isLoading, onCheckInToggle, eventData}: CheckInButtonProps) {
  const checkedIn = eventData.attendee.checkedIn;
  const size = checkedIn ? 'px-4 py-2' : 'px-7 py-3.5';
  const color = checkedIn
    ? 'bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700'
    : 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700';

  return (
    <>
      {checkedIn && (
        <div className="flex items-center text-white  gap-2">
          <ShieldCheckIcon className="w-8 h-8 text-green-500" />
          <Typography variant="body1">Checked in</Typography>
        </div>
      )}
      <button
        type="button"
        onClick={onCheckInToggle}
        className={`relative text-base text-white focus:outline-none
                    font-medium rounded-full text-center ${size} ${color}`}
      >
        {isLoading && (
          <LoadingIndicator
            size={checkedIn ? 'xs' : 's'}
            className="absolute m-auto left-0 right-0 top-0 bottom-0"
          />
        )}
        <span className={isLoading ? 'invisible' : ''}>
          {!checkedIn && 'Check in'}
          {checkedIn && 'Undo'}
        </span>
      </button>
    </>
  );
}
