import {useLocation, useNavigate} from 'react-router-dom';
import {ArrowSmallLeftIcon} from '@heroicons/react/20/solid';
import Logo from '../assets/logo.png';
import {wait} from '../utils/wait';
import DropdownSettings, {SettingsItem} from './DropdownSettings';

export default function TopNav({
  backBtnText,
  backNavigateTo,
  settingsItems,
  onBackBtnClick,
}: {
  backBtnText?: string;
  backNavigateTo?: string | number;
  settingsItems?: SettingsItem[];
  onBackBtnClick?: () => void;
}) {
  const navigate = useNavigate();
  const {pathname} = useLocation();

  const btnText = backBtnText || '';
  const page = backNavigateTo || '/';

  const onClick = async () => {
    if (onBackBtnClick) {
      onBackBtnClick();
    }
    navigate('/');
  };

  if (pathname === '/') {
    return (
      <div className="mb-4 flex justify-between bg-blue-600 p-2 dark:bg-blue-700">
        <div className="flex h-12 items-center gap-4" onClick={onClick}>
          <img src={Logo} alt="Logo" width={48} height={48}></img>
          <span className="whitespace-nowrap text-xl font-semibold text-white dark:text-gray-200">
            Indico check-in
          </span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="mb-4 flex min-h-10 items-center justify-between p-2">
        <button
          type="button"
          className="flex max-w-[60%] cursor-pointer items-center rounded-full transition-all
                     active:bg-blue-200/30 dark:active:bg-blue-800/30"
          onClick={async () => {
            await wait(50);
            // Typescript...
            if (typeof page === 'number') {
              if (onBackBtnClick) {
                onBackBtnClick();
              }
              navigate(page);
            } else {
              if (onBackBtnClick) {
                onBackBtnClick();
              }
              navigate(page);
            }
          }}
        >
          <ArrowSmallLeftIcon className="w-[2.5rem] min-w-[2.5rem] cursor-pointer text-gray-600 dark:text-gray-100" />
          <span
            className="select-none overflow-hidden text-ellipsis whitespace-nowrap
                       pr-2 font-semibold text-gray-600 dark:text-gray-100"
          >
            {btnText}
          </span>
        </button>
        <div>
          {settingsItems && settingsItems.length > 0 && <DropdownSettings items={settingsItems} />}
        </div>
      </div>
    );
  }
}
