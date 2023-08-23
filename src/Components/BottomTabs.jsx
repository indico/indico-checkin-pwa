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
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600 shadow-2xl dark:shadow-gray-600">
      <div className="grid h-full max-w-lg grid-cols-2 mx-auto font-medium">
        <button
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          onClick={onHomeClick}
        >
          <HomeIcon className="h-6 w-6 mb-0.5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
            Home
          </span>
        </button>
        <button
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          onClick={onQrCodeClick}
        >
          <QrCodeIcon className="h-6 w-6 mb-0.5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
            Check-in
          </span>
        </button>
      </div>
    </div>
  );
};

export default BottomTabs;
