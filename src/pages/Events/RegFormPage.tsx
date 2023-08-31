import {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import {useLiveQuery} from 'dexie-react-hooks';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import Table, {rowProps} from '../../Components/Tailwind/Table';
import TopTab from '../../Components/TopTab';
import db from '../../db/db';
import useAppState from '../../hooks/useAppState';
import {NotFound} from '../NotFound';
import {syncEvent, syncParticipants, syncRegform} from './sync';

const LOADING = Symbol('loading');

const RegistrationFormPage = () => {
  const {id, regformId} = useParams();
  const navigate = useNavigate();
  const {enableModal} = useAppState();
  const [fullTitleVisible, setFullTitleVisible] = useState(false);

  const event = useLiveQuery(() => db.events.get(Number(id)), [id], LOADING);
  const regform = useLiveQuery(
    () => db.regforms.get({id: Number(regformId), eventId: Number(id)}),
    [id, regformId],
    LOADING
  );
  const participants = useLiveQuery(
    () => db.participants.where({regformId: Number(regformId)}).sortBy('fullName'),
    [regformId]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function sync() {
      const event = await db.events.get({id: Number(id)});
      const regform = await db.regforms.get({id: Number(regformId)});
      if (!event || !regform) {
        return;
      }

      await syncEvent(event, controller.signal, enableModal);
      await syncRegform(event, regform, controller.signal, enableModal);
      await syncParticipants(event, regform, controller.signal, enableModal);
    }

    sync().catch(err => {
      console.error(err);
      enableModal('Something went wrong when fetching updates', err.message);
    });
  }, [id, regformId, enableModal]);

  // Build the table rows array
  const tableRows: rowProps[] = useMemo(() => {
    if (!event || event === LOADING || !regform || regform === LOADING || !participants) {
      return [];
    }

    return participants.map(({id, checkedIn, fullName}) => ({
      value: fullName,
      useRightIcon: checkedIn,
      onClick: () => {
        navigate(`/event/${event.id}/${regform.id}/${id}`, {state: {backBtnText: regform.title}});
      },
    }));
  }, [event, regform, participants, navigate]);

  const topTab = (
    <TopTab settingsItems={[{text: 'Remove registration form', icon: <TrashIcon />}]} />
  );

  if (event === LOADING || regform === LOADING || !participants) {
    return topTab;
  }

  if (!event) {
    return (
      <>
        {topTab}
        <NotFound text="Event not found" icon={<CalendarDaysIcon />} />
      </>
    );
  } else if (!regform) {
    return (
      <>
        {topTab}
        <NotFound text="Registration form not found" icon={<IconFeather />} />
      </>
    );
  }

  return (
    <>
      <TopTab settingsItems={[{text: 'Remove registration form', icon: <TrashIcon />}]} />
      <div className="pt-1">
        <div>
          <div className="flex flex-col items-center gap-2 px-4">
            <Typography
              variant="h2"
              className={`max-w-full cursor-pointer text-center break-words text-gray-600 ${
                !fullTitleVisible ? 'whitespace-nowrap text-ellipsis overflow-hidden' : ''
              }`}
            >
              <span onClick={() => setFullTitleVisible(v => !v)}>{regform.title}</span>
            </Typography>
            <Typography variant="body2">
              <a
                href={`${event.baseUrl}/event/${event.indicoId}/manage/registration/${regform.indicoId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >
                Indico registration page
                <ArrowTopRightOnSquareIcon className="w-4" />
              </a>
            </Typography>
            <div className="flex items-center gap-2">
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
          </div>
          {participants.length === 0 && (
            <div className="mx-4 mt-6 bg-gray-100 dark:bg-gray-800 px-3 pb-2 rounded-xl">
              <div className="flex flex-col gap-2 items-center justify-center px-6 pt-10 pb-12 rounded-xl">
                <UserGroupIcon className="w-14 text-gray-500" />
                <Typography variant="h3" className="text-center">
                  There are no participants yet
                </Typography>
              </div>
            </div>
          )}
        </div>
        {participants.length > 0 && (
          <div className="mt-6">
            <Table rows={tableRows} RightIcon={ShieldCheckIcon} />
          </div>
        )}
      </div>
    </>
  );
};

export default RegistrationFormPage;
