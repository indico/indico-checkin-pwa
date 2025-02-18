import {useEffect} from 'react';
import {useNavigate, useLoaderData} from 'react-router-dom';
import {CheckCircleIcon} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';
import {Participant, Event, Regform} from '../../db/db';

interface LoaderData {
  participant: Participant;
  event: Event;
  regform: Regform;
}

export default function CheckinConfirmation() {
  const {participant} = useLoaderData() as LoaderData;
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/selfscan', {replace: true});
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <CheckCircleIcon className="h-24 w-24 text-green-500" />
      <Typography variant="h1" className="mt-4 text-center">
        Checked in
      </Typography>
      <Typography variant="h2" className="mt-2 text-center">
        {participant.fullName}
      </Typography>
    </div>
  );
}
