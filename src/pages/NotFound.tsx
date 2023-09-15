import {ReactElement} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Typography} from '../Components/Tailwind';

interface NotFoundProps {
  text: string;
  icon: ReactElement;
}

export const NotFound = ({text, icon}: NotFoundProps) => {
  const navigate = useNavigate();

  return (
    <div className="mx-4 rounded-xl bg-gray-100 dark:bg-gray-800">
      <div className="flex flex-col items-center justify-center rounded-xl px-6 pb-12 pt-10">
        <div className="w-14 text-gray-500">{icon}</div>
        <Typography variant="h3">{text}</Typography>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Go back
        </Button>
      </div>
    </div>
  );
};
