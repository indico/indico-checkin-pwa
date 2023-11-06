import {useNavigate} from 'react-router-dom';
import IconFeather from '../../Components/Icons/Feather';
import {Typography} from '../../Components/Tailwind';
import {Event} from '../../db/db';
import {formatDatetime} from '../../utils/date';
import {wait} from '../../utils/wait';

interface EventItemProps {
  event: Event;
  regformCount: number;
}

const EventItem = ({event, regformCount}: EventItemProps) => {
  const navigate = useNavigate();

  const onClick = async () => {
    await wait(50);
    navigate(`/event/${event.id}`);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="block cursor-pointer rounded-xl bg-white p-6 shadow transition-all
                 active:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:active:bg-gray-700"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <Typography variant="body1" className="overflow-hidden text-ellipsis whitespace-nowrap">
            {event.title}
          </Typography>
          <span
            className="mr-2 w-fit rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium
                       text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          >
            {formatDatetime(event.date)}
          </span>
        </div>
        <div
          className="flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium
                     text-primary dark:bg-darkSecondary dark:text-secondary"
        >
          <IconFeather className="mr-1 h-4 w-4" />
          <Typography variant="body1">{regformCount}</Typography>
        </div>
      </div>
    </button>
  );
};

export default EventItem;
