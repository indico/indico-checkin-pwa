import IconFeather from '../../Components/Icons/Feather';
import {formatDatetime} from '../../utils/date';
import {Typography} from '../Tailwind/';

interface EventItemProps {
  event: {
    id: string;
    title: string;
    date: string;
  };
  onClick: () => void;
  quantity: number;
}

const EventItem = ({event, onClick, quantity}: EventItemProps) => {
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
          <Typography variant="body1">{quantity}</Typography>
        </div>
      </div>
    </button>
  );
};

export default EventItem;
