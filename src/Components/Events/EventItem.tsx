import {TrashIcon} from '@heroicons/react/24/solid';
import useLongPress from '../../hooks/useLongPress';
import {CardFlip, Typography} from '../Tailwind/';

interface EventItemProps {
  item: {
    id: string;
    title: string;
    date: string;
    attendes: string[];
  };
  onClick: () => void;
  onLongPress: () => void;
}

const EventItem = ({item, onClick, onLongPress}: EventItemProps) => {
  const {handlers} = useLongPress({
    onLongPress: onLongPress,
    onPress: onClick,
  });

  return (
    <CardFlip isFlipped={true}>
      {/* FRONT COMPONENT */}
      <button
        className="w-full py-6 mb-3 px-4 mx-auto bg-secondary dark:bg-slate-600 rounded-xl active:opacity-50 shadow-sm border-[1px] 
        border-blue-400 shadow-slate-700 dark:border-slate-400 dark:shadow-slate-500 text-start"
        {...handlers}
      >
        <div className="flex flex-row w-full items-center">
          <Typography variant="body1">{item.title}</Typography>
        </div>

        <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
          {item.date}
        </Typography>
      </button>

      {/* BACK COMPONENT */}
      <div
        className="w-full py-6 mb-3 px-4 mx-auto bg-secondary dark:bg-slate-600 rounded-xl active:opacity-50 shadow-sm border-[1px] 
        border-blue-400 shadow-slate-700 dark:border-slate-400 dark:shadow-slate-500 text-start"
        {...handlers}
      >
        <div className="flex flex-row w-full justify-between items-center">
          <div>
            <div className="flex flex-row w-full items-center">
              <Typography variant="body1">{item.title}</Typography>
            </div>

            <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
              {item.date}
            </Typography>
          </div>

          <div className="mr-6">
            <TrashIcon className="h-7 w-7 text-red-600 hover:opacity-50" />
          </div>
        </div>
      </div>
    </CardFlip>
  );
};

export default EventItem;
