import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../index.css';
import MusicPlaybar from '../components/MusicPlaybar';

const Results = () => {
    const { state } = useLocation();
    const { mood, activity } = state || {};
    const [recommendations, setRecommendations] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentGif, setCurrentGif] = useState('');
    const [loading, setLoading] = useState(true);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const gifList = [
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExazcydmNncno0bmZ5MG01MWR4c3BveDc1M3Yzd2c1cnNkZTBuZ3o0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WRRL1EKo9rNe12S4zh/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2NmY21hbnZmZjQxdmx2dG9tMTlndDBsd3EzaHZzenNrZjQyanNmNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gFPxNhzEWdFCCRAqf0/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnBvZGRwN3VuazhyODhwc3htMTlndDBsd3EzaHZzenNrZjQyanNmNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2seKKLp1n0sEeJLYTK/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHF0eWxnZWQ5OTA4eHd0aGE1cnVyOTV6NzJyZmFpaWJ4MjBycXFnMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TLOl2tSYNSZM0KnpcE/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExejB0d2hwOGptYmd4bDhseDMweG5kY2c3bzk3b2wwZDA0aHBlZWRpeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/H7llxoUnid1u27TkaH/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWVmZTJva29naWkxemN2MnJyZWd5ZHM3MWQxYnAwZGt5d2hjMWtybyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/p3fc8pEjsoGC4/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExc25sY2J6d2p3Y3cxZHJzMTByemp4NDVra3Q4N3IzbzB6cml0MmRsYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SWhsTrEYSrGd4CAhNC/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmI4dWthM3k5M2tkd3o0bm03NHd3ZnNlanVxcmo1c2R4OTc1YmM1MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3MTQxYZeiDm12/giphy.gif',
        'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzU1Mjc5NmV2YXQxZ3o0bnozdnd2Z2k2eHZ5eGlyY3B5c3VubnRybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/V0Xds46wsXco73KJsY/giphy.gif'
    ];

    useEffect(() => {
        if (mood && activity) {
            const fetchRecommendations = async () => {
                try {
                    const response = await axios.post('http://localhost:3001/recommendations', { mood, activity });
                    setRecommendations(response.data.recommendations);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching recommendations:', error.message);
                    setLoading(false);
                }
            };
            fetchRecommendations();
        }
    }, [mood, activity]);

    useEffect(() => {
        if (recommendations.length > 0) {
            loadTrack(recommendations[0]);
        }
    }, [recommendations]);

    const loadTrack = (track) => {
        const audio = new Audio(track.preview_url);
        setCurrentTrack({ audio, title: track.name, artist: track.artist });
        setIsPlaying(true);

        const randomGif = gifList[Math.floor(Math.random() * gifList.length)];
        setCurrentGif(randomGif);

        audio.addEventListener('ended', () => {
            if (currentTrackIndex + 1 < recommendations.length) {
                setCurrentTrackIndex(currentTrackIndex + 1);
                loadTrack(recommendations[currentTrackIndex + 1]);
            } else {
                setCurrentTrackIndex(0);
                loadTrack(recommendations[0]);
            }
        });
    };

    const playTrack = (previewUrl, title, artist) => {
        if (currentTrack) {
            currentTrack.audio.pause();
        }
        const audio = new Audio(previewUrl);
        audio.play();
        setCurrentTrack({ audio, title, artist });
        setIsPlaying(true);

        const randomGif = gifList[Math.floor(Math.random() * gifList.length)];
        setCurrentGif(randomGif);

        audio.addEventListener('ended', () => {
            if (currentTrackIndex + 1 < recommendations.length) {
                setCurrentTrackIndex(currentTrackIndex + 1);
                playTrack(recommendations[currentTrackIndex + 1].preview_url, recommendations[currentTrackIndex + 1].name, recommendations[currentTrackIndex + 1].artist);
            } else {
                setCurrentTrackIndex(0);
                playTrack(recommendations[0].preview_url, recommendations[0].name, recommendations[0].artist);
            }
        });
    };

    const pauseTrack = () => {
        if (currentTrack) {
            currentTrack.audio.pause();
            setIsPlaying(false);
        }
    };

    const nextTrack = () => {
        if (currentTrackIndex + 1 < recommendations.length) {
            setCurrentTrackIndex(currentTrackIndex + 1);
            playTrack(recommendations[currentTrackIndex + 1].preview_url, recommendations[currentTrackIndex + 1].name, recommendations[currentTrackIndex + 1].artist);
        } else {
            setCurrentTrackIndex(0);
            playTrack(recommendations[0].preview_url, recommendations[0].name, recommendations[0].artist);
        }
    };

    const previousTrack = () => {
        if (currentTrackIndex > 0) {
            setCurrentTrackIndex(currentTrackIndex - 1);
            playTrack(recommendations[currentTrackIndex - 1].preview_url, recommendations[currentTrackIndex - 1].name, recommendations[currentTrackIndex - 1].artist);
        } else {
            setCurrentTrackIndex(recommendations.length - 1);
            playTrack(recommendations[recommendations.length - 1].preview_url, recommendations[recommendations.length - 1].name, recommendations[recommendations.length - 1].artist);
        }
    };

    const handleVolumeChange = (value) => {
        if (currentTrack && currentTrack.audio) {
            currentTrack.audio.volume = value;
            setVolume(value);
        }
    };

    const toggleRecommendations = () => {
        setShowRecommendations(!showRecommendations);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-midnight-blue fade-in"
            style={{ backgroundImage: `url(${currentGif})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="relative flex-1">
                <button onClick={toggleRecommendations}
                    className="fixed top-0 right-0 m-4 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md z-50 transition-colors duration-300">
                    {showRecommendations ? 'Hide Recommendations' : 'Show Recommendations'}
                </button>
                {showRecommendations && (
                    <div className="fixed top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-md overflow-auto max-h-80 z-50">
                        <ul>
                            {recommendations.map((track, index) => (
                                <li key={index} className="py-2 px-4 hover:bg-gray-100 cursor-pointer">
                                    <div onClick={() => playTrack(track.preview_url, track.name, track.artist)}>
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
                <MusicPlaybar
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onPlayPause={isPlaying ? pauseTrack : () => playTrack(currentTrack.audio.src, currentTrack.title, currentTrack.artist)}
                    onPrevious={previousTrack}
                    onNext={nextTrack}
                    onVolumeChange={handleVolumeChange}
                    volume={volume}
                />
            )}
        </div>
    );
};

export default Results;
