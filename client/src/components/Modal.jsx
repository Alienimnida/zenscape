import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const Modal = ({ type, closeModal }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleEmailPasswordAuth = async () => {
        try {
            if (type === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            closeModal();
            navigate('/music');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGoogleAuth = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            closeModal();
            navigate('/music');
        } catch (err) {
            setError(err.message);
        }
    };

    const initiateSpotifyLogin = () => {
        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
        const redirectUri = encodeURIComponent('https://zenscape-app.vercel.app/callback');
        const scopes = encodeURIComponent('user-read-private user-read-email playlist-modify-private playlist-modify-public');
        const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`;
        window.location.href = spotifyAuthUrl;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.classList.contains('modal-backdrop')) {
                closeModal();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closeModal]);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 modal-backdrop bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
                <button
                    onClick={closeModal}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                >
                    &times;
                </button>
                <h2 className="text-2xl mb-4">{type === 'login' ? 'Login' : 'Sign Up'}</h2>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full mb-4 p-2 border rounded"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full mb-4 p-2 border rounded"
                />
                <button
                    onClick={handleEmailPasswordAuth}
                    className="bg-blue-500 text-white w-full py-2 mb-4 rounded"
                >
                    {type === 'login' ? 'Login' : 'Sign Up'}
                </button>
                <button
                    onClick={handleGoogleAuth}
                    className="bg-red-500 text-white w-full py-2 mb-4 rounded"
                >
                    {type === 'login' ? 'Login' : 'Sign Up'} with Google
                </button>
                <button
                    onClick={initiateSpotifyLogin}
                    className="bg-green-500 text-white w-full py-2 rounded"
                >
                    {type === 'login' ? 'Login' : 'Sign Up'} with Spotify
                </button>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default Modal;