import {useLocation, useNavigate} from 'react-router-dom';
import {ArrowSmallLeftIcon, ExclamationCircleIcon} from '@heroicons/react/20/solid';
import PropTypes from 'prop-types';
import Logo from '../assets/logo.png';
import {useIsOffline} from '../utils/client';
import {wait} from '../utils/wait';
import DropdownSettings from './DropdownSettings';

const TopTab = ({settingsItems}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {pathname} = useLocation();
  const {backBtnText = ''} = location.state || {};
  const offline = useIsOffline();

  const onLogoClick = () => {
    navigate('/');
  };

  const backPage = backBtnText ? -1 : '/';
  const backText = backBtnText || 'Home';

  if (pathname === '/') {
    return (
      <div className="flex justify-between mb-4 p-2 bg-blue-600 dark:bg-blue-700">
        <div className={`flex gap-4 h-12 items-center`} onClick={onLogoClick}>
          <img src={Logo} alt="Logo" className="h-full"></img>
          <span className="text-xl font-semibold whitespace-nowrap text-white dark:text-gray-200">
            Indico check-in
          </span>
        </div>
        <div className="flex items-center">
          {offline && <ExclamationCircleIcon className="min-w-[2rem] text-yellow-400" />}
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-center min-h-10 justify-between mb-4 p-2 bg-blue-600 dark:bg-blue-700">
        <button
          type="button"
          className="flex items-center max-w-[60%] rounded-full active:bg-blue-700 dark:active:bg-blue-600
                     cursor-pointer transition-all"
          onClick={async () => {
            await wait(100);
            navigate(backPage);
          }}
        >
          <ArrowSmallLeftIcon className="min-w-[2.5rem] w-[2.5rem] cursor-pointer text-white" />
          <span className="text-gray-100 pr-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis select-none">
            {backText}
          </span>
        </button>
        <div>{settingsItems.length > 0 && <DropdownSettings items={settingsItems} />}</div>
      </div>
    );
  }
};

TopTab.propTypes = {
  backBtnText: PropTypes.string,
  settingsItems: PropTypes.array,
};

TopTab.defaultProps = {
  backBtnText: '',
  settingsItems: [],
};

export default TopTab;
