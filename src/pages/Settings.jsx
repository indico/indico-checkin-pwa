import {useState} from 'react';
import {Toggle} from '../Components/Tailwind/Toggle';

const SettingsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    console.log('clicked');
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="mx-auto w-full h-full justify-center align-center mt-3">
      <h1 className="text-center">Settings</h1>

      <Toggle checked={isDarkMode} onClick={toggleDarkMode} />
    </div>
  );
};

export default SettingsPage;
