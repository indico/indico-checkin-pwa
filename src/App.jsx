import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Background from './Components/Background';
import BottomTabs from './Components/BottomTabs';
import TopTab from './Components/TopTab';
import AddEventPage from './pages/AddEventPage';
import AuthRedirectPage from './pages/Auth/AuthRedirectPage';
import CheckInPage from './pages/CheckIn';
import EventPage from './pages/EventPage';
import Homepage from './pages/Homepage';
import SettingsPage from './pages/Settings';

const App = () => {
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
