import {createContext, ReactNode, useState, useCallback, useEffect} from 'react';

export type ThemeMode = 'light' | 'system' | 'dark';

interface SettingsContextValue {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
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
  setDarkMode: () => {},
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
  // TODO: Maybe move this into its own separate file/hook?
  // Work out the actual dark mode based on theme mode
  const getEffectiveDarkMode = useCallback((mode: ThemeMode): boolean => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  const getInitialTheme = (): ThemeMode => {
    const storedTheme = localStorage.getItem('theme') as ThemeMode | null;
    if (storedTheme) {
      return storedTheme;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'system' : 'light';
  };

  const [themeMode, setThemeModeInternal] = useState<ThemeMode>(getInitialTheme);
  const [darkMode, setDarkMode] = useState(getEffectiveDarkMode(themeMode));

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeInternal(mode);
      localStorage.setItem('theme', mode);
      setDarkMode(getEffectiveDarkMode(mode));
    },
    [getEffectiveDarkMode]
  );

  // Update the theme when the system (OS) theme changes
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [themeMode]);

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
        setDarkMode,
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
