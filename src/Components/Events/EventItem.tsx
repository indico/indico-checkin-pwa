import {MouseEventHandler, useState} from 'react';
import {TrashIcon} from '@heroicons/react/24/solid';
import useLongPress from '../../hooks/useLongPress';
import {CardFlip, Typography} from '../Tailwind/';

interface EventItemProps {
  item: {
    id: string;
    title: string;
    date: string;
  };
  onClick: () => void;
}

const EventItem = ({item, onClick}: EventItemProps) => {
  const onLongPress = () => {
    setIsFlipped(!isFlipped);
  };

  const {handlers} = useLongPress({
    onLongPress: onLongPress,
    onPress: onClick,
  });

  const [isFlipped, setIsFlipped] = useState(false);

  const onTrashClick: MouseEventHandler = e => {
    e.stopPropagation();
    console.log('Delete event...'); // TODO: Implement delete event
  };

  return (
    <CardFlip isFlipped={isFlipped}>
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
      <button
        className="w-full py-6 mb-3 px-4 mx-auto bg-secondary dark:bg-slate-600 rounded-xl active:opacity-50 shadow-sm border-[1px] 
        border-blue-400 shadow-slate-700 dark:border-slate-400 dark:shadow-slate-500 text-start relative"
        onMouseDown={handlers.onMouseDown}
        onMouseUp={handlers.onMouseUp}
        onTouchStart={handlers.onTouchStart}
        onTouchEnd={handlers.onTouchEnd}
      >
        <div className="flex flex-row w-full justify-between items-center h-full">
          <div>
            <div className="flex flex-row w-full items-center">
              <Typography variant="body1">{item.title}</Typography>
            </div>

            <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
              {item.date}
            </Typography>
          </div>

          <button className="mr-6">
            <TrashIcon className="h-7 w-7 text-red-600 active:opacity-50" onClick={onTrashClick} />
          </button>
        </div>
      </button>
    </CardFlip>
  );
};

export default EventItem;
