import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import QrReader from "./pages/QrReader";
import BottomTabs from "./Components/BottomTabs";
import Background from "./Components/Background";

const App = () => {
    return (
        <div>
            <BrowserRouter basename="/">
                <Background />

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
