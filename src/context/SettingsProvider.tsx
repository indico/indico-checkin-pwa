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
  strictCheckIn: boolean;
  setstrictCheckIn: (v: boolean) => void;
  checkOutEnabled: boolean;
  setcheckOutEnabled: (v: boolean) => void;
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
  strictCheckIn: false,
  setstrictCheckIn: () => {},
  checkOutEnabled: false,
  setcheckOutEnabled: () => {},
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

  const storedstrictCheckIn = JSON.parse(localStorage.getItem('strictCheckIn') || 'false');
  const [strictCheckIn, setstrictCheckIn] = useState(storedstrictCheckIn);

  const storedcheckOutEnabled = JSON.parse(localStorage.getItem('checkOutEnabled') || 'false');
  const [checkOutEnabled, setcheckOutEnabled] = useState(storedcheckOutEnabled);

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
        strictCheckIn,
        setstrictCheckIn,
        checkOutEnabled,
        setcheckOutEnabled,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
