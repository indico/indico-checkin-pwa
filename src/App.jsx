import './App.css';
import {useEffect} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Background from './Components/Background';
import BottomTabs from './Components/BottomTabs';
import Modal from './Components/Tailwind/Modal/Modal';
import useSettings from './hooks/useSettings';
import AuthRedirectPage from './pages/Auth/AuthRedirectPage';
import EventPage from './pages/Events/EventPage';
import ParticipantPage from './pages/Events/ParticipantPage';
import RegistrationFormPage from './pages/Events/RegFormPage';
import Homepage from './pages/Homepage';
import ScanPage from './pages/Scan';
import SettingsPage from './pages/Settings';

const App = () => {
  const {darkMode} = useSettings();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="w-screen min-h-screen h-full overflow-auto bg-gray-50 dark:bg-gray-900 pb-24">
      <BrowserRouter basename="/">
        <Background />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/event">
            <Route path="/event/:id" element={<EventPage />} />
            <Route path="/event/:id/:regformId" element={<RegistrationFormPage />} />
            <Route path="/event/:id/:regformId/:participantId" element={<ParticipantPage />} />
          </Route>
          <Route path="/auth/redirect" element={<AuthRedirectPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <BottomTabs />
        <Modal />
      </BrowserRouter>
    </div>
  );
};

export default App;
