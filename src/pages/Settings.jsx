import {Typography} from '../Components/Tailwind';
import {Toggle} from '../Components/Tailwind/Toggle';
import useSettings from '../hooks/useSettings';
import styles from './Settings.module.scss';

const SettingsPage = () => {
  const {darkMode, setDarkMode, autoCheckin, setAutoCheckin} = useSettings();

  const toggleDarkMode = () => {
    // Set the theme preference in localStorage and in the SettingsContext
    const newDarkMode = !darkMode;
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    setDarkMode(newDarkMode);
  };

  const toggleAutoCheckin = () => {
    localStorage.setItem('autoCheckin', !autoCheckin);
    setAutoCheckin(!autoCheckin);
  };

  return (
    <ul className={styles['settings-wrapper']}>
      <li>
        <Typography variant="h4">Use dark theme</Typography>
        <div>
          <Toggle checked={darkMode} onClick={toggleDarkMode} />
        </div>
      </li>
      <li>
        <Typography variant="h4">Check-in automatically when scanning a QR code</Typography>
        <div>
          <Toggle checked={autoCheckin} onClick={toggleAutoCheckin} />
        </div>
      </li>
    </ul>
  );
};

export default SettingsPage;
