import {createContext, ReactNode, useState} from 'react';
import {useTheme, ThemeMode} from '../hooks/useTheme';

interface SettingsContextValue {
  darkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (v: ThemeMode) => void;
  autoCheckin: boolean;
  setAutoCheckin: (v: boolean) => void;
  rapidMode: boolean;
  setRapidMode: (v: boolean) => void;
  hapticFeedback: boolean;
  setHapticFeedback: (v: boolean) => void;
  soundEffect: string;
  setSoundEffect: (v: string) => void;
  scanDevice: string;
  setScanDevice: (v: string) => void;
  requireRegistrationStateComplete: boolean;
  setRequireRegistrationStateComplete: (v: boolean) => void;
}

export const SettingsContext = createContext<SettingsContextValue>({
  darkMode: false,
  themeMode: 'system',
  setThemeMode: () => {},
  autoCheckin: false,
  setAutoCheckin: () => {},
  rapidMode: false,
  setRapidMode: () => {},
  hapticFeedback: false,
  setHapticFeedback: () => {},
  soundEffect: 'None',
  setSoundEffect: () => {},
  scanDevice: 'Camera',
  setScanDevice: () => {},
  requireRegistrationStateComplete: false,
  setRequireRegistrationStateComplete: () => {},
});

export const SettingsProvider = ({children}: {children: ReactNode}) => {
  const {themeMode, setThemeMode, darkMode} = useTheme();

  const storedAutoCheckin = JSON.parse(localStorage.getItem('autoCheckin') || 'false');
  const [autoCheckin, setAutoCheckin] = useState(storedAutoCheckin);

  const storedRapidMode = JSON.parse(localStorage.getItem('rapidMode') || 'false');
  const [rapidMode, setRapidMode] = useState(storedRapidMode);

  const storedHapticFeedback = JSON.parse(localStorage.getItem('hapticFeedback') || 'false');
  const [hapticFeedback, setHapticFeedback] = useState(storedHapticFeedback);

  const [soundEffect, setSoundEffect] = useState(localStorage.getItem('soundEffect') || 'None');

  const [scanDevice, setScanDevice] = useState(localStorage.getItem('scanDevice') || 'Camera');

  const storedRequireRegistrationStateComplete = JSON.parse(
    localStorage.getItem('requireRegistrationStateComplete') || 'false'
  );
  const [requireRegistrationStateComplete, setRequireRegistrationStateComplete] = useState(
    storedRequireRegistrationStateComplete
  );

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        themeMode,
        setThemeMode,
        autoCheckin,
        setAutoCheckin,
        rapidMode,
        setRapidMode,
        soundEffect,
        setSoundEffect,
        scanDevice,
        setScanDevice,
        hapticFeedback,
        setHapticFeedback,
        requireRegistrationStateComplete,
        setRequireRegistrationStateComplete,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
