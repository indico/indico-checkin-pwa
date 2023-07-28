import {useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {ShieldCheckIcon, CalendarDaysIcon} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import {Toggle} from '../../Components/Tailwind/Toggle';
import {changeRegFormParticipant} from '../../db/utils';
import {ParticipantPageData} from '../../Models/EventData';
import {authFetch} from '../../utils/network';

const ParticipantPage = () => {
  const {state: eventData}: {state: ParticipantPageData} = useLocation();
  const [checkedIn, setCheckedIn] = useState<boolean>(eventData?.attendee?.checked_in);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Performs the Check In/Out action for the user
   * @param newCheckInState
   * @returns
   */
  const performCheckIn = useCallback(
    async (newCheckInState: boolean) => {
      // TODO: Only allow check-in if the participant's state is "complete" or "unpaid"

      // Send the check in request to the backend
      setIsLoading(true);
      try {
        const body = JSON.stringify({checked_in: newCheckInState});
        const response = await authFetch(
          eventData?.event?.serverBaseUrl,
          `/api/checkin/event/${eventData?.event?.id}/registration/${eventData?.regForm?.id}/${eventData?.attendee?.id}`,
          {
            method: 'PATCH',
            body: body,
          }
        );
        if (!response) {
          console.log('Error checking in user');
          setIsLoading(false);
          return;
        }

        // Update the checked_in status in the database and the UI
        await changeRegFormParticipant(eventData?.attendee, newCheckInState);
        setCheckedIn(newCheckInState);

        setIsLoading(false);
      } catch (err) {
        console.log('Error checking in the user: ', err);
        setIsLoading(false);
        return;
      }
    },
    [eventData]
  );

  useEffect(() => {
    const performAutoCheckIn = async () => {
      // If performCheckIn is true, then automatically check in the user
      if (eventData.performCheckIn === true) {
        if (eventData?.attendee?.checked_in) {
          // Already checked in
          return;
        }

        // Send the check in request to the backend
        await performCheckIn(true);
      }
    };

    performAutoCheckIn();
  }, [eventData, performCheckIn]);

  const navigate = useNavigate();

  const navigateBackTwice = () => {
    navigate(-2);
  };

  const navigateBack = () => {
    navigate(-1);
  };

  const onCheckInToggle = async () => {
    await performCheckIn(!checkedIn);
  };

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      <div className="flex flex-row w-100 items-center justify-between ml-2">
        <Breadcrumbs
          routeNames={[eventData.event?.title, eventData.regForm?.label]}
          routeHandlers={[navigateBackTwice, navigateBack]}
        />

        <Typography variant="body3" className="mr-2">
          {eventData.event?.date}
        </Typography>
      </div>

      <div className="mt-6 ml-2 flex flex-col">
        <Typography variant="h2">{eventData.attendee.name}</Typography>

        <div className="mt-6 mr-8 relative">
          <div className="mx-auto w-full">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center">
                <ShieldCheckIcon
                  className={`w-6 h-6 mr-2 ${
                    !isLoading && checkedIn ? 'text-green-500' : 'text-gray-400'
                  }`}
                />
                <Typography variant="body2" className="font-bold">
                  Checked In
                </Typography>
              </div>

              {isLoading ? (
                <LoadingIndicator size="s" />
              ) : (
                <Toggle
                  checked={checkedIn}
                  onClick={onCheckInToggle}
                  rounded={false}
                  className="rounded-md after:rounded-md"
                  size="lg"
                />
              )}
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
