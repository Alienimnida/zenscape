import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

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

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setIsLoggedIn(false);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-midnight-blue">
            <header className="text-center py-10">
                <h1 className="text-6xl font-bold text-white mb-4">Welcome to Zenscape</h1>
                <p className="text-2xl text-purple-200 mb-6">Discover your perfect lofi soundtrack.</p>
                <a href="#features" className="bg-cyan-400 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-cyan-300 transition duration-300">Get Started</a>
            </header>
            <section id="features" className="flex flex-wrap justify-center space-x-6 py-10 text-center text-white">
                <div className="bg-purple-600 bg-opacity-80 p-10 rounded-lg w-80 mb-8">
                    <h3 className="text-3xl font-bold mb-4">Curated Tracks</h3>
                    <p>Hand-picked lofi tracks tailored to your mood and activity.</p>
                </div>
                <div className="bg-purple-600 bg-opacity-80 p-10 rounded-lg w-80 mb-8">
                    <h3 className="text-3xl font-bold mb-4">Easy to Use</h3>
                    <p>Enter your mood and activity, and get instant recommendations.</p>
                </div>
                <div className="bg-purple-600 bg-opacity-80 p-10 rounded-lg w-80 mb-8">
                    <h3 className="text-3xl font-bold mb-4">Accessible Anywhere</h3>
                    <p>Access your personalized lofi music anytime, anywhere.</p>
                </div>
            </section>
            <section id="how-it-works" className="text-center py-10 text-white">
                <h2 className="text-4xl font-bold mb-6">How It Works</h2>
                <p className="max-w-2xl mx-auto mb-8 text-xl">Our AI-powered engine suggests the best lofi sub-genres based on your mood and activity. Experience a personalized music journey.</p>
                {isLoggedIn ? (
                    <div className="flex space-x-4 justify-center mt-6">
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-red-400 transition duration-300"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex space-x-4 justify-center mt-6">
                        <button
                            onClick={() => handleOpenModal('login')}
                            className="bg-green-500 text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-green-400 transition duration-300"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => handleOpenModal('signup')}
                            className="bg-blue-500 text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-blue-400 transition duration-300"
                        >
                            Sign Up
                        </button>
                    </div>
                )}
            </section>
            <footer className="bg-midnight-blue text-white py-6 text-center w-full">
                <div className="max-w-screen-xl mx-auto px-4">
                    <p className="mb-4">Made with ❤️ by Ankita Chakraborty</p>
                </div>
            </footer>
            {showModal && <Modal type={modalType} closeModal={handleCloseModal} />}
        </div>
    );
};

export default LandingPage;
