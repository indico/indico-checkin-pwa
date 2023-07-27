import {createContext, useState} from 'react';
import PropTypes from 'prop-types';

const SettingsContext = createContext({});

export const SettingsProvider = ({children}) => {
  // On render, check if the user has a theme preference. If not, check if their system is set to dark mode. If so, set the theme to dark.
  // If neither, set the theme to light.
  const storedTheme = localStorage.getItem('theme');
  const isDarkMode =
    storedTheme === 'dark' ||
    (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [darkMode, setDarkMode] = useState(isDarkMode);
  const [autoCheckin, setAutoCheckin] = useState(
    JSON.parse(localStorage.getItem('autoCheckin') || false)
  );

  return (
    <SettingsContext.Provider value={{darkMode, setDarkMode, autoCheckin, setAutoCheckin}}>
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SettingsContext;
