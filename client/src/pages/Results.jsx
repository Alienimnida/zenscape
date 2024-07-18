import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../index.css';

const Results = () => {
    const { state } = useLocation();
    const { mood, activity } = state || {};
    const [recommendations, setRecommendations] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentGif, setCurrentGif] = useState('');
    const [loading, setLoading] = useState(true);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const gifList = [
        'https://www.gifcen.com/wp-content/uploads/2022/06/lofi-gif-2.gif',
        'https://www.gifcen.com/wp-content/uploads/2022/06/lofi-gif-6.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWE4aTVpbzQzeGcxOHltNjBicmc3MHFwYmsyMTdrZ2psMTA1ZnkyNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/euwykQ2WXfoq3EWgQt/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGFlcHppNWNvNG9yZ24yaTE4c3FqMjNvdW02Ynd4M2JqeXM0N3NxZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gDI6uVVVYEWVG/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3RjZmFhdjBvbTY3YWEyaTdmbmRmYmpoNWQ3OTYwZTJvcGV2ZGx4bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WwMewEqleDtDKT3fyb/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjlyMDJzODM0M2x6bzBlOWJ6YnVmZjVncGdtdmxrMmh5N3U4c2gwZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1fnu914Z79qQpVi2xZ/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXhsaTd1dzFlNnY0dGtyZDQyaDQxeDA0bzl2N2w4Z25tMTViOGtzayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/uBTWyINWTrWz6/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2NmY21hbnZmZjQxdmx2dG9tY3VhOG1vMTY2cm0xZTk5bWNwbG01aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gFPxNhzEWdFCCRAqf0/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnBvZGRwN3VuazhyODhwc3htMTlndDBsd3EzaHZzenNrZjQyanNmNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2seKKLp1n0sEeJLYTK/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHF0eWxnZWQ5OTA4eHd0aGE1cnVyOTV6NzJyZmFpaWJ4MjBycXFnMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TLOl2tSYNSZM0KnpcE/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWVmZTJva29naWkxemN2MnJyZWd5ZHM3MWQxYnAwZGt5d2hjMWtybyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/p3fc8pEjsoGC4/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExc25sY2J6d2p3Y3cxZHJzMTByemp4NDVra3Q4N3IzbzB6cml0MmRsYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SWhsTrEYSrGd4CAhNC/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmI4dWthM3k5M2tkd3o0bm03NHd3ZnNlanVxcmo1c2R4OTc1YmM1MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3MTQxYZeiDm12/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzU1Mjc5NmV2YXQxZ3o0bnozdnd2Z2k2eHZ5eGlyY3B5c3VubnRybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/V0Xds46wsXco73KJsY/giphy.gif'
    ];

    useEffect
        (() => {
            const auth = getAuth();
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    setUserId(null);
                }
            });

            return () => unsubscribe();
        }, []);

    useEffect
        (() => {
            if (mood && activity && userId) {
                const fetchRecommendations = async () => {
                    try {
                        setIsLoading(true);
                        const response = await axios.post('https://zenscape.vercel.app/recommendations', { userId, mood, activity });
                        setRecommendations(response.data.recommendations);
                        setLoading(false);
                        setIsLoading(false);
                    } catch (error) {
                        console.error('Error fetching recommendations:', error.message);
                        setLoading(false);
                        setIsLoading(false);
                    }
                };
                fetchRecommendations();
            }
        }, [mood, activity, userId]);

    useEffect(() => {
        if (recommendations.length > 0) {
            loadTrack(recommendations[0]);
        }
    }, [recommendations]);

    const loadTrack = async (track) => {
        setCurrentTrack(track);
        const randomGif = gifList[Math.floor(Math.random() * gifList.length)];
        setCurrentGif(randomGif);

        if (userId) {
            try {
                await axios.post('http://localhost:3001/play-song', {
                    userId,
                    trackId: `track-${track.uri}`
                });
            } catch (error) {
                console.error('Error recording song play:', error);
            }
        }
    };

    const toggleRecommendations = () => {
        setShowRecommendations(!showRecommendations);
    };

    if (!userId) {
        return <div>Please log in to see recommendations</div>;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-midnight-blue">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
                    <h2 className="text-xl font-semibold mt-4 text-white">Creating your vibe...</h2>
                    <p className="text-gray-300 mt-2">Finding the perfect lofi tracks for you</p>
                </div>
            </div>
        );
    }


    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center bg-midnight-blue fade-in p-4 sm:p-6 lg:p-8"
            style={{
                backgroundImage: `url(${currentGif})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="relative flex-1 w-full max-w-4xl">
                <button
                    onClick={toggleRecommendations}
                    className="fixed top-0 right-0 m-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md z-50 transition-colors duration-300"
                >
                    {showRecommendations ? 'Hide Recommendations' : 'Show Recommendations'}
                </button>
                {showRecommendations && (
                    <div className="fixed top-16 right-4 left-4 bg-white border border-gray-200 rounded-lg shadow-md overflow-auto max-h-80 z-50 w-auto sm:w-1/2 lg:w-1/3 sm:left-auto">
                        <ul>
                            {recommendations.map((track, index) => (
                                <li
                                    key={index}
                                    className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => loadTrack(track)}
                                >
                                    <div>
                                        <p className="text-lg font-medium">{track.name}</p>
                                        <p className="text-sm">{track.artist}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                )}
            </div>
            {currentTrack && (
                <div className="spotify-embed w-full max-w-lg mt-8 sm:mt-4" style={{ opacity: 0.7 }}>
                    <iframe
                        src={`https://open.spotify.com/embed/track/${currentTrack.uri.split(':')[2]}`}
                        width="100%"
                        height="80"
                        frameBorder="0"
                        allow="encrypted-media"
                        title={currentTrack.name}
                        style={{ backgroundColor: 'transparent' }}
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export default Results;