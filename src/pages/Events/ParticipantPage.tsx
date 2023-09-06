import {ChangeEvent, useCallback, useEffect, useState} from 'react';
import {useLocation, useParams} from 'react-router-dom';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/20/solid';
import {useLiveQuery} from 'dexie-react-hooks';
import GrowingTextarea from '../../Components/GrowingTextarea';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import {CheckinToggle} from '../../Components/Tailwind/Toggle';
import TopTab from '../../Components/TopTab';
import db from '../../db/db';
import useAppState from '../../hooks/useAppState';
import {checkInParticipant, useIsOffline} from '../../utils/client';
import {formatDate} from '../../utils/date';
import {NotFound} from '../NotFound';
import {Field, FieldProps} from './fields';
import {handleError, syncEvent, syncParticipant, syncRegform} from './sync';

const makeDebounce = (delay: number) => {
  let timer: number;
  return (fn: CallableFunction) => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
};

const debounce = makeDebounce(300);
const LOADING = Symbol('loading');

const ParticipantPage = () => {
  const {state} = useLocation();
  const [autoCheckin, setAutoCheckin] = useState(state?.autoCheckin ?? false);
  const {id, regformId, participantId} = useParams();
  const offline = useIsOffline();
  const [isLoading, setIsLoading] = useState(false);
  const {enableModal} = useAppState();
  const [fullTitleVisible, setFullTitleVisible] = useState(false);
  const [notes, setNotes] = useState('');

  const event = useLiveQuery(() => db.events.get(Number(id)), [id], LOADING);
  const regform = useLiveQuery(
    () => db.regforms.get({id: Number(regformId), eventId: Number(id)}),
    [id, regformId],
    LOADING
  );
  const participant = useLiveQuery(
    () => db.participants.get({id: Number(participantId), regformId: Number(regformId)}),
    [regformId, participantId],
    LOADING
  );

  useEffect(() => {
    const controller = new AbortController();

    async function sync() {
      const event = await db.events.get(Number(id));
      const regform = await db.regforms.get(Number(regformId));
      const participant = await db.participants.get(Number(participantId));
      if (!event || !regform || !participant) {
        return;
      }

      await syncEvent(event, controller.signal, enableModal);
      await syncRegform(event, regform, controller.signal, enableModal);
      await syncParticipant(event, regform, participant, controller.signal, enableModal);
    }

    sync().catch(err => {
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

      if (offline) {
        enableModal('You are offline', 'Check-in requires an internet connection');
        return;
      }

      const server = await db.servers.get(event.serverId);
      if (!server) {
        return;
      }
      const response = await checkInParticipant(
        server,
        event,
        regform,
        participant,
        newCheckInState
      );

      if (response.ok) {
        await db.transaction('readwrite', db.regforms, db.participants, async () => {
          await db.participants.update(participant.id, {checkedIn: newCheckInState});
          const checkedInCount = regform.checkedInCount + (newCheckInState ? 1 : -1);
          await db.regforms.update(regform.id, {checkedInCount});
        });
      } else {
        handleError(response, 'Something went wrong when updating check-in status', enableModal);
      }
    },
    [event, regform, participant, enableModal, offline]
  );

  useEffect(() => {
    if (!participant || participant === LOADING) {
      return;
    }

    if (autoCheckin && !participant.checkedIn) {
      setAutoCheckin(false);
      setIsLoading(true);
      performCheckIn(true).finally(() => setIsLoading(false));
    }
  }, [participant, performCheckIn, autoCheckin]);

  useEffect(() => {
    if (participant && participant !== LOADING) {
      setNotes(participant.notes);
    }
  }, [participant]);

  // Still loading
  if (event === LOADING || regform === LOADING || participant === LOADING) {
    return <TopTab />;
  }

  if (!event) {
    return (
      <>
        <TopTab />
        <NotFound text="Event not found" icon={<CalendarDaysIcon />} />
      </>
    );
  } else if (!regform) {
    return (
      <>
        <TopTab />
        <NotFound text="Registration form not found" icon={<IconFeather />} />
      </>
    );
  } else if (!participant) {
    return (
      <>
        <TopTab />
        <NotFound text="Participant not found" icon={<UserIcon />} />
      </>
    );
  }

  const onAddNotes = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    debounce(() => {
      console.log(e.target.value);
      db.participants.update(participant.id, {notes: e.target.value});
    });
  };

  const onCheckInToggle = () => {
    setIsLoading(true);
    performCheckIn(!participant.checkedIn).finally(() => setIsLoading(false));
  };

  const registrationData = participant.registrationData.map((data: object, i: number) => {
    const section: SectionProps = {
      ...data,
      isFirst: i === 0,
      isLast: i === participant.registrationData.length - 1,
      isUnique: participant.registrationData.length === 1,
    };

    return <RegistrationSection key={section.id} {...section} />;
  });

  return (
    <>
      <TopTab />
      <div className="px-4 pt-1">
        <div className="mt-2 flex flex-col gap-4">
          <div>
            <Typography
              variant="h2"
              className={`max-w-full cursor-pointer text-center break-words text-gray-600 ${
                !fullTitleVisible ? 'whitespace-nowrap text-ellipsis overflow-hidden' : ''
              }`}
            >
              <span onClick={() => setFullTitleVisible(v => !v)}>{participant.fullName}</span>
            </Typography>
            <Typography variant="body2">
              <a
                href={`${event.baseUrl}/event/${event.indicoId}/manage/registration/${regform.indicoId}/registrations/${participant.indicoId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                Indico participant page
                <ArrowTopRightOnSquareIcon className="w-4" />
              </a>
            </Typography>
          </div>
          <div className="flex justify-center mt-4 mb-4">
            <CheckinToggle
              checked={participant.checkedIn}
              isLoading={isLoading}
              onClick={onCheckInToggle}
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
          <div className="flex justify-center mt-1">
            <Typography variant="body1" className="w-full">
              <GrowingTextarea value={notes} onChange={onAddNotes} />
            </Typography>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-5 px-4">{registrationData}</div>
    </>
  );
};

export default ParticipantPage;

interface SectionProps {
  id: number;
  title: string;
  description: string;
  fields: FieldProps[];
  isFirst: boolean;
  isLast: boolean;
  isUnique: boolean;
}

function RegistrationSection(section: SectionProps) {
  const {title, fields, isFirst, isLast, isUnique} = section;
  const [isOpen, setIsOpen] = useState(false);

  let border = '';
  if (isFirst) {
    border += ' rounded-t-xl';
    if (!isUnique && !isOpen) {
      border += ' border-b-0';
    }
  }
  if (isLast && !isOpen) {
    border += ' rounded-b-xl';
  }
  if (isUnique && !isOpen) {
    border += ' rounded-b-xl';
  }

  let bgColor = '';
  if (isOpen) {
    bgColor += ' bg-blue-100 dark:bg-gray-700';
  } else {
    bgColor += ' bg-gray-100 dark:bg-gray-800';
  }

  let expandedBorder = '';
  if (isUnique || isLast) {
    expandedBorder += ' border-b rounded-b-xl';
  }

  return (
    <div>
      <div>
        <button
          type="button"
          disabled={fields.length === 0}
          className={`flex items-center justify-between w-full p-5 font-medium text-left border
                      border-gray-200 dark:border-gray-700 transition-all ${bgColor} ${border}`}
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
        <div
          className={`flex flex-col gap-2 px-5 py-5 dark:border-gray-700 border-r border-l ${expandedBorder}`}
        >
          {fields.map(field => (
            <Field key={field.id} {...field} />
          ))}
        </div>
      </div>
    </div>
  );
}
