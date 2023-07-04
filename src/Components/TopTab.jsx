import {Cog8ToothIcon} from '@heroicons/react/24/solid';
import Logo from '../assets/logo.png';
import WaveDark from '../assets/wave_dark4.svg';
import WaveLight from '../assets/wave_light4.svg';
import {Typography} from './Tailwind';

const TopTab = () => {
  return (
    <div className="h-32 w-full relative">
      <div className="flex flex-row h-2/3 w-full justify-between items-center px-4">
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
        <img src={WaveLight} alt="background" className="absolute h-full w-full object-cover" />
      </div>
    </div>
  );
};

export default TopTab;
