import {Link, useLocation} from 'react-router-dom';
import {HomeIcon, QrCodeIcon, Cog6ToothIcon, UserGroupIcon} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  QrCodeIcon as QrCodeIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  UserGroupIcon as UserGroupIconSolid,
} from '@heroicons/react/24/solid';

export default function BottomNav() {
  const {pathname} = useLocation();

  return (
    <div className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-900">
      <div className="mx-auto grid h-full max-w-lg grid-cols-4 font-medium">
        <Link
          to="/"
          className="group inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {pathname === '/' ? (
            <HomeIconSolid className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          ) : (
            <HomeIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          )}
          <span
            className={`text-sm ${
              pathname === '/'
                ? 'text-blue-600 dark:text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Home
          </span>
        </Link>
        <Link
          to="/scan"
          className="group inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {pathname === '/scan' ? (
            <QrCodeIconSolid className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          ) : (
            <QrCodeIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          )}
          <span
            className={`text-sm ${
              pathname === '/scan'
                ? 'text-blue-600 dark:text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Scan
          </span>
        </Link>
        <Link
          to="/selfscan"
          className="group inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {pathname === '/selfscan' ? (
            <UserGroupIconSolid className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          ) : (
            <UserGroupIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          )}
          <span
            className={`text-sm ${
              pathname === '/selfscan'
                ? 'text-blue-600 dark:text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Self Scan
          </span>
        </Link>
        <Link
          to="/settings"
          className="group inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {pathname === '/settings' ? (
            <Cog6ToothIconSolid className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          ) : (
            <Cog6ToothIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          )}
          <span
            className={`text-sm ${
              pathname === '/settings'
                ? 'text-blue-600 dark:text-blue-500'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Settings
          </span>
        </Link>
      </div>
    </div>
  );
}
