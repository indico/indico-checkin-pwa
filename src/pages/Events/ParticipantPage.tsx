import {useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {
  ShieldCheckIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import {useLiveQuery} from 'dexie-react-hooks';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import db from '../../db/db';
import useAppState from '../../hooks/useAppState';
import {checkInParticipant, useIsOffline} from '../../utils/client';
import {formatDate} from '../../utils/date';
import {NotFound} from '../NotFound';
import {Field, FieldProps} from './fields';
import {handleError, refreshEvent, refreshParticipant, refreshRegform} from './refresh';

const LOADING = Symbol('loading');

const ParticipantPage = () => {
  const navigate = useNavigate();
  const {state} = useLocation();
  const autoCheckin = state?.autoCheckin ?? false;
  const {id, regformId, participantId} = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const {enableModal} = useAppState();

  const event = useLiveQuery(() => db.events.get(Number(id)), [], LOADING);
  const regform = useLiveQuery(() => db.regForms.get(Number(regformId)), [], LOADING);
  const participant = useLiveQuery(() => db.participants.get(Number(participantId)), [], LOADING);

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      const event = await db.events.get(Number(id));
      const regform = await db.regForms.get(Number(regformId));
      const participant = await db.participants.get(Number(participantId));
      if (!event || !regform || !participant) {
        return;
      }

      await refreshEvent(event, controller.signal, enableModal);
      await refreshRegform(event, regform, controller.signal, enableModal);
      await refreshParticipant(event, participant, controller.signal, enableModal);
    }

    refresh().catch(err => {
      enableModal('Something went wrong when fetching updates', err.message);
    });
    return () => controller.abort();
  }, [id, regformId, participantId, enableModal]);

  const performCheckIn = useCallback(
    async (newCheckInState: boolean) => {
      if (
        !event ||
        event === LOADING ||
        !regform ||
        regform === LOADING ||
        !participant ||
        participant === LOADING
      ) {
        return;
      }

      const server = await db.servers.get(event.serverId);
      const response = await checkInParticipant(server, participant, newCheckInState);

      if (response.ok) {
        await db.transaction('readwrite', db.regForms, db.participants, async () => {
          await db.participants.update(participant.id, {checkedIn: newCheckInState});
          const checkedInCount = regform.checkedInCount + (newCheckInState ? 1 : -1);
          await db.regForms.update(regform.id, {checkedInCount});
        });
      } else {
        handleError(response, 'Something went wrong when updating check-in status', enableModal);
      }
    },
    [event, regform, participant, enableModal]
  );

  useEffect(() => {
    if (!participant || participant === LOADING) {
      return;
    }

    if (autoCheckin && !participant.checkedIn) {
      setIsLoading(true);
      performCheckIn(true).finally(() => setIsLoading(false));
    }
  }, [participant, performCheckIn, autoCheckin]);

  // Still loading
  if (event === LOADING || regform === LOADING || participant === LOADING) {
    return null;
  }

  if (!event) {
    return <NotFound text="Event not found" icon={<CalendarDaysIcon />} />;
  } else if (!regform) {
    return <NotFound text="Registration form not found" icon={<IconFeather />} />;
  } else if (!participant) {
    return <NotFound text="Participant not found" icon={<UserIcon />} />;
  }

  const goToEvent = () => {
    navigate(`/event/${event.id}`, {
      state: {autoRedirect: false}, // Don't auto redirect to the RegFormPage if there's only 1 form
      replace: true,
    });
  };

  const goToRegForm = () => {
    navigate(`/event/${event.id}/${regform.id}`, {
      replace: true,
    });
  };

  const onCheckInToggle = () => {
    setIsLoading(true);
    performCheckIn(!participant.checkedIn).finally(() => setIsLoading(false));
  };

  return (
    <>
      <div className="px-4 pt-1">
        <div className="flex items-center justify-between">
          <Breadcrumbs
            routeNames={[event.title, regform.title]}
            routeHandlers={[goToEvent, goToRegForm]}
          />
        </div>
        <div className="mt-8 flex flex-col gap-4">
          <Typography variant="h2" className="text-center">
            {participant.fullName}
          </Typography>
          <div className="mt-4 mb-4 flex items-center justify-center gap-4">
            <CheckInButton
              isLoading={isLoading}
              checkedIn={participant.checkedIn}
              onCheckInToggle={onCheckInToggle}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="w-6 h-6 text-primary dark:text-blue-500" />
                <Typography variant="body2">Registration Status</Typography>
              </div>
              <Typography variant="body2" className="font-bold capitalize">
                {participant.state}
              </Typography>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-6 h-6 text-primary dark:text-blue-500" />
                <Typography variant="body2">Registration Date</Typography>
              </div>
              <Typography variant="body2" className="font-bold">
                {formatDate(participant.registrationDate)}
              </Typography>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-6">
        {participant.registrationData.map((data: object, i: number) => {
          const section: SectionProps = {
            ...data,
            isLast: i === participant.registrationData.length - 1,
          };

          return <RegistrationSection key={section.id} {...section} />;
        })}
      </div>
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
  checkedIn: boolean;
  onCheckInToggle: () => void;
}

function CheckInButton({isLoading, checkedIn, onCheckInToggle}: CheckInButtonProps) {
  const offline = useIsOffline();
  const size = checkedIn ? 'px-4 py-2' : 'px-7 py-3.5';
  const color = offline
    ? 'bg-gray-500 dark:bg-gray-600'
    : checkedIn
    ? 'bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700'
    : 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700';

  const button = (
    <button
      type="button"
      disabled={offline}
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
  );

  return (
    <>
      {checkedIn && (
        <div className="flex items-center text-white gap-2">
          <ShieldCheckIcon className="w-8 h-8 text-green-500" />
          <Typography variant="body1">Checked in</Typography>
        </div>
      )}
      {button}
    </>
  );
}
