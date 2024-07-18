import {ReactNode, createContext, useState} from 'react';
import PropTypes from 'prop-types';

interface SettingsContextProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  autoCheckin: boolean;
  setAutoCheckin: (v: boolean) => void;
  hapticFeedback: boolean;
  setHapticFeedback: (v: boolean) => void;
  soundEffect: string;
  setSoundEffect: (v: string) => void;
}

export const SettingsContext = createContext<SettingsContextProps>({
  darkMode: false,
  setDarkMode: () => {},
  autoCheckin: false,
  setAutoCheckin: () => {},
  hapticFeedback: false,
  setHapticFeedback: () => {},
  soundEffect: 'None',
  setSoundEffect: () => {},
});

export const SettingsProvider = ({children}: {children: ReactNode}) => {
  // On render, check if the user has a theme preference. If not, check if their system is set to dark mode. If so, set the theme to dark.
  // If neither, set the theme to light.
  const storedTheme = localStorage.getItem('theme');
  const isDarkMode =
    storedTheme === 'dark' ||
    (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [darkMode, setDarkMode] = useState(isDarkMode);

  const storedCheckin = JSON.parse(localStorage.getItem('autoCheckin') || 'false');
  const [autoCheckin, setAutoCheckin] = useState(storedCheckin);

  const storedHapticFeedback = JSON.parse(localStorage.getItem('hapticFeedback') || 'false');
  const [hapticFeedback, setHapticFeedback] = useState(storedHapticFeedback);

  const [soundEffect, setSoundEffect] = useState(localStorage.getItem('soundEffect') || 'None');

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        setDarkMode,
        autoCheckin,
        setAutoCheckin,
        soundEffect,
        setSoundEffect,
        hapticFeedback,
        setHapticFeedback,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
