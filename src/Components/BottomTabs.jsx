import {useNavigate} from 'react-router-dom';
import {HomeIcon, QrCodeIcon} from '@heroicons/react/20/solid';

const BottomTabs = () => {
  const navigation = useNavigate();

  const onHomeClick = () => {
    navigation('/');
  };

  const onQrCodeClick = () => {
    navigation('/check-in');
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
      <div className="grid h-full max-w-lg grid-cols-2 mx-auto font-medium">
        <button
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          onClick={onHomeClick}
        >
          <HomeIcon className="h-6 w-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
            All events
          </span>
        </button>
        <button
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          onClick={onQrCodeClick}
        >
          <QrCodeIcon className="h-6 w-6 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
            Check-in
          </span>
        </button>
      </div>
    </div>
  );
};

export default BottomTabs;
