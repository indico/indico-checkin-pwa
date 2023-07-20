import {useNavigate} from 'react-router-dom';
import {Cog8ToothIcon} from '@heroicons/react/24/solid';
import Logo from '../assets/logo.png';
import WaveDark from '../assets/wave_dark_custom.svg';
import WaveLight from '../assets/wave_light_custom.svg';
import useSettings from '../hooks/useSettings';
import {clickableClassname} from '../utils/styles';
import {Typography} from './Tailwind';

const TopTab = () => {
  const {darkMode} = useSettings();
  const navigate = useNavigate();

  const onSettingsClick = () => {
    navigate('/settings');
  };

  const onLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="h-28 w-full relative">
      <div className="flex flex-row h-2/3 w-full justify-between items-center px-4">
        <div
          className={`flex flex-row h-full relative items-center ${clickableClassname}`}
          onClick={onLogoClick}
        >
          <img src={Logo} alt="Logo" className="h-2/3 mr-6"></img>

          <Typography variant="h3">Indico Check-in</Typography>
        </div>

        <Cog8ToothIcon
          className="h-7 dark:text-white active:opacity-50 hover:cursor-pointer"
          onClick={onSettingsClick}
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-full z-[-1]">
        <img
          src={darkMode ? WaveDark : WaveLight}
          alt="background"
          className="absolute w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default TopTab;
