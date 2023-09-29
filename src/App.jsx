import './App.css';
import {useEffect, lazy, Suspense} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Background from './Components/Background';
import Modal from './Components/Tailwind/Modal/Modal';
import useSettings from './hooks/useSettings';
import AuthRedirectPage from './pages/Auth/AuthRedirectPage';
import EventPage from './pages/Events/EventPage';
import ParticipantPage from './pages/Events/ParticipantPage';
import RegistrationFormPage from './pages/Events/RegformPage';
import Homepage from './pages/Homepage';
import LoadingFallback from './pages/LoadingFallback';
import SettingsPage from './pages/Settings';

const ScanPage = lazy(() => import('./pages/Scan'));

const App = () => {
  const {darkMode} = useSettings();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="h-full min-h-screen w-screen overflow-auto bg-gray-50 pb-32 dark:bg-gray-900">
      <BrowserRouter basename="/">
        <Background />
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
        <Modal />
      </BrowserRouter>
    </div>
  );
};

export default App;
