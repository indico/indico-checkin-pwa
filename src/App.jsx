import './App.css';
import {useEffect} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Background from './Components/Background';
import BottomTabs from './Components/BottomTabs';
import TopTab from './Components/TopTab';
import useSettings from './hooks/useSettings';
import AuthRedirectPage from './pages/Auth/AuthRedirectPage';
import CheckInPage from './pages/CheckIn';
import AddEventPage from './pages/Events/AddEventPage';
import EventPage from './pages/Events/EventPage';
import ParticipantPage from './pages/Events/ParticipantPage';
import RegistrationFormPage from './pages/Events/RegFormPage';
import Homepage from './pages/Homepage';
import SettingsPage from './pages/Settings';

const App = () => {
  const {darkMode} = useSettings();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="w-screen min-h-screen bg-white dark:bg-gray-700">
      <BrowserRouter basename="/">
        <Background />
        <TopTab />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/event">
            <Route path="/event/:id" element={<EventPage />} />
            <Route path="/event/new" element={<AddEventPage />} />
            <Route path="/event/:id/:regFormId" element={<RegistrationFormPage />} />
            <Route path="/event/:id/:regFormId/:registrantId" element={<ParticipantPage />} />
          </Route>
          <Route path="/auth/redirect" element={<AuthRedirectPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <BottomTabs />
      </BrowserRouter>
    </div>
  );
};

export default App;
