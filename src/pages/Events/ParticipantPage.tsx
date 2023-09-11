import {ChangeEvent, useCallback, useEffect, useState} from 'react';
import {useLocation, useParams} from 'react-router-dom';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import GrowingTextarea from '../../Components/GrowingTextarea';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import {CheckinToggle} from '../../Components/Tailwind/Toggle';
import TopTab from '../../Components/TopTab';
import db from '../../db/db';
import {useErrorModal} from '../../hooks/useModal';
import {checkInParticipant, useIsOffline} from '../../utils/client';
import {formatDate} from '../../utils/date';
import {useQuery, isLoading, hasValue} from '../../utils/db';
import {NotFound} from '../NotFound';
import {Field, FieldProps} from './fields';
import {handleError, syncEvent, syncParticipant, syncRegform} from './sync';
import {IndicoLink, Title} from './utils';

const makeDebounce = (delay: number) => {
  let timer: number;
  return (fn: CallableFunction) => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
};

const debounce = makeDebounce(300);

const ParticipantPage = () => {
  const {state} = useLocation();
  const [autoCheckin, setAutoCheckin] = useState(state?.autoCheckin ?? false);
  const {id, regformId, participantId} = useParams();
  const offline = useIsOffline();
  const errorModal = useErrorModal();
  const [isCheckinLoading, setIsCheckinLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const event = useQuery(() => db.events.get(Number(id)), [id]);
  const regform = useQuery(
    () => db.regforms.get({id: Number(regformId), eventId: Number(id)}),
    [id, regformId]
  );
  const participant = useQuery(
    () => db.participants.get({id: Number(participantId), regformId: Number(regformId)}),
    [regformId, participantId]
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

      await syncEvent(event, controller.signal, errorModal);
      await syncRegform(event, regform, controller.signal, errorModal);
      await syncParticipant(event, regform, participant, controller.signal, errorModal);
    }

    sync().catch(err => {
      errorModal({title: 'Something went wrong when fetching updates', content: err.message});
    });

    return () => controller.abort();
  }, [id, regformId, participantId, errorModal]);

  const performCheckIn = useCallback(
    async (newCheckInState: boolean) => {
      if (!hasValue(event) || !hasValue(regform) || !hasValue(participant)) {
        return;
      }

      if (offline) {
        errorModal({title: 'You are offline', content: 'Check-in requires an internet connection'});
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
        handleError(response, 'Something went wrong when updating check-in status', errorModal);
      }
    },
    [event, regform, participant, errorModal, offline]
  );

  useEffect(() => {
    if (!hasValue(participant)) {
      return;
    }

    if (autoCheckin && !participant.checkedIn) {
      setAutoCheckin(false);
      setIsCheckinLoading(true);
      performCheckIn(true).finally(() => setIsCheckinLoading(false));
    }
  }, [participant, performCheckIn, autoCheckin]);

  useEffect(() => {
    if (hasValue(participant)) {
      setNotes(participant.notes);
    }
  }, [participant]);

  // Still loading
  if (isLoading(event) || isLoading(regform) || isLoading(participant)) {
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
    setIsCheckinLoading(true);
    performCheckIn(!participant.checkedIn).finally(() => setIsCheckinLoading(false));
  };

  const registrationData = participant.registrationData.map((data: Section, i: number) => {
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
          <div className="flex flex-col items-center">
            <Title title={participant.fullName} />
            <IndicoLink
              text="Indico participant page"
              url={`${event.baseUrl}/event/${event.indicoId}/manage/registration/${regform.indicoId}/registrations/${participant.indicoId}`}
            />
          </div>
          <div className="flex justify-center mt-4 mb-4">
            <CheckinToggle
              checked={participant.checkedIn}
              isLoading={isCheckinLoading}
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

interface Section {
  id: number;
  title: string;
  description: string;
  fields: FieldProps[];
}

interface SectionProps extends Section {
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
