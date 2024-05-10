import {useEffect} from 'react';
import {useLoaderData, useNavigate} from 'react-router-dom';
import {CalendarDaysIcon, CheckCircleIcon, UserGroupIcon} from '@heroicons/react/20/solid';
import {TrashIcon} from '@heroicons/react/24/solid';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import IndicoLink from '../../Components/Tailwind/IndicoLink';
import Title from '../../Components/Tailwind/PageTitle';
import TopNav from '../../Components/TopNav';
import {
  Event,
  Regform,
  deleteEvent as _deleteEvent,
  getEvent,
  useLiveEvent,
  useLiveRegforms,
} from '../../db/db';
import {useHandleError} from '../../hooks/useError';
import {useConfirmModal, useErrorModal} from '../../hooks/useModal';
import {formatDatetime} from '../../utils/date';
import {wait} from '../../utils/wait';
import {syncEvent, syncRegforms} from '../Events/sync';
import {NotFoundBanner} from '../NotFound';

interface Params {
  eventId: number;
}

export default function EventPage() {
  const loaderData = useLoaderData() as {
    event?: Event;
    regforms: Regform[];
    params: Params;
  };

  const {eventId} = loaderData.params;
  const event = useLiveEvent(eventId, loaderData.event);
  const regforms = useLiveRegforms(eventId, loaderData.regforms);

  return (
    <>
      <EventTopNav event={event} />
      <EventPageContent eventId={eventId} event={event} regforms={regforms} />
    </>
  );
}

function EventPageContent({
  eventId,
  event,
  regforms,
}: {
  eventId: number;
  event?: Event;
  regforms: Regform[];
}) {
  const navigate = useNavigate();
  const handleError = useHandleError();

  useEffect(() => {
    const controller = new AbortController();

    async function sync() {
      const event = await getEvent(eventId);
      if (!event) {
        return;
      }

      await syncEvent(event, controller.signal, handleError);
      await syncRegforms(event, controller.signal, handleError);
    }

    sync().catch(err => {
      handleError(err, 'Something went wrong when fetching updates');
    });

    return () => controller.abort();
  }, [eventId, handleError]);

  if (!event) {
    return <NotFoundBanner text="Event not found" icon={<CalendarDaysIcon />} />;
  }

  const navigateToRegform = (idx = 0) => {
    navigate(`/event/${eventId}/${regforms[idx].id}`);
  };

  const regformList = regforms.map((regform, idx) => (
    <button
      key={idx}
      type="button"
      onClick={() => wait(50).then(() => navigateToRegform(idx))}
      className="flex cursor-pointer items-center justify-between gap-2 rounded-xl bg-white p-6 shadow
                 transition-all active:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:active:bg-gray-700"
    >
      <div className="flex flex-1 items-center">
        <div className="flex min-w-0 flex-col gap-1">
          <Typography variant="body1" className="text-wrap text-left">
            {regform.title}
          </Typography>
          {regform.isOpen && (
            <span
              className="w-fit rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium
                         text-green-800 dark:bg-green-900 dark:text-green-300"
            >
              Open
            </span>
          )}
          {regform.isOpen === false && (
            <span
              className="w-fit rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium
                         text-red-800 dark:bg-red-900 dark:text-red-300"
            >
              Closed
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center self-center overflow-hidden rounded-full">
          <div
            className="flex items-center bg-blue-100 py-0.5 pl-2.5 text-xs font-medium
                       text-primary dark:bg-darkSecondary dark:text-secondary"
          >
            <CheckCircleIcon className="mr-1 h-4 w-4" />
            <Typography variant="body1">{regform.checkedInCount}</Typography>
          </div>
          <div
            className="flex items-center bg-blue-100 px-2.5 py-0.5 text-xs font-medium
                       text-primary dark:bg-darkSecondary dark:text-secondary"
          >
            <UserGroupIcon className="mr-1 h-4 w-4" />
            <Typography variant="body1">{regform.registrationCount}</Typography>
          </div>
        </div>
      </div>
    </button>
  ));

  return (
    <div className="px-4">
      <div className="flex flex-col items-center gap-2">
        <CalendarDaysIcon className="w-16 text-blue-600 dark:text-blue-700" />
        <Title title={event.title} />
        <IndicoLink
          text="Indico event page"
          url={`${event.baseUrl}/event/${event.indicoId}/manage`}
        />
        <span
          className="mr-2 w-fit rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium
                       text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
        >
          {formatDatetime(event.date)}
        </span>
      </div>
      {regformList.length === 0 && <NoRegformsBanner />}
      {regformList.length > 0 && <div className="mt-10 flex flex-col gap-4">{regformList}</div>}
    </div>
  );
}

function NoRegformsBanner() {
  return (
    <div className="mx-4 mt-10 rounded-xl bg-gray-100 px-3 pb-2 dark:bg-gray-800">
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl px-6 pb-12 pt-10">
        <IconFeather className="w-14 text-gray-500" />
        <Typography variant="h3" className="text-center">
          There are no registration forms
        </Typography>
      </div>
    </div>
  );
}

function EventTopNav({event}: {event?: Event}) {
  const navigate = useNavigate();
  const errorModal = useErrorModal();
  const confirmModal = useConfirmModal();

  if (!event) {
    return <TopNav backBtnText="Events" backNavigateTo="/" />;
  }

  const deleteEvent = async (id: number) => {
    try {
      await _deleteEvent(id);
    } catch (err: any) {
      errorModal({
        title: 'Something went wrong when deleting a registration form',
        content: err.message,
      });
    }
  };

  const settingsItems = [
    {
      text: 'Remove event',
      icon: <TrashIcon className="text-red-700 dark:text-red-500" />,
      onClick: () => {
        if (!event) {
          return;
        }

        confirmModal({
          title: 'Are you sure?',
          content: 'You can always re-add the event by scanning its QR code',
          confirmBtnText: 'Delete',
          onConfirm: async () => {
            await deleteEvent(event.id);
            navigate(`/`, {replace: true});
          },
        });
      },
    },
  ];

  return <TopNav backBtnText="Events" backNavigateTo="/" settingsItems={settingsItems} />;
}
