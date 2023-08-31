import {useLocation, useNavigate} from 'react-router-dom';
import {ArrowSmallLeftIcon, ExclamationCircleIcon} from '@heroicons/react/20/solid';
import PropTypes from 'prop-types';
import Logo from '../assets/logo.png';
import {useIsOffline} from '../utils/client';
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
      <div className="flex justify-between mb-4 p-2 bg-blue-600 dark:bg-blue-900">
        <div className={`flex gap-4 h-12 items-center`} onClick={onLogoClick}>
          <img src={Logo} alt="Logo" className="h-full"></img>
          <span className="text-2xl font-semibold whitespace-nowrap text-white dark:text-gray-300">
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
      <div className="flex items-center min-h-10 justify-between mb-4 p-2 bg-blue-600 dark:bg-blue-900">
        <div
          className="flex items-center rounded-xl transition-all hover:bg-blue-700 dark:hover:bg-blue-800
                     cursor-pointer"
          onClick={() => navigate(backPage)}
        >
          <ArrowSmallLeftIcon className="w-9 cursor-pointer text-white" />
          <span className="text-gray-100 pr-2 text-base font-semibold">{backText}</span>
        </div>
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
