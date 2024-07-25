import React, { useState, useEffect } from 'react';
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Results from "./pages/Results";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Modal from './components/Modal';
import SpotifyCallback from './components/SpotifyCallback';
const App = () => {
    const [modalType, setModalType] = useState(null);

    const openModal = (type) => {
        setModalType(type);
    };

    const closeModal = () => {
        setModalType(null);
    };

    return (
        <BrowserRouter>
            <div>
                {modalType && <Modal type={modalType} closeModal={closeModal} />}
                <Routes>
                    <Route path={"/"} element={<LandingPage />} />
                    <Route path={"/music"} element={<Home />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/callback" element={<SpotifyCallback />} />
                </Routes>
            </div>
        </BrowserRouter>
    );

}

export default App