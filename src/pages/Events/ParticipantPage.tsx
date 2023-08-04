import {useCallback, useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {
  ShieldCheckIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
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

const exampleSection = {
  description: '',
  fields: [
    {
      data: 'Tomas',
      defaultValue: '',
      description: '',
      id: 880,
      inputType: 'text',
      title: 'First Name',
    },
    {
      data: 'Roun',
      defaultValue: '',
      description: '',
      id: 881,
      inputType: 'text',
      title: 'Last Name',
    },
    {
      data: 'tomas.roun@cern.ch',
      defaultValue: '',
      description: '',
      id: 882,
      inputType: 'email',
      title: 'Email Address',
    },
    {
      data: 'CERN',
      defaultValue: '',
      description: '',
      id: 883,
      inputType: 'text',
      title: 'Affiliation',
    },
    {
      choices: [
        {
          _modified: true,
          caption: 'Advanced Python',
          extraSlotsPay: false,
          id: 'a0a2fa62-9259-4b0b-97bc-070c4ef2db97',
          isEnabled: true,
          maxExtraSlots: 2,
          placesLimit: 0,
          price: 0,
        },
        {
          caption: 'B',
          extraSlotsPay: false,
          id: '6d1f0af3-6f23-46d0-b652-3b72fac3ad3e',
          isEnabled: true,
          maxExtraSlots: 2,
          placesLimit: 0,
          price: 0,
        },
      ],
      data: {'a0a2fa62-9259-4b0b-97bc-070c4ef2db97': 3},
      defaultValue: {},
      description: '',
      id: 1065,
      inputType: 'single_choice',
      title: 'test extra',
    },
    {
      data: 7,
      defaultValue: null,
      description: 'fdgfdgdfggd',
      id: 1067,
      inputType: 'number',
      price: 0,
      title: 'fgdgfd',
    },
    {
      choices: [
        {
          caption: 'No accommodation',
          id: '471ba223-e149-44a7-a076-4e1356dc0f79',
          isEnabled: true,
          isNoAccommodation: true,
          placesLimit: 0,
          price: 0,
        },
        {
          caption: 'a',
          id: 'abe74faf-5bc4-41c4-98bc-c02477f61795',
          isEnabled: true,
          isNoAccommodation: false,
          placesLimit: 0,
          price: 24.0,
        },
        {
          caption: 'b',
          id: 'bcc754d3-f45d-43f6-95d8-f0f0380628b3',
          isEnabled: true,
          isNoAccommodation: false,
          placesLimit: 4,
          price: 0,
        },
      ],
      data: {
        arrivalDate: '2022-12-20',
        choice: 'bcc754d3-f45d-43f6-95d8-f0f0380628b3',
        departureDate: '2022-12-24',
        isNoAccommodation: false,
      },
      defaultValue: {
        arrivalDate: null,
        choice: '471ba223-e149-44a7-a076-4e1356dc0f79',
        departureDate: null,
        isNoAccommodation: true,
      },
      description: '',
      id: 1068,
      inputType: 'accommodation',
      title: 'acc',
    },
    {
      data: true,
      defaultValue: false,
      description: 'r354fdgf',
      id: 1069,
      inputType: 'checkbox',
      price: 0,
      title: 'cc',
    },
  ],
  id: 879,
  title: 'Personal Data',
};

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
          <div className="mt-6 mb-20">
            {/* some weird TS error.. */}
            <RegistrationSection section={exampleSection} />
          </div>
        </>
      )}
    </div>
  );
};

export default ParticipantPage;

type InputType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'bool'
  | 'checkbox'
  | 'date'
  | 'country'
  | 'file'
  | 'single_choice'
  | 'multi_choice'
  | 'accommodation'
  | 'accompanying_persons';

interface Choice {
  id: string; // uuid
  caption: string;
}

interface Field {
  id: number;
  title: string;
  description: string;
  inputType: InputType;
  data: any;
  defaultValue: any;
  price?: number;
  choices?: Choice[]; // only for single/multi choice & accommodation
}

interface Section {
  id: number;
  title: string;
  description: string;
  fields: Field[];
}

function RegistrationSection({section}: {section: Section}) {
  const {title, fields} = section;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <h2 onClick={() => setIsOpen(o => !o)}>
        <button
          type="button"
          className="flex items-center justify-between w-full p-5 font-medium text-left text-gray-500
                     border border-b-0 border-gray-200 rounded-t-xl focus:ring-4 focus:ring-gray-200
                     dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-expanded={isOpen}
        >
          <span>{title}</span>
          {isOpen && <ChevronDownIcon className="w-6 h-6" />}
          {!isOpen && <ChevronLeftIcon className="w-6 h-6" />}
        </button>
      </h2>
      <div className={isOpen ? '' : 'hidden'}>
        <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
          {fields.map(field => (
            <RegistrationField key={field.id} field={field} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RegistrationField({field}: {field: Field}) {
  switch (field.inputType) {
    case 'text':
    case 'number':
    case 'email':
    case 'phone':
      return <TextField {...field} />;
    case 'checkbox':
      return <CheckboxField {...field} />;
    case 'single_choice':
      return <SingleChoiceField {...field} />;
    default:
      console.log('unhandled field', field);
      return null;
  }
}

function TextField({title, data}: Field) {
  return (
    <div>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="body1">{data}</Typography>
    </div>
  );
}

function CheckboxField({title, data}: Field) {
  return (
    <div>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="body1">{data ? 'yes' : 'no'}</Typography>
    </div>
  );
}

function SingleChoiceField({title, choices, data}: Field) {
  // data: {[uuid]: [number_of_choices]}
  const selected = Object.keys(data)[0];

  // nothing selected
  if (selected === undefined) {
    return (
      <div>
        <Typography variant="h4">{title}</Typography>
      </div>
    );
  }

  const amount = data[selected];
  // find the caption of the selected choice
  const caption = choices.find(choice => choice.id === selected).caption;

  return (
    <div>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="body1">
        {caption}: {amount}
      </Typography>
    </div>
  );
}
