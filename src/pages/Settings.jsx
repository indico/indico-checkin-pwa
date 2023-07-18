import {Toggle} from '../Components/Tailwind/Toggle';
import useSettings from '../hooks/useSettings';

const SettingsPage = () => {
  const {darkMode, setDarkMode} = useSettings();

  const toggleDarkMode = () => {
    // Set the theme preference in localStorage and in the SettingsContext
    const newDarkMode = !darkMode;
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    setDarkMode(newDarkMode);
  };

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      <h1 className="text-center">Settings</h1>

      <Toggle checked={darkMode} onClick={toggleDarkMode} />
    </div>
  );
};

export default SettingsPage;
