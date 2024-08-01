import {ChangeEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useLoaderData, useLocation, useNavigate} from 'react-router-dom';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  UserIcon,
  BanknotesIcon,
} from '@heroicons/react/20/solid';
import GrowingTextArea from '../../Components/GrowingTextArea';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import IndicoLink from '../../Components/Tailwind/IndicoLink';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import Title from '../../Components/Tailwind/PageTitle';
import {CheckinToggle} from '../../Components/Tailwind/Toggle';
import TopNav from '../../Components/TopNav';
import db, {
  Event,
  Regform,
  Participant,
  useLiveEvent,
  useLiveRegform,
  useLiveParticipant,
  getEvent,
  getRegform,
  getParticipant,
} from '../../db/db';
import {useErrorModal} from '../../hooks/useModal';
import useSettings from '../../hooks/useSettings';
import {useIsOffline} from '../../utils/client';
import {formatDatetime} from '../../utils/date';
import {makeDebounce} from '../../utils/debounce';
import {playVibration} from '../../utils/haptics';
import {playErrorSound} from '../../utils/sound';
import {checkIn} from '../Events/checkin';
import {syncEvent, syncParticipant, syncRegform} from '../Events/sync';
import {NotFoundBanner} from '../NotFound';
import AccompanyingPersons from './AccompanyingPersons';
import {Field, Section, getAccompanyingPersons} from './fields';
import {PaymentWarning, markAsUnpaid} from './payment';
import {RegistrationState} from './RegistrationState';

const debounce = makeDebounce(300);

interface Params {
  eventId: number;
  regformId: number;
  participantId: number;
}

export default function ParticipantPage() {
  const data = useLoaderData() as {
    event?: Event;
    regform?: Regform;
    participant?: Participant;
    params: Params;
  };

  const {eventId, regformId, participantId} = data.params;
  const event = useLiveEvent(eventId, data.event);
  const regform = useLiveRegform({id: regformId, eventId}, data.regform);
  const participant = useLiveParticipant({id: participantId, regformId}, data.participant);

  return (
    <>
      <ParticipantTopNav event={event} regform={regform} participant={participant} />
      <ParticipantPageContent
        eventId={eventId}
        regformId={regformId}
        participantId={participantId}
        event={event}
        regform={regform}
        participant={participant}
      />
    </>
  );
}

function ParticipantPageContent({
  eventId,
  regformId,
  participantId,
  event,
  regform,
  participant,
}: {
  eventId: number;
  regformId: number;
  participantId: number;
  event?: Event;
  regform?: Regform;
  participant?: Participant;
}) {
  const navigate = useNavigate();
  const {state} = useLocation();
  const [autoCheckin, setAutoCheckin] = useState(state?.autoCheckin ?? false);
  const {soundEffect, hapticFeedback} = useSettings();
  const offline = useIsOffline();
  const errorModal = useErrorModal();
  const [notes, setNotes] = useState(participant?.notes || '');
  const showCheckedInWarning = useRef<boolean>(!!state?.fromScan && !!participant?.checkedIn);

  useEffect(() => {
    // remove autoCheckin and fromScan from location state
    if (state?.autoCheckin !== undefined || state?.fromScan !== undefined) {
      const {autoCheckin, fromScan, ...rest} = state || {};
      navigate('.', {replace: true, state: rest});
    }
  }, [navigate, state]);

  useEffect(() => {
    if (showCheckedInWarning.current) {
      showCheckedInWarning.current = false;
      if (participant?.checkedIn && participant?.checkedInDt) {
        playErrorSound();
        if (hapticFeedback) {
          playVibration.error();
        }
        errorModal({
          title: 'Participant already checked in',
          content: `This participant was checked in on ${formatDatetime(participant.checkedInDt)}`,
        });
      }
    }
  }, [participant, errorModal, hapticFeedback]);

  const accompanyingPersons = useMemo(() => {
    if (participant?.registrationData) {
      return getAccompanyingPersons(participant.registrationData);
    }
    return [];
  }, [participant]);

  const performCheckin = useCallback(
    async (event: Event, regform: Regform, participant: Participant, newCheckinState: boolean) => {
      if (offline) {
        errorModal({title: 'You are offline', content: 'Check-in requires an internet connection'});
        return;
      }

      try {
        await checkIn(
          event,
          regform,
          participant,
          newCheckinState,
          soundEffect,
          hapticFeedback,
          errorModal
        );
      } catch (err: any) {
        errorModal({title: 'Could not update check-in status', content: err.message});
      } finally {
      }
    },
    [offline, errorModal, soundEffect, hapticFeedback]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function sync() {
      const event = await getEvent(eventId);
      const regform = await getRegform({id: regformId, eventId});
      const participant = await getParticipant({id: participantId, regformId});
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
  }, [eventId, regformId, participantId, errorModal, autoCheckin, offline, performCheckin]);

  if (!event) {
    return <NotFoundBanner text="Event not found" icon={<CalendarDaysIcon />} />;
  } else if (!regform) {
    return <NotFoundBanner text="Registration form not found" icon={<IconFeather />} />;
  } else if (!participant) {
    return <NotFoundBanner text="Participant not found" icon={<UserIcon />} />;
  }

  const onAddNotes = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    debounce(() => {
      db.participants.update(participant.id, {notes: e.target.value});
    });
  };

  const onCheckInToggle = async () => {
    if (!event || !regform || !participant) {
      return;
    }

    if (offline) {
      errorModal({title: 'You are offline', content: 'Check-in requires an internet connection'});
      return;
    }

    await performCheckin(event, regform, participant, !participant.checkedIn);
  };

  let registrationData;
  if (!participant?.registrationData) {
    registrationData = null;
  } else {
    const length = participant.registrationData.length;
    registrationData = participant.registrationData.map((data: Section, i: number) => {
      const section: SectionProps = {
        ...data,
        isFirst: i === 0,
        isLast: i === length - 1,
        isUnique: length === 1,
      };

      return <RegistrationSection key={section.id} {...section} />;
    });
  }

  return (
    <>
      <div className="px-4">
        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 px-4">
            <UserIcon className="w-16 text-blue-600 dark:text-blue-700" />
            <Title title={participant.fullName} />
            <IndicoLink
              text="Indico participant page"
              url={`${event.baseUrl}/event/${event.indicoId}/manage/registration/${regform.indicoId}/registrations/${participant.indicoId}`}
            />
            <div className="flex items-center gap-2">
              <RegistrationState state={participant.state} />
              {participant.price > 0 && (
                <span
                  className="w-fit rounded-full bg-purple-100 px-2.5 py-1 text-sm font-medium
                             text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                >
                  {participant.formattedPrice}
                </span>
              )}
            </div>
          </div>

          <div className="mb-4 mt-4 flex justify-center">
            <CheckinToggle
              checked={participant.checkedIn}
              isLoading={!!participant.checkedInLoading}
              onClick={onCheckInToggle}
            />
          </div>
          {participant.state === 'unpaid' && (
            <PaymentWarning
              event={event}
              regform={regform}
              participant={participant}
              errorModal={errorModal}
            />
          )}
          {accompanyingPersons.length > 0 && <AccompanyingPersons persons={accompanyingPersons} />}
          <Typography as="div" variant="body1" className="mt-1 flex w-full justify-center">
            <GrowingTextArea value={notes} onChange={onAddNotes} />
          </Typography>
        </div>
      </div>
      <div className="mt-5 flex flex-col px-4">{registrationData || <LoadingIndicator />}</div>
    </>
  );
}

function ParticipantTopNav({
  event,
  regform,
  participant,
}: {
  event?: Event;
  regform?: Regform;
  participant?: Participant;
}) {
  const {state} = useLocation();
  const errorModal = useErrorModal();

  if (!event || !regform || !participant) {
    return <TopNav />;
  }
  const backNavigateTo = state?.fromRegform ? -1 : `/event/${event.id}/${regform.id}`;

  if (participant.price === 0 || !participant.isPaid) {
    return <TopNav backBtnText={regform.title} backNavigateTo={backNavigateTo} />;
  }

  return (
    <TopNav
      backBtnText={regform.title}
      backNavigateTo={backNavigateTo}
      settingsItems={[
        {
          text: 'Mark as unpaid',
          icon: <BanknotesIcon className="text-green-500" />,
          onClick: async () => {
            if (!event || !regform || !participant) {
              return;
            }

            await markAsUnpaid(event, regform, participant, errorModal);
          },
        },
      ]}
    />
  );
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
