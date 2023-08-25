import {useEffect, useMemo} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
  CalendarDaysIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import {useLiveQuery} from 'dexie-react-hooks';
import DropdownSettings from '../../Components/DropdownSettings';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import Table, {rowProps} from '../../Components/Tailwind/Table';
import db from '../../db/db';
import useAppState from '../../hooks/useAppState';
import {NotFound} from '../NotFound';
import {refreshEvent, refreshParticipants, refreshRegform} from './refresh';

const LOADING = Symbol('loading');

const RegistrationFormPage = () => {
  const {id, regformId} = useParams();
  const navigate = useNavigate();
  const {enableModal} = useAppState();

  const event = useLiveQuery(() => db.events.get({id: Number(id)}), [], LOADING);
  const regform = useLiveQuery(() => db.regForms.get({id: Number(regformId)}), [], LOADING);
  const participants = useLiveQuery(
    () => db.participants.where({regformId: Number(regformId)}).sortBy('id'),
    [regformId]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      const event = await db.events.get({id: Number(id)});
      const regform = await db.regForms.get({id: Number(regformId)});
      if (!event || !regform) {
        return;
      }

      await refreshEvent(event, controller.signal, enableModal);
      await refreshRegform(event, regform, controller.signal, enableModal);
      await refreshParticipants(event, regform, controller.signal, enableModal);
    }

    refresh().catch(err => {
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
      columns: [fullName],
      useRightIcon: checkedIn,
      onClick: () => {
        navigate(`/event/${event.id}/${regform.id}/${id}`);
      },
    }));
  }, [event, regform, participants, navigate]);

  if (event === LOADING || regform === LOADING || !participants) {
    return null;
  }

  if (!event) {
    return <NotFound text="Event not found" icon={<CalendarDaysIcon />} />;
  } else if (!regform) {
    return <NotFound text="Registration form not found" icon={<IconFeather />} />;
  }

  const navigateBack = () => {
    navigate(`/event/${event.id}`, {
      state: {autoRedirect: false}, // Don't auto redirect to the RegFormPage if there's only 1 form
      replace: true,
    });
  };

  return (
    <div className="pt-1">
      <div className="px-4">
        <div className="flex flex-row w-100 items-start justify-between gap-4">
          <div className="pt-2">
            <Breadcrumbs
              routeNames={[event.title, regform.title]}
              routeHandlers={[navigateBack, null]}
            />
          </div>
          <DropdownSettings
            items={[
              {icon: <TrashIcon />, text: 'Delete event'},
              {icon: <TrashIcon />, text: 'Delete registration form'},
            ]}
          />
        </div>
        {participants.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            <table className="border-spacing-4">
              <tbody>
                <tr>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="w-6 h-6 text-green-500" />
                      <Typography variant="body2">Checked-in participants</Typography>
                    </div>
                  </td>
                  <td className="text-right">
                    <span
                      className="bg-green-100 text-green-800 dark:text-green-200 text-base font-medium px-2.5 py-0.5
                                   rounded-full dark:bg-green-600"
                    >
                      {regform.checkedInCount}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="w-6 h-6 text-primary" />
                      <Typography variant="body2">Total participants</Typography>
                    </div>
                  </td>
                  <td className="text-right">
                    <span
                      className="bg-blue-100 dark:bg-blue-600 text-blue-800 text-base font-medium px-2.5 py-0.5
                                   rounded-full dark:text-blue-200"
                    >
                      {regform.registrationCount}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {participants.length === 0 && (
          <div className="mt-6 bg-gray-100 dark:bg-gray-800 px-3 pb-2 rounded-xl">
            <div className="flex flex-col gap-2 items-center justify-center px-6 pt-10 pb-12 rounded-xl">
              <UserGroupIcon className="w-14 text-gray-500" />
              <Typography variant="h3">There are no participants yet</Typography>
            </div>
          </div>
        )}
      </div>
      {participants.length > 0 && (
        <div className="mt-6">
          <Table columnLabels={['Attendees']} rows={tableRows} RightIcon={ShieldCheckIcon} />
        </div>
      )}
    </div>
  );
};

export default RegistrationFormPage;
