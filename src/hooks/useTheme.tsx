import {useState, useEffect, useCallback} from 'react';

export type ThemeMode = 'light' | 'system' | 'dark';

export const useTheme = () => {
  // Calculate actual dark mode based on theme mode
  const getEffectiveDarkMode = useCallback((mode: ThemeMode): boolean => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  // Get the initial theme from localStorage or from user preferences
  const getInitialTheme = (): ThemeMode => {
    const storedTheme = localStorage.getItem('theme') as ThemeMode | null;

    if (storedTheme) {
      return storedTheme;
    }

    // Check if the user prefers dark (otherwise return light)
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'system' : 'light';
  };

  const [themeMode, setThemeModeInternal] = useState<ThemeMode>(getInitialTheme);
  const [darkMode, setDarkMode] = useState(getEffectiveDarkMode(themeMode));

  // Theme mode setter that updates both theme mode and dark mode
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

  return {
    themeMode,
    setThemeMode,
    darkMode,
  };
};
