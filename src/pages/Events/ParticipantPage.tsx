import {useLocation, useNavigate} from 'react-router-dom';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
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

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      <div className="flex flex-row w-100 items-center justify-between">
        <Breadcrumbs
          className="ml-2"
          routeNames={[eventData.eventTitle, eventData.regFormLabel]}
          routeHandlers={[navigateBackTwice, navigateBack]}
        />

        <Typography variant="body3" className="mr-2">
          {eventData.eventDate}
        </Typography>
      </div>

      <div>
        <Typography variant="h2">{eventData.attendee.name}</Typography>
      </div>
    </div>
  );
};

export default ParticipantPage;
