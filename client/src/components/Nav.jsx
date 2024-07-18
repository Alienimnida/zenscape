import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

const Nav = ({ isLoggedIn, handleOpenModal }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error.message);
        }
    };

    return (
        <nav className="flex flex-col md:flex-row justify-between items-center py-4 bg-midnight-blue px-4 md:px-6">
            <h1 className="text-2xl sm:text-3xl text-white font-bold mb-2 md:mb-0">Zenscape</h1>
            <div className="flex space-x-2 md:space-x-4">
                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-full text-sm md:text-lg font-semibold hover:bg-red-400 transition duration-300"
                    >
                        Logout
                    </button>
                ) : (
                    <>
                        <button
                            onClick={() => handleOpenModal('login')}
                            className="bg-green-500 text-white px-4 py-2 rounded-full text-sm md:text-lg font-semibold hover:bg-green-400 transition duration-300"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => handleOpenModal('signup')}
                            className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm md:text-lg font-semibold hover:bg-blue-400 transition duration-300"
                        >
                            Sign Up
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Nav;
