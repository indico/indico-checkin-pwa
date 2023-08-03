import {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {ShieldCheckIcon, CalendarDaysIcon} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';
import Badge from '../../Components/Tailwind/Badge';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {LoadingIndicator} from '../../Components/Tailwind/LoadingIndicator';
import {Toggle} from '../../Components/Tailwind/Toggle';
import {participantStates} from '../../db/db';
import {changeParticipantCheckIn, getEventDetailsFromIds} from '../../db/utils';
import useAppState from '../../hooks/useAppState';
import {ParticipantPageData} from '../../Models/EventData';
import {authFetch} from '../../utils/network';

const ParticipantPage = () => {
  const {state} = useLocation();
  const {autoCheckin} = state || {autoCheckin: false};
  const {id, regFormId, registrantId} = useParams();

  const [eventData, setEventData] = useState<ParticipantPageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [triedCheckIn, setTriedCheckIn] = useState(false);
  const {enableModal} = useAppState();

  const disableCheckIn = useMemo(() => {
    return ![participantStates.COMPLETE, participantStates.UNPAID].includes(
      eventData?.attendee?.state ?? ''
    );
  }, [eventData?.attendee?.state]);

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

      if (!fullData || !fullData.event || !fullData.regForm || !fullData.participant) {
        enableModal(
          'Error getting the participant data',
          "Couldn't fetch the event, form or participant data"
        );
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
  }, [id, regFormId, registrantId, enableModal]);

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
      if (!eventData) {
        enableModal('App is in an invalid state', "Couldn't find the participant data");
        return;
      }

      // Only allow check-in if the participant's state is "complete" or "unpaid"
      if (disableCheckIn) {
        enableModal(
          'Unable to check in',
          `Cannot check in user with state: ${eventData?.attendee?.state}`
        );
        return;
      }

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
          enableModal('Error checking in user', 'No response from the server');
          setIsLoading(false);
          return;
        }

        // Update the checked_in status in the database and the UI
        await changeParticipantCheckIn(eventData?.attendee, newCheckInState);
        updateCheckedInStatus(newCheckInState);

        setIsLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          enableModal('Error checking in the user', err.message);
        } else {
          enableModal('Error checking in');
        }
        setIsLoading(false);
        return;
      }
    },
    [eventData, disableCheckIn, enableModal]
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
    if (!eventData) return;

    navigate(`/event/${eventData.event?.id}`, {
      state: {autoRedirect: false}, // Don't auto redirect to the RegFormPage if there's only 1 form
      replace: true,
    });
  };

  const navigateBack = () => {
    if (!eventData || !eventData.event) return;

    navigate(`/event/${eventData.event?.id}/${eventData.regForm.id}`, {
      replace: true,
    });
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

          <div className="mt-6 ml-2 flex flex-col mr-4">
            <div className="flex flex-row items-center justify-between">
              <Typography variant="h2">{eventData.attendee.full_name}</Typography>

              {eventData.attendee.state !== participantStates.COMPLETE && (
                <Badge
                  text={eventData.attendee.state}
                  size="md"
                  className="rounded-full"
                  colorClassName="text-danger dark:text-danger border-danger"
                />
              )}
            </div>

            <div className="mt-6 relative">
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
                      disabled={disableCheckIn}
                    />
                  )}
                </div>
                {eventData.attendee.checked_in && (
                  <div>
                    <Typography variant="body2" className="mt-1 ml-8">
                      {`on: ${eventData.attendee.checked_in_dt}` /* TODO: Get the date */}
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
                    {eventData.attendee.registration_date}
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
