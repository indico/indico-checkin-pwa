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
import db, {Event, Regform, Participant} from '../../db/db';
import {useErrorModal} from '../../hooks/useModal';
import useSettings from '../../hooks/useSettings';
import {useIsOffline} from '../../utils/client';
import {formatDate} from '../../utils/date';
import {useQuery, isLoading, hasValue} from '../../utils/db';
import {NotFound} from '../NotFound';
import {checkIn} from './checkin';
import {Field, FieldProps} from './fields';
import {syncEvent, syncParticipant, syncRegform} from './sync';
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
  const {soundEffect} = useSettings();
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
    // reset autoCheckin from location state
    window.history.replaceState({}, document.title);
  }, [state]);

  const performCheckin = useCallback(
    async (event: Event, regform: Regform, participant: Participant, newCheckinState: boolean) => {
      if (offline) {
        errorModal({title: 'You are offline', content: 'Check-in requires an internet connection'});
        return;
      }

      setIsCheckinLoading(true);
      try {
        await checkIn(event, regform, participant, newCheckinState, soundEffect, errorModal);
      } catch (err: any) {
        errorModal({title: 'Could not update check-in status', content: err.message});
      } finally {
        setIsCheckinLoading(false);
      }
    },
    [offline, errorModal, soundEffect]
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

      setAutoCheckin(false);
      if (autoCheckin && !participant.checkedIn) {
        await performCheckin(event, regform, participant, true);
      } else {
        await syncEvent(event, controller.signal, errorModal);
        await syncRegform(event, regform, controller.signal, errorModal);
        await syncParticipant(event, regform, participant, controller.signal, errorModal);
      }
    }

    sync().catch(err => {
      errorModal({title: 'Something went wrong when fetching updates', content: err.message});
    });

    return () => controller.abort();
  }, [id, regformId, participantId, errorModal, autoCheckin, offline, performCheckin]);

  useEffect(() => {
    if (hasValue(participant)) {
      setNotes(participant.notes);
    }
  }, [participant]);

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

  const onCheckInToggle = async () => {
    if (!hasValue(event) || !hasValue(regform) || !hasValue(participant)) {
      return;
    }

    if (offline) {
      errorModal({title: 'You are offline', content: 'Check-in requires an internet connection'});
      return;
    }

    await performCheckin(event, regform, participant, !participant.checkedIn);
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
          <div className="mb-4 mt-4 flex justify-center">
            <CheckinToggle
              checked={participant.checkedIn}
              isLoading={isCheckinLoading}
              onClick={onCheckInToggle}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="h-6 w-6 text-primary dark:text-blue-500" />
                <Typography variant="body2">Registration Status</Typography>
              </div>
              <Typography variant="body2" className="font-bold capitalize">
                {participant.state}
              </Typography>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-6 w-6 text-primary dark:text-blue-500" />
                <Typography variant="body2">Registration Date</Typography>
              </div>
              <Typography variant="body2" className="font-bold">
                {formatDate(participant.registrationDate)}
              </Typography>
            </div>
          </div>
          <div className="mt-1 flex justify-center">
            <Typography variant="body1" className="w-full">
              <GrowingTextarea value={notes} onChange={onAddNotes} />
            </Typography>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-col px-4">{registrationData}</div>
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
          className={`flex w-full items-center justify-between border border-gray-200 p-5 text-left
                      font-medium transition-all dark:border-gray-700 ${bgColor} ${border}`}
          onClick={() => setIsOpen(o => !o)}
        >
          <Typography variant="h4" className="flex w-full justify-between">
            {title}
            {isOpen && <ChevronDownIcon className="h-6 w-6" />}
            {!isOpen && <ChevronLeftIcon className="h-6 w-6" />}
          </Typography>
        </button>
      </div>
      <div className={isOpen ? '' : 'hidden'}>
        <div
          className={`flex flex-col gap-2 border-l border-r px-5 py-5 dark:border-gray-700 ${expandedBorder}`}
        >
          {fields.map(field => (
            <Field key={field.id} {...field} />
          ))}
        </div>
      </div>
    </div>
  );
}
