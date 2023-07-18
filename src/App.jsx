import './App.css';
import {useEffect} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Background from './Components/Background';
import BottomTabs from './Components/BottomTabs';
import TopTab from './Components/TopTab';
import useSettings from './hooks/useSettings';
import AddEventPage from './pages/AddEventPage';
import AuthRedirectPage from './pages/Auth/AuthRedirectPage';
import CheckInPage from './pages/CheckIn';
import EventPage from './pages/EventPage';
import Homepage from './pages/Homepage';
import SettingsPage from './pages/Settings';

const App = () => {
  const {darkMode, setDarkMode} = useSettings();

  useEffect(() => {
    // On render, check if the user has a theme preference. If not, check if their system is set to dark mode. If so, set the theme to dark.
    // If neither, set the theme to light.
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, [darkMode, setDarkMode]);

  return (
    <div className="w-100 h-100">
      <BrowserRouter basename="/">
        <Background />

        <TopTab />

        <Routes>
          <Route path="/" element={<Homepage />} />

          <Route path="/check-in" element={<CheckInPage />} />

          <Route path="/event/:id" element={<EventPage />} />

          <Route path="/event/new" element={<AddEventPage />} />

          <Route path="/auth/redirect" element={<AuthRedirectPage />} />

          <Route path="/settings" element={<SettingsPage />} />
        </Routes>

        <BottomTabs />
      </BrowserRouter>
    </div>
  );
};

export default App;
