import {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {ShieldCheckIcon} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';
import {Breadcrumbs} from '../../Components/Tailwind/Breadcrumbs';
import Table from '../../Components/Tailwind/Table';
import {updateRegForm} from '../../db/utils';
import {RegFormData} from '../../Models/EventData';
import {mockRegFormDetailsResponse} from '../../Models/mockResponses';
import {authFetch} from '../../utils/network';

const RegistrationFormPage = () => {
  const {state: eventData}: {state: RegFormData} = useLocation(); // Get the state object passed from the previous page
  console.log('eventData:', eventData);

  const navigate = useNavigate();

  const navigateBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    // Fetch the event data from the server
    const fetchRegFormData = async () => {
      /* const response = await authFetch(
        eventData.event.serverBaseUrl,
        `/api/checkin/event/${eventData?.event?.id}/registration/${eventData?.id}`
      ); */
      // TODO: Update with the info from the endpoint
      // Might need to update local data if the server data is different
      // console.log('Response: ', response);

      // TODO: Remove this after
      const mockResponse = mockRegFormDetailsResponse;
      // Compare the data from the server with the local data
      if (mockResponse.title !== eventData.label) {
        // Update the local data
        await updateRegForm(eventData.id, mockResponse.title);
      }
    };

    fetchRegFormData();

    /* return () => {
      // TODO: Abort the fetch request
    }; */
  }, [eventData]);

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      <div className="flex flex-row w-100 items-center justify-between">
        <Breadcrumbs
          className="ml-2"
          routeNames={[eventData.event?.title, eventData.label]}
          routeHandlers={[navigateBack, null]}
        />

        <Typography variant="body3" className="mr-2">
          {eventData.event?.date}
        </Typography>
      </div>

      <Table
        columnLabels={['Attendees']}
        rows={[['Joao Mesquita'], ['John Doe']]}
        className="w-5/6 m-auto mt-6"
        RightIcon={ShieldCheckIcon}
        useRightIcon={[true, false]}
      />
    </div>
  );
};

export default RegistrationFormPage;
