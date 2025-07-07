import {ReactNode, createContext, useState} from 'react';

interface SettingsContextProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  autoCheckin: boolean;
  setAutoCheckin: (v: boolean) => void;
  hapticFeedback: boolean;
  setHapticFeedback: (v: boolean) => void;
  soundEffect: string;
  setSoundEffect: (v: string) => void;
  scanDevice: string;
  setScanDevice: (v: string) => void;
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
  scanDevice: 'Camera',
  setScanDevice: () => {},
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

  const [scanDevice, setScanDevice] = useState(localStorage.getItem('scanDevice') || 'Camera');

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        setDarkMode,
        autoCheckin,
        setAutoCheckin,
        soundEffect,
        setSoundEffect,
        scanDevice,
        setScanDevice,
        hapticFeedback,
        setHapticFeedback,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
