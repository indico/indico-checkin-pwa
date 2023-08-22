import {CalendarIcon} from '@heroicons/react/24/solid';
import IconFeather from '../../Components/Icons/Feather';
import {formatDatetime} from '../../utils/date';
import {Typography} from '../Tailwind/';

interface EventItemProps {
  item: {
    id: string;
    title: string;
    date: string;
  };
  onClick: () => void;
  quantity: number;
}

const EventItem = ({item, onClick, quantity}: EventItemProps) => {
  return (
    <div
      onClick={onClick}
      className="block p-6 bg-white border border-gray-200 rounded-lg shadow cursor-pointer
                 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex flex-1 items-center">
          <CalendarIcon className="w-6 h-6 min-w-[1.5rem] mr-3 text-primary" />
          <div className="flex flex-col">
            <Typography variant="body1" className="dark:text-white">
              {item.title}
            </Typography>
            <span className="w-fit bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
              {formatDatetime(item.date)}
            </span>
          </div>
        </div>
        <div className="flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-primary dark:bg-darkSecondary dark:text-secondary">
          <IconFeather className="w-4 h-4 mr-1" />
          <Typography variant="body1">{quantity}</Typography>
        </div>
      </div>
    </div>
  );
};

export default EventItem;
