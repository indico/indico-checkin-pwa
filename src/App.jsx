import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import QrReader from "./pages/QrReader";
import BottomTabs from "./Components/BottomTabs";
import Background from "./Components/Background";
import TopTab from "./Components/TopTab";

const App = () => {
    return (
        <div>
            <BrowserRouter basename="/">
                <Background />

                <TopTab />

                <Routes>
                    <Route path="/" element={<Homepage />} />

                    <Route path="/qr-reader" element={<QrReader />} />
                </Routes>

                <BottomTabs />
            </BrowserRouter>
        </div>
    );
};

export default App;
