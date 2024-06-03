import {useEffect, useState} from 'react';
import {useLoaderData, useLocation, useNavigate} from 'react-router-dom';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import {makeDefaultFilterState} from '../../Components/Tailwind/filters';
import IndicoLink from '../../Components/Tailwind/IndicoLink';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import Title from '../../Components/Tailwind/PageTitle';
import Table, {SearchData} from '../../Components/Tailwind/Table';
import TopNav from '../../Components/TopNav';
import {
  Event,
  Participant,
  Regform,
  deleteRegform as _deleteRegform,
  getEvent,
  getRegform,
  useLiveEvent,
  useLiveParticipants,
  useLiveRegform,
} from '../../db/db';
import {useConfirmModal, useErrorModal} from '../../hooks/useModal';
import {wait} from '../../utils/wait';
import {syncEvent, syncParticipants, syncRegform} from '../Events/sync';
import {NotFoundBanner} from '../NotFound';

interface Params {
  eventId: number;
  regformId: number;
}

export default function RegformPage() {
  const loaderData = useLoaderData() as {
    event?: Event;
    regform?: Regform;
    participants: Participant[];
    params: Params;
  };

  const {eventId, regformId} = loaderData.params;
  const event = useLiveEvent(eventId, loaderData.event);
  const regform = useLiveRegform(regformId, loaderData.regform);
  const participants = useLiveParticipants(regformId, loaderData.participants);

  return (
    <>
      <RegformTopNav event={event} regform={regform} />
      <RegformPageContent
        eventId={eventId}
        regformId={regformId}
        event={event}
        regform={regform}
        participants={participants}
      />
    </>
  );
}

function RegformPageContent({
  eventId,
  regformId,
  event,
  regform,
  participants,
}: {
  eventId: number;
  regformId: number;
  event?: Event;
  regform?: Regform;
  participants: Participant[];
}) {
  const navigate = useNavigate();
  const {state} = useLocation();
  const errorModal = useErrorModal();
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchData, _setSearchData] = useState({
    searchValue: state?.searchValue || '',
    filters: state?.filters || makeDefaultFilterState(),
  });

  const setSearchData = (data: SearchData) => {
    _setSearchData(data);
    // Save the search criteria in the location state. This way, the user can
    // go to a participant page and come back here w/o reseting the filters
    navigate('.', {replace: true, state: {...(state || {}), ...data}});
  };

  useEffect(() => {
    async function _sync() {
      const controller = new AbortController();
      const event = await getEvent(eventId);
      const regform = await getRegform({id: regformId, eventId});
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
  }, [eventId, regformId, errorModal]);

  if (!event) {
    return <NotFoundBanner text="Event not found" icon={<CalendarDaysIcon />} />;
  } else if (!regform) {
    return <NotFoundBanner text="Registration form not found" icon={<IconFeather />} />;
  }

  return (
    <>
      <div>
        <div className="flex flex-col items-center gap-2 px-4">
          <IconFeather className="w-16 text-blue-600 dark:text-blue-700" />
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
          <Table
            participants={participants}
            searchData={searchData}
            setSearchData={setSearchData}
            onRowClick={async (p: Participant) => {
              await wait(50);
              navigate(`/event/${event.id}/${regform.id}/${p.id}`, {state: {fromRegform: true}});
            }}
          />
        </div>
      )}
    </>
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
    <span className={`w-fit rounded-full px-2.5 py-0.5 text-sm font-medium ${color}`}>
      {isOpen ? 'Open' : 'Closed'}
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

function RegformTopNav({event, regform}: {event?: Event; regform?: Regform}) {
  const navigate = useNavigate();
  const errorModal = useErrorModal();
  const confirmModal = useConfirmModal();

  if (!event || !regform) {
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
      backNavigateTo={`/event/${event.id}`}
      settingsItems={[
        {
          text: 'Remove registration form',
          icon: <TrashIcon className="text-red-700 dark:text-red-500" />,
          onClick: () => {
            if (!event || !regform) {
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
