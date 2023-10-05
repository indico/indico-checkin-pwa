import {useState} from 'react';
import {Typography} from '../../Components/Tailwind';

export default function Title({title}: {title: string}) {
  const [fullTitleVisible, setFullTitleVisible] = useState(false);

  return (
    <Typography
      variant="h2"
      className={`max-w-full cursor-pointer break-words text-center text-gray-600 ${
        !fullTitleVisible ? 'overflow-hidden text-ellipsis whitespace-nowrap' : ''
      }`}
    >
      <span onClick={() => setFullTitleVisible((v: boolean) => !v)}>{title}</span>
    </Typography>
  );
}
