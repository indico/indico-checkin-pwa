import {useEffect} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {CalendarDaysIcon, UserGroupIcon} from '@heroicons/react/20/solid';
import {ShieldCheckIcon, TrashIcon} from '@heroicons/react/24/solid';
import {useLiveQuery} from 'dexie-react-hooks';
import DropdownSettings from '../../Components/DropdownSettings';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import db from '../../db/db';
import useAppState from '../../hooks/useAppState';
import {NotFound} from '../NotFound';
import {refreshEvent, refreshRegforms} from './refresh';

const LOADING = Symbol('loading');

const EventPage = () => {
  const navigate = useNavigate();
  const {id: eventId} = useParams();
  const {state} = useLocation();
  const autoRedirect = state?.autoRedirect ?? false;
  const {enableModal} = useAppState();

  const event = useLiveQuery(() => db.events.get({id: Number(eventId)}), [], LOADING);
  const regforms = useLiveQuery(() => db.regForms.where({eventId: Number(eventId)}).toArray());

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      const event = await db.events.get({id: Number(eventId)});
      if (!event) {
        return;
      }
      const regforms = await db.regForms.where({eventId: Number(eventId)}).toArray();

      await refreshEvent(event, controller.signal, enableModal);
      await refreshRegforms(event, regforms, controller.signal, enableModal);
    }

    refresh().catch(err => {
      console.error(err);
      enableModal('Something went wrong when fetching updates', err.message);
    });

    return () => controller.abort();
  }, [eventId, enableModal]);

  useEffect(() => {
    if (autoRedirect && regforms?.length === 1) {
      navigate(`/event/${eventId}/${regforms[0].id}`);
    }
  }, [autoRedirect, navigate, eventId, regforms]);

  if (event === LOADING || !regforms) {
    return null;
  } else if (!event) {
    return <NotFound text="Event not found" icon={<CalendarDaysIcon />} />;
  }

  const navigateToRegform = (idx = 0) => {
    navigate(`/event/${eventId}/${regforms[idx].id}`);
  };

  const regformList = regforms.map((regForm, idx) => (
    <div
      key={idx}
      onClick={() => navigateToRegform(idx)}
      className="flex flex-wrap gap-2 justify-between p-6 bg-white border border-gray-200 rounded-lg shadow
                 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600"
    >
      <div className="flex flex-1 items-center">
        <IconFeather className="w-6 h-6 min-w-[1.5rem] mr-3 text-primary" />
        <Typography variant="body1" className="text-center dark:text-white">
          {regForm.title}
        </Typography>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex self-center items-center rounded-full overflow-hidden">
          <div className="flex items-center text-xs font-medium pl-2.5 py-0.5 bg-blue-100 text-primary dark:bg-darkSecondary dark:text-secondary">
            <ShieldCheckIcon className="w-4 h-4 mr-1" />
            <Typography variant="body1">{regForm.checkedInCount}</Typography>
          </div>
          <div className="flex items-center text-xs font-medium px-2.5 py-0.5 bg-blue-100 text-primary dark:bg-darkSecondary dark:text-secondary">
            <UserGroupIcon className="w-4 h-4 mr-1" />
            <Typography variant="body1">{regForm.registrationCount}</Typography>
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="px-4 pt-1">
      <div className="flex flex-row w-100 items-start justify-between gap-4">
        <div className="pt-2">
          <Breadcrumbs routeNames={[event.title]} routeHandlers={[null]} />
        </div>
        <DropdownSettings items={[{icon: <TrashIcon />, text: 'Delete event'}]} />
      </div>
      <div className="mt-6 flex flex-col gap-4">{regformList}</div>
    </div>
  );
};

export default EventPage;
