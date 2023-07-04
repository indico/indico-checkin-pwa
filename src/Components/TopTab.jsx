import {Cog8ToothIcon} from '@heroicons/react/24/solid';
import Logo from '../assets/logo.png';
import WaveDark from '../assets/wave_dark2.svg';
import WaveLight from '../assets/wave_light2.svg';
import {Typography} from './Tailwind';

const TopTab = () => {
  return (
    <div className="h-28 w-full relative">
      <div className="flex flex-row h-3/4 w-full justify-between items-center px-4">
        <div className="flex flex-row h-full relative items-center">
          <img src={Logo} alt="Logo" className="h-2/3 mr-6"></img>

          <Typography variant="h3">Indico Check-in</Typography>
        </div>

        <Cog8ToothIcon
          className="h-7 dark:text-white active:opacity-50 hover:cursor-pointer"
          onClick={() => console.log('clicked')}
        />
      </div>

      <div className="absolute top-0 left-0 w-full h-full z-[-1]">
        <img src={WaveLight} alt="background" className="absolute w-full" />
      </div>
    </div>
  );
};

export default TopTab;
