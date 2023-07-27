import {useLocation, useNavigate} from 'react-router-dom';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {Toggle} from '../../Components/Tailwind/Toggle';
import {ParticipantPageData} from '../../Models/EventData';

const ParticipantPage = () => {
  const {state: eventData}: {state: ParticipantPageData} = useLocation();

  const navigate = useNavigate();

  const navigateBackTwice = () => {
    navigate(-2);
  };

  const navigateBack = () => {
    navigate(-1);
  };

  const onCheckInToggle = () => {
    console.log('Check in toggle');
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

      <div className="mt-6 ml-2">
        <Typography variant="h2">{eventData.attendee.name}</Typography>

        <Typography variant="h4" className="mt-6">
          Checked In
        </Typography>
        <Toggle
          checked={eventData.attendee.checked_in}
          onClick={onCheckInToggle}
          rounded={false}
          className="rounded after:rounded"
          size="lg"
        />
      </div>
    </div>
  );
};

export default ParticipantPage;
