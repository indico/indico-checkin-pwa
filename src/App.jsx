import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Background from './Components/Background';
import BottomTabs from './Components/BottomTabs';
import TopTab from './Components/TopTab';
import EventPage from './pages/EventPage';
import Homepage from './pages/Homepage';
import QrReader from './pages/QrReader';

const App = () => {
  return (
    <div className="w-100 h-100">
      <BrowserRouter basename="/">
        <Background />

        <TopTab />

        <Routes>
          <Route path="/" element={<Homepage />} />

          <Route path="/qr-reader" element={<QrReader />} />

          <Route path="/event/:id" element={<EventPage />} />
        </Routes>

        <BottomTabs />
      </BrowserRouter>
    </div>
  );
};

export default App;
