import {ReactElement} from 'react';
import {useNavigate, useRouteError} from 'react-router-dom';
import {QuestionMarkCircleIcon} from '@heroicons/react/20/solid';
import {Button, Typography} from '../Components/Tailwind';

export function NotFoundBanner({text, icon}: {text: string; icon: ReactElement}) {
  const navigate = useNavigate();

  return (
    <div className="mx-4 rounded-xl bg-gray-100 dark:bg-gray-800">
      <div className="flex flex-col items-center justify-center rounded-xl px-6 pb-12 pt-10">
        <div className="w-14 text-gray-500">{icon}</div>
        <Typography variant="h3">{text}</Typography>
        <Button className="mt-6" onClick={() => navigate('/', {replace: true})}>
          Go back
        </Button>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const error = useRouteError() as Error | undefined;
  const message = error?.message || 'Not found';
  return (
    <div className="my-4">
      <NotFoundBanner text={message} icon={<QuestionMarkCircleIcon />} />
    </div>
  );
}
