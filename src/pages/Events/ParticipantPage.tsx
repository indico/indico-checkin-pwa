import {useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {ShieldCheckIcon, CalendarDaysIcon} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {Toggle} from '../../Components/Tailwind/Toggle';
import {ParticipantPageData} from '../../Models/EventData';

const ParticipantPage = () => {
  const {state: eventData}: {state: ParticipantPageData} = useLocation();

  const [checkedIn, setCheckedIn] = useState<boolean>(eventData.attendee?.checked_in);

  const navigate = useNavigate();

  const navigateBackTwice = () => {
    navigate(-2);
  };

  const navigateBack = () => {
    navigate(-1);
  };

  const onCheckInToggle = () => {
    console.log('Check in toggle');
    setCheckedIn(!checkedIn);
  };

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      <div className="flex flex-row w-100 items-center justify-between ml-2">
        <Breadcrumbs
          routeNames={[eventData.eventTitle, eventData.regFormLabel]}
          routeHandlers={[navigateBackTwice, navigateBack]}
        />

        <Typography variant="body3" className="mr-2">
          {eventData.eventDate}
        </Typography>
      </div>

      <div className="mt-6 ml-2 flex flex-col">
        <Typography variant="h2">{eventData.attendee.name}</Typography>

        <div className="mt-6 mr-8 relative">
          <div className="mx-auto w-full">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center">
                <ShieldCheckIcon
                  className={`w-6 h-6 mr-2 ${checkedIn ? 'text-green-500' : 'text-gray-400'}`}
                />
                <Typography variant="body2" className="font-bold">
                  Checked In
                </Typography>
              </div>

              <Toggle
                checked={checkedIn}
                onClick={onCheckInToggle}
                rounded={false}
                className="rounded-md after:rounded-md"
                size="lg"
              />
            </div>
            {checkedIn && (
              <div>
                <Typography variant="body2" className="mt-1 ml-8">
                  {`on: ${new Date().toLocaleString()}` /* TODO: Get the date */}
                </Typography>
              </div>
            )}

            <div className="flex flex-row items-center justify-between mt-6">
              <div className="flex flex-row items-center">
                <CalendarDaysIcon className="w-6 h-6 text-primary dark:text-secondary mr-2" />
                <Typography variant="body2" className="font-bold">
                  Registration Date
                </Typography>
              </div>

              <Typography variant="body2" className="mt-1 ml-8">
                {new Date().toLocaleString()}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantPage;
