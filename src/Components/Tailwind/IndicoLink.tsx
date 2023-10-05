import {ArrowTopRightOnSquareIcon} from '@heroicons/react/20/solid';
import {Typography} from '../../Components/Tailwind';

export default function IndicoLink({url, text}: {url: string; text: string}) {
  return (
    <Typography variant="body2">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-500"
      >
        {text}
        <ArrowTopRightOnSquareIcon className="w-4" />
      </a>
    </Typography>
  );
}
