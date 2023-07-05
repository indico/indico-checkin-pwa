import {Typography} from '../Tailwind/';

interface EventItemProps {
  key: string;
  item: {
    id: string;
    title: string;
    date: string;
    attendes: string[];
  };
  onClick: () => void;
}

const EventItem = ({key, item, onClick}: EventItemProps) => {
  return (
    <div
      className="w-full py-6 mb-3 px-4 mx-auto bg-secondary dark:bg-slate-600 rounded-xl active:opacity-50 shadow-sm border-[1px] 
        border-blue-400 shadow-slate-700 dark:border-slate-400 dark:shadow-slate-500"
      key={key}
      onClick={onClick}
    >
      <div className="flex flex-row w-full items-center">
        <Typography variant="body1">{item.title}</Typography>
      </div>

      <Typography variant="body2" className="text-gray-700 dark:text-gray-300">
        {item.date}
      </Typography>
    </div>
  );
};

export default EventItem;
