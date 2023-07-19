import {useLocation} from 'react-router-dom';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import {RegFormData} from '../../Models/EventData';

const RegistrationFormPage = () => {
  const {state: eventData}: {state: RegFormData} = useLocation(); // Get the state object passed from the previous page
  console.log('eventData:', eventData);

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      <Breadcrumbs className="ml-5" routeNames={[eventData.event.title, eventData.label]} />

      <Typography variant="h4" className="text-center mt-5">
        {eventData.label}
      </Typography>
    </div>
  );
};

export default RegistrationFormPage;
