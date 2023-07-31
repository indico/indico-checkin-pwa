import {useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {ShieldCheckIcon, CalendarDaysIcon} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import {Toggle} from '../../Components/Tailwind/Toggle';
import {changeRegFormParticipant, getEventDetailsFromIds} from '../../db/utils';
import {ParticipantPageData} from '../../Models/EventData';
import {authFetch} from '../../utils/network';

const ParticipantPage = () => {
  const {state} = useLocation();
  const {autoCheckin} = state || {autoCheckin: false};
  const {id, regFormId, registrantId} = useParams();

  const [eventData, setEventData] = useState<ParticipantPageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [triedCheckIn, setTriedCheckIn] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Fetch the Participant Page data from IndexedDB
    const getParticipantPageData = async () => {
      // Get the full event data
      const fullData = await getEventDetailsFromIds({
        eventId: Number(id),
        regFormId: Number(regFormId),
        participantId: Number(registrantId),
      });

      if (!fullData) {
        console.log('Error getting full event details from ids');
        setIsLoading(false);
        return;
      }

      if (!fullData.event || !fullData.regForm || !fullData.participant) {
        console.log('Error getting full event details from ids');
        setIsLoading(false);
        return;
      }

      // Set the eventData
      const newEventData: ParticipantPageData = {
        event: {
          id: fullData.event.id,
          title: fullData.event.title,
          date: fullData.event.date,
          serverBaseUrl: fullData.event.server_base_url,
        },
        regForm: {
          label: fullData.regForm.label,
          id: fullData.regForm.id,
        },
        attendee: fullData.participant,
      };
      setEventData(newEventData);
      setIsLoading(false);
    };

    getParticipantPageData();
  }, [id, regFormId, registrantId]);

  const updateCheckedInStatus = (newStatus: boolean) => {
    setEventData(prevState => {
      if (!prevState) return null;

      return {
        ...prevState,
        attendee: {
          ...prevState.attendee,
          checked_in: newStatus,
        },
      };
    });
  };

  /**
   * Performs the Check In/Out action for the user
   * @param newCheckInState
   * @returns
   */
  const performCheckIn = useCallback(
    async (newCheckInState: boolean) => {
      // TODO: Only allow check-in if the participant's state is "complete" or "unpaid"

      if (!eventData) return;
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
        updateCheckedInStatus(newCheckInState);

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
      if (!triedCheckIn && autoCheckin === true) {
        if (!eventData) return;
        setTriedCheckIn(true);
        if (eventData?.attendee?.checked_in) {
          // Already checked in
          return;
        }

        // Send the check in request to the backend
        await performCheckIn(true);
      }
    };

    performAutoCheckIn();
  }, [eventData, performCheckIn, autoCheckin, triedCheckIn]);

  const navigate = useNavigate();

  const navigateBackTwice = () => {
    navigate(-2);
  };

  const navigateBack = () => {
    navigate(-1);
  };

  const onCheckInToggle = async () => {
    await performCheckIn(!eventData?.attendee?.checked_in);
  };

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      {eventData && (
        <>
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
                        !isLoading && eventData.attendee.checked_in
                          ? 'text-green-500'
                          : 'text-gray-400'
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
                      checked={eventData.attendee.checked_in}
                      onClick={onCheckInToggle}
                      rounded={false}
                      className="rounded-md after:rounded-md"
                      size="lg"
                    />
                  )}
                </div>
                {eventData.attendee.checked_in && (
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
        </>
      )}
    </div>
  );
};

export default ParticipantPage;
