import {useLocation, useNavigate} from 'react-router-dom';
import {ArrowSmallLeftIcon} from '@heroicons/react/20/solid';
import Logo from '../assets/logo.png';
import {wait} from '../utils/wait';
import DropdownSettings, {SettingsItem} from './DropdownSettings';

export default function TopNav({
  backBtnText,
  backNavigateTo,
  settingsItems,
}: {
  backBtnText?: string;
  backNavigateTo?: string;
  settingsItems?: SettingsItem[];
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const {pathname} = useLocation();
  const state = location.state || {};

  const btnText = state.backBtnText || backBtnText || '';
  const page = state.backNavigateTo || backNavigateTo || -1;

  if (pathname === '/') {
    return (
      <div className="mb-4 flex justify-between bg-blue-600 p-2 dark:bg-blue-700">
        <div className="flex h-12 items-center gap-4" onClick={() => navigate('/')}>
          <img src={Logo} alt="Logo" width={48} height={48}></img>
          <span className="whitespace-nowrap text-xl font-semibold text-white dark:text-gray-200">
            Indico check-in
          </span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-10 mb-4 flex items-center justify-between bg-blue-600 p-2 dark:bg-blue-700">
        <button
          type="button"
          className="flex max-w-[60%] cursor-pointer items-center rounded-full transition-all
                     active:bg-blue-700 dark:active:bg-blue-600"
          onClick={async () => {
            await wait(100);
            navigate(page);
          }}
        >
          <ArrowSmallLeftIcon className="w-[2.5rem] min-w-[2.5rem] cursor-pointer text-white" />
          <span
            className="select-none overflow-hidden text-ellipsis whitespace-nowrap
                       pr-2 font-semibold text-gray-100"
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
