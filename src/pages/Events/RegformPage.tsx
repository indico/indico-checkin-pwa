import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import BottomNav from '../../Components/BottomNav';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import Table, {rowProps} from '../../Components/Tailwind/Table';
import TopNav from '../../Components/TopNav';
import db, {Event, Participant, Regform, deleteRegform as _deleteRegform} from '../../db/db';
import {useConfirmModal, useErrorModal} from '../../hooks/useModal';
import {isLoading, hasValue, useQuery, DBResult} from '../../utils/db';
import {wait} from '../../utils/wait';
import {NotFound} from '../NotFound';
import {syncEvent, syncParticipants, syncRegform} from './sync';
import {IndicoLink, Title} from './utils';

export default function RegformPageWrapper() {
  const {id, regformId} = useParams();

  const event = useQuery(() => db.events.get(Number(id)), [id]);
  const regform = useQuery(
    () => db.regforms.get({id: Number(regformId), eventId: Number(id)}),
    [id, regformId]
  );
  const participants = useQuery(
    () => db.participants.where({regformId: Number(regformId)}).toArray(),
    [regformId]
  );

  const title = hasValue(regform) ? regform.title : '';

  return (
    <>
      <RegformTopNav event={event} regform={regform} />
      <RegformPage event={event} regform={regform} participants={participants} />
      <BottomNav backBtnText={title} />
    </>
  );
}

function RegformPage({
  event,
  regform,
  participants,
}: {
  event: DBResult<Event>;
  regform: DBResult<Regform>;
  participants: DBResult<Participant[]>;
}) {
  const {id, regformId} = useParams();
  const navigate = useNavigate();
  const errorModal = useErrorModal();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function _sync() {
      const controller = new AbortController();
      const event = await db.events.get({id: Number(id)});
      const regform = await db.regforms.get({id: Number(regformId)});
      if (!event || !regform) {
        return;
      }

      await syncEvent(event, controller.signal, errorModal);
      await syncRegform(event, regform, controller.signal, errorModal);
      await syncParticipants(event, regform, controller.signal, errorModal);
    }

    async function sync() {
      setIsSyncing(true);
      try {
        await _sync();
      } catch (err: any) {
        errorModal({title: 'Something went wrong when fetching updates', content: err.message});
      } finally {
        setIsSyncing(false);
      }
    }

    sync();
  }, [id, regformId, errorModal]);

  // Build the table rows array
  const tableRows: rowProps[] = useMemo(() => {
    if (!hasValue(event) || !hasValue(regform) || !hasValue(participants)) {
      return [];
    }

    return participants.map(({id, checkedIn, fullName, state, registrationDate}) => ({
      fullName,
      checkedIn,
      state,
      registrationDate,
      onClick: async () => {
        await wait(100);
        navigate(`/event/${event.id}/${regform.id}/${id}`, {
          state: {backBtnText: regform.title},
        });
      },
    }));
  }, [event, regform, participants, navigate]);

  if (isLoading(event) || isLoading(regform) || isLoading(participants)) {
    return null;
  }

  if (!event) {
    return <NotFound text="Event not found" icon={<CalendarDaysIcon />} />;
  } else if (!regform) {
    return <NotFound text="Registration form not found" icon={<IconFeather />} />;
  }

  return (
    <div className="pt-1">
      <div>
        <div className="flex flex-col items-center gap-2 px-4">
          <Title title={regform.title} />
          <IndicoLink
            text="Indico registration page"
            url={`${event.baseUrl}/event/${event.indicoId}/manage/registration/${regform.indicoId}`}
          />
          <div className="flex items-center gap-2">
            <RegformStatus isOpen={regform.isOpen} />
            <RegistrationCount
              checkedInCount={regform.checkedInCount}
              registrationCount={regform.registrationCount}
            />
          </div>
        </div>
      </div>
      {participants.length === 0 && isSyncing && <LoadingParticipantsBanner />}
      {participants.length === 0 && !isSyncing && <NoParticipantsBanner />}
      {participants.length > 0 && (
        <div className="mt-6">
          <Table rows={tableRows} />
        </div>
      )}
    </div>
  );
}

function RegformStatus({isOpen}: {isOpen: boolean | undefined}) {
  if (isOpen === undefined) {
    return null;
  }

  let color;
  if (isOpen) {
    color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  } else {
    color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }

  return (
    <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {isOpen ? 'open' : 'closed'}
    </span>
  );
}

function RegistrationCount({
  checkedInCount,
  registrationCount,
}: {
  checkedInCount: number;
  registrationCount: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center self-center overflow-hidden rounded-full">
        <div
          className="flex items-center bg-blue-100 py-0.5 pl-2.5 text-xs font-medium
                     text-primary dark:bg-darkSecondary dark:text-secondary"
        >
          <CheckCircleIcon className="mr-1 h-4 w-4" />
          <Typography variant="body1">{checkedInCount}</Typography>
        </div>
        <div
          className="flex items-center bg-blue-100 px-2.5 py-0.5 text-xs font-medium
                     text-primary dark:bg-darkSecondary dark:text-secondary"
        >
          <UserGroupIcon className="mr-1 h-4 w-4" />
          <Typography variant="body1">{registrationCount}</Typography>
        </div>
      </div>
    </div>
  );
}

function NoParticipantsBanner() {
  return (
    <div className="mx-4 mt-10 rounded-xl bg-gray-100 px-3 pb-2 dark:bg-gray-800">
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl px-6 pb-12 pt-10">
        <UserGroupIcon className="w-14 text-gray-500" />
        <Typography variant="h3" className="text-center">
          There are no registered participants
        </Typography>
      </div>
    </div>
  );
}

function LoadingParticipantsBanner() {
  return (
    <div className="mx-4 mt-10 flex flex-col gap-2">
      <Typography variant="h3" className="text-center">
        Updating participants..
      </Typography>
      <LoadingIndicator size="md" />
    </div>
  );
}

function RegformTopNav({event, regform}: {event: DBResult<Event>; regform: DBResult<Regform>}) {
  const navigate = useNavigate();
  const errorModal = useErrorModal();
  const confirmModal = useConfirmModal();

  if (!hasValue(event) || !hasValue(regform)) {
    return <TopNav />;
  }

  const deleteRegform = async (id: number) => {
    try {
      await _deleteRegform(id);
    } catch (err: any) {
      errorModal({
        title: 'Something went wrong when deleting a registration form',
        content: err.message,
      });
    }
  };

  return (
    <TopNav
      backBtnText={event.title}
      settingsItems={[
        {
          text: 'Remove registration form',
          icon: <TrashIcon />,
          onClick: () => {
            if (!hasValue(event) || !hasValue(regform)) {
              return;
            }

            confirmModal({
              title: 'Are you sure?',
              content: 'You can always re-add the registration form by scanning its QR code',
              confirmBtnText: 'Delete',
              onConfirm: async () => {
                await deleteRegform(regform.id);
                navigate(`/event/${event.id}`, {replace: true});
              },
            });
          },
        },
      ]}
    />
  );
}
