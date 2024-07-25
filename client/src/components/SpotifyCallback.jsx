import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const hash = window.location.hash
            .substring(1)
            .split('&')
            .reduce((initial, item) => {
                if (item) {
                    const parts = item.split('=');
                    initial[parts[0]] = decodeURIComponent(parts[1]);
                }
                return initial;
            }, {});

        if (hash.access_token) {
            localStorage.setItem('spotifyAccessToken', hash.access_token);
            // Redirect to the main app page or wherever you want after successful login
            navigate('/music');
        }
    }, [navigate]);

    return <div>Processing Spotify login...</div>;
};

export default SpotifyCallback;