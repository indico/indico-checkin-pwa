import {useState} from 'react';
import {ArrowTopRightOnSquareIcon} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';

export function Title({title}: {title: string}) {
  const [fullTitleVisible, setFullTitleVisible] = useState(false);

  return (
    <Typography
      variant="h2"
      className={`max-w-full cursor-pointer text-center break-words text-gray-600 ${
        !fullTitleVisible ? 'whitespace-nowrap text-ellipsis overflow-hidden' : ''
      }`}
    >
      <span onClick={() => setFullTitleVisible((v: boolean) => !v)}>{title}</span>
    </Typography>
  );
}

export function IndicoLink({url, text}: {url: string; text: string}) {
  return (
    <Typography variant="body2">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-500 hover:underline"
      >
        {text}
        <ArrowTopRightOnSquareIcon className="w-4" />
      </a>
    </Typography>
  );
}
