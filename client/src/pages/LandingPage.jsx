import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { auth } from '../firebaseConfig';
import Nav from '../components/Nav';

const LandingPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('login');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Monitor authentication state and update the login state accordingly
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setIsLoggedIn(!!user);
        });

        return () => unsubscribe();
    }, []);

    const handleOpenModal = (type) => {
        setModalType(type);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleGetStarted = () => {
        if (isLoggedIn) {
            navigate('/music');
        } else {
            handleOpenModal('signup');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-midnight-blue">
            <Nav isLoggedIn={isLoggedIn} handleOpenModal={handleOpenModal} />
            <header className="text-center py-10 flex-grow flex flex-col justify-center items-center px-4 md:px-0">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4">Welcome to Zenscape</h1>
                <p className="text-base sm:text-lg md:text-2xl text-purple-200 mb-6">Discover your perfect lofi soundtrack.</p>
                <button
                    onClick={handleGetStarted}
                    className="bg-cyan-400 text-white px-6 py-3 md:px-8 md:py-4 rounded-full text-lg font-semibold hover:bg-cyan-300 transition duration-300"
                >
                    Get Started
                </button>
            </header>
            <section id="features" className="flex flex-col items-center py-10 px-4 text-center text-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
                    <div className="bg-purple-600 bg-opacity-80 p-6 rounded-lg">
                        <h3 className="text-2xl font-bold mb-4">Curated Tracks</h3>
                        <p>Hand-picked lofi tracks tailored to your mood and activity.</p>
                    </div>
                    <div className="bg-purple-600 bg-opacity-80 p-6 rounded-lg">
                        <h3 className="text-2xl font-bold mb-4">Easy to Use</h3>
                        <p>Enter your mood and activity, and get instant recommendations.</p>
                    </div>
                    <div className="bg-purple-600 bg-opacity-80 p-6 rounded-lg sm:col-span-2 lg:col-span-1">
                        <h3 className="text-2xl font-bold mb-4">Accessible Anywhere</h3>
                        <p>Access your personalized lofi music anytime, anywhere.</p>
                    </div>
                </div>
            </section>
            <section id="how-it-works" className="text-center py-10 text-white px-4 md:px-0">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
                <p className="max-w-2xl mx-auto mb-8 text-base sm:text-lg md:text-xl">Our AI-powered engine suggests the best lofi sub-genres based on your mood and activity. Experience a personalized music journey.</p>
            </section>
            <footer className="bg-midnight-blue text-white py-6 text-center w-full px-4 md:px-0">
                <div className="max-w-screen-xl mx-auto">
                    <p className="mb-4">Made with ❤️ by Ankita Chakraborty</p>
                </div>
            </footer>
            {showModal && <Modal type={modalType} closeModal={handleCloseModal} />}
        </div>
    );
};


export default LandingPage;
