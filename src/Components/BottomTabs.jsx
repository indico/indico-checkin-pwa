import {useLocation, useNavigate} from 'react-router-dom';
import {Cog8ToothIcon, HomeIcon, QrCodeIcon} from '@heroicons/react/20/solid';
import useAppState from '../hooks/useAppState';
import {useIsOffline} from '../utils/client';

const BottomTabs = () => {
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const offline = useIsOffline();
  const {enableModal} = useAppState();

  if (pathname === '/scan' || pathname === '/auth/redirect') {
    return null;
  }

  const goToScan = () => {
    if (offline) {
      enableModal('You are offline', 'Scanning QR codes requires an internet connection');
      return;
    }
    navigate('/scan');
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white dark:bg-gray-700 border-t border-gray-50 dark:border-gray-800">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        <button
          type="button"
          onClick={() => navigate('/', {replace: true})}
          style={{
            borderTopRightRadius: '10% 70%',
            borderBottomRightRadius: '10% 70%',
          }}
          className="inline-flex flex-col items-center justify-center px-5 transition-all active:bg-gray-200 dark:active:bg-gray-800 group"
        >
          <HomeIcon className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 transition-all group-active:text-blue-600 dark:group-active:text-blue-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400 transition-all group-active:text-blue-600 dark:group-active:text-blue-500">
            Home
          </span>
        </button>
        <div className="relative inline-flex flex-col items-center justify-center px-5">
          <button
            type="button"
            onClick={goToScan}
            className="absolute top-[-50%] text-white rounded-full p-1 bg-gray-50 dark:bg-gray-900 group"
          >
            <QrCodeIcon className="w-6 h-6 min-w-[3rem] min-h-[3rem] rounded-full p-2 bg-blue-600" />
          </button>
          <Cog8ToothIcon className="invisible w-6 h-6 mb-2" />
          <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
            Scan
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          style={{
            borderTopLeftRadius: '10% 70%',
            borderBottomLeftRadius: '10% 70%',
          }}
          className="inline-flex flex-col items-center justify-center px-5 active:bg-gray-200 dark:active:bg-gray-800 group"
        >
          <Cog8ToothIcon className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400 transition-all group-active:text-blue-600 dark:group-active:text-blue-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400 transition-all group-active:text-blue-600 dark:group-active:text-blue-500">
            Settings
          </span>
        </button>
      </div>
    </div>
  );
};

export default BottomTabs;
