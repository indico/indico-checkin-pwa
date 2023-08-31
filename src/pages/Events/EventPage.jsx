import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import {ShieldCheckIcon, TrashIcon} from '@heroicons/react/24/solid';
import {useLiveQuery} from 'dexie-react-hooks';
import {Typography} from '../../Components/Tailwind';
import TopTab from '../../Components/TopTab';
import db from '../../db/db';
import useAppState from '../../hooks/useAppState';
import {formatDatetime} from '../../utils/date';
import {NotFound} from '../NotFound';
import {syncEvent, syncRegforms} from './sync';

const LOADING = Symbol('loading');

const EventPage = () => {
  const navigate = useNavigate();
  const {id: eventId} = useParams();
  const {enableModal} = useAppState();
  const [fullTitleVisible, setFullTitleVisible] = useState(false);

  const event = useLiveQuery(() => db.events.get(Number(eventId)), [eventId], LOADING);
  const regforms = useLiveQuery(
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

      await syncEvent(event, controller.signal, enableModal);
      await syncRegforms(event, controller.signal, enableModal);
    }

    sync().catch(err => {
      console.error(err);
      enableModal('Something went wrong when fetching updates', err.message);
    });

    return () => controller.abort();
  }, [eventId, enableModal]);

  const topTab = <TopTab settingsItems={[{text: 'Remove event', icon: <TrashIcon />}]} />;

  if (event === LOADING || !regforms) {
    return topTab;
  } else if (!event) {
    return (
      <>
        {topTab}
        <NotFound text="Event not found" icon={<CalendarDaysIcon />} />
      </>
    );
  }

  const navigateToRegform = (idx = 0) => {
    navigate(`/event/${eventId}/${regforms[idx].id}`, {state: {backBtnText: event.title}});
  };

  const regformList = regforms.map((regform, idx) => (
    <div
      key={idx}
      onClick={() => navigateToRegform(idx)}
      className="flex gap-2 justify-between p-6 bg-white rounded-xl shadow cursor-pointer
                 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
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
            <ShieldCheckIcon className="w-4 h-4 mr-1" />
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
    </div>
  ));

  return (
    <>
      <TopTab settingsItems={[{text: 'Remove event', icon: <TrashIcon />}]} />
      <div className="px-4 pt-1">
        <div className="flex flex-col items-center gap-2">
          <Typography
            variant="h2"
            className={`max-w-full cursor-pointer text-center break-words text-gray-600 ${
              !fullTitleVisible ? 'whitespace-nowrap text-ellipsis overflow-hidden' : ''
            }`}
          >
            <span onClick={() => setFullTitleVisible(v => !v)}>{event.title}</span>
          </Typography>
          <Typography variant="body2">
            <a
              href={`${event.baseUrl}/event/${event.indicoId}/manage`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-500 hover:underline"
            >
              Indico event page
              <ArrowTopRightOnSquareIcon className="w-4" />
            </a>
          </Typography>
          <span
            className="w-fit bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5
                       rounded-full dark:bg-yellow-900 dark:text-yellow-300"
          >
            {formatDatetime(event.date)}
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-4">{regformList}</div>
      </div>
    </>
  );
};

export default EventPage;
