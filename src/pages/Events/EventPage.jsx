import {useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {CalendarDaysIcon, CheckCircleIcon, UserGroupIcon} from '@heroicons/react/20/solid';
import {TrashIcon} from '@heroicons/react/24/solid';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import TopTab from '../../Components/TopTab';
import db, {deleteEvent as _deleteEvent} from '../../db/db';
import {useConfirmModal, useErrorModal} from '../../hooks/useModal';
import {formatDatetime} from '../../utils/date';
import {useQuery, isLoading, hasValue} from '../../utils/db';
import {wait} from '../../utils/wait';
import {NotFound} from '../NotFound';
import {syncEvent, syncRegforms} from './sync';
import {IndicoLink, Title} from './utils';

const EventPage = () => {
  const navigate = useNavigate();
  const {id: eventId} = useParams();
  const errorModal = useErrorModal();
  const confirmModal = useConfirmModal();

  const event = useQuery(() => db.events.get(Number(eventId)), [eventId]);
  const regforms = useQuery(
    () => db.regforms.where({eventId: Number(eventId)}).toArray(),
    [eventId]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function sync() {
      const event = await db.events.get({id: Number(eventId)});
      if (!event) {
        return;
      }

      await syncEvent(event, controller.signal, errorModal);
      await syncRegforms(event, controller.signal, errorModal);
    }

    sync().catch(err => {
      errorModal({title: 'Something went wrong when fetching updates', content: err.message});
    });

    return () => controller.abort();
  }, [eventId, errorModal]);

  const deleteEvent = async id => {
    try {
      await _deleteEvent(id);
    } catch (err) {
      errorModal({
        title: 'Something went wrong when deleting a registration form',
        content: err.message,
      });
    }
  };

  if (isLoading(event) || isLoading(regforms)) {
    return <TopTab />;
  } else if (!hasValue(event)) {
    return (
      <>
        <TopTab />
        <NotFound text="Event not found" icon={<CalendarDaysIcon />} />
      </>
    );
  }

  const navigateToRegform = (idx = 0) => {
    navigate(`/event/${eventId}/${regforms[idx].id}`, {state: {backBtnText: event.title}});
  };

  const regformList = regforms.map((regform, idx) => (
    <button
      key={idx}
      type="button"
      onClick={() => wait(100).then(() => navigateToRegform(idx))}
      className="flex items-center gap-2 justify-between p-6 bg-white rounded-xl shadow cursor-pointer
                 active:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:active:bg-gray-700 transition-all"
    >
      <div className="flex flex-1 items-center">
        <div className="flex flex-col gap-1 min-w-0">
          <Typography variant="body1" className="whitespace-nowrap text-ellipsis overflow-hidden">
            {regform.title}
          </Typography>
          {regform.isOpen && (
            <span
              className="w-fit bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5
                         rounded-full dark:bg-green-900 dark:text-green-300"
            >
              open
            </span>
          )}
          {regform.isOpen === false && (
            <span
              className="w-fit bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5
                         rounded-full dark:bg-red-900 dark:text-red-300"
            >
              closed
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex self-center items-center rounded-full overflow-hidden">
          <div
            className="flex items-center text-xs font-medium pl-2.5 py-0.5 bg-blue-100
                       text-primary dark:bg-darkSecondary dark:text-secondary"
          >
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            <Typography variant="body1">{regform.checkedInCount}</Typography>
          </div>
          <div
            className="flex items-center text-xs font-medium px-2.5 py-0.5 bg-blue-100
                       text-primary dark:bg-darkSecondary dark:text-secondary"
          >
            <UserGroupIcon className="w-4 h-4 mr-1" />
            <Typography variant="body1">{regform.registrationCount}</Typography>
          </div>
        </div>
      </div>
    </button>
  ));

  const settingsItems = [
    {
      text: 'Remove event',
      icon: <TrashIcon />,
      onClick: () => {
        if (!hasValue(event)) {
          return;
        }

        confirmModal({
          title: 'Are you sure?',
          content: 'You can always re-add the event by scanning its QR code',
          confirmBtnText: 'Delete',
          onConfirm: async () => {
            await deleteEvent(event.id);
            navigate(`/`);
          },
        });
      },
    },
  ];

  return (
    <>
      <TopTab settingsItems={settingsItems} />
      <div className="px-4 pt-1">
        <div className="flex flex-col items-center gap-2">
          <Title title={event.title} />
          <IndicoLink
            text="Indico event page"
            url={`${event.baseUrl}/event/${event.indicoId}/manage`}
          />
          <span
            className="w-fit bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5
                       rounded-full dark:bg-yellow-900 dark:text-yellow-300"
          >
            {formatDatetime(event.date)}
          </span>
        </div>
        {regformList.length === 0 && <NoRegformsBanner />}
        {regformList.length > 0 && <div className="mt-10 flex flex-col gap-4">{regformList}</div>}
      </div>
    </>
  );
};

export default EventPage;

function NoRegformsBanner() {
  return (
    <div className="mx-4 mt-10 bg-gray-100 dark:bg-gray-800 px-3 pb-2 rounded-xl">
      <div className="flex flex-col gap-2 items-center justify-center px-6 pt-10 pb-12 rounded-xl">
        <IconFeather className="w-14 text-gray-500" />
        <Typography variant="h3" className="text-center">
          There are no registration forms
        </Typography>
      </div>
    </div>
  );
}
