import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import QrReader from "./pages/QrReader";

const App = () => {
    return (
        <div>
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#25292e",
                    zIndex: -1,
                }}
            />

            <BrowserRouter basename="/">
                <Routes>
                    <Route path="/" element={<Homepage />} />

                    <Route path="/qr-reader" element={<QrReader />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;
