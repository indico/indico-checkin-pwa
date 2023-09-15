import {useLocation, useNavigate} from 'react-router-dom';
import {ArrowSmallLeftIcon} from '@heroicons/react/20/solid';
import PropTypes from 'prop-types';
import Logo from '../assets/logo.png';
import {wait} from '../utils/wait';
import DropdownSettings from './DropdownSettings';

const TopTab = ({settingsItems}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {pathname} = useLocation();
  const {backBtnText = '', backNavigateTo = ''} = location.state || {};
  const backPage = backNavigateTo || (backBtnText ? -1 : '/');
  const backText = backBtnText || 'Home';

  const onLogoClick = () => {
    navigate('/', {replace: true});
  };

  if (pathname === '/') {
    return (
      <div className="mb-4 flex justify-between bg-blue-600 p-2 dark:bg-blue-700">
        <div className="flex h-12 items-center gap-4" onClick={onLogoClick}>
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
            navigate(backPage);
          }}
        >
          <ArrowSmallLeftIcon className="w-[2.5rem] min-w-[2.5rem] cursor-pointer text-white" />
          <span className="select-none overflow-hidden text-ellipsis whitespace-nowrap pr-2 font-semibold text-gray-100">
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
