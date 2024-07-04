import React, { useState, useEffect } from 'react';
import '../index.css'
const MusicPlaybar = ({ currentTrack, isPlaying, onPlayPause, onPrevious, onNext, onVolumeChange }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = currentTrack?.audio;
        if (audio) {
            const updateCurrentTime = () => {
                setCurrentTime(audio.currentTime);
                setDuration(audio.duration);
            };
            audio.addEventListener('loadedmetadata', updateCurrentTime);
            audio.addEventListener('timeupdate', updateCurrentTime);

            return () => {
                audio.removeEventListener('loadedmetadata', updateCurrentTime);
                audio.removeEventListener('timeupdate', updateCurrentTime);
            };
        }
    }, [currentTrack]);

    const formatTime = (time) => {
        if (isNaN(time)) {
            return '00:00';
        }
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleProgressChange = (e) => {
        const newTime = e.target.value;
        if (currentTrack.audio) {
            currentTrack.audio.currentTime = newTime;
        }
    };

    return (
        <div className="music-playbar">
            <div className="music-playbar-controls">
                <button className="control-btn" onClick={onPrevious}>
                    <svg viewBox="0 0 24 24" className="control-icon">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"></path>
                    </svg>
                </button>
                <button className="control-btn" onClick={onPlayPause}>
                    {isPlaying ? (
                        <svg viewBox="0 0 24 24" className="control-icon">
                            <path d="M14 7h2v10h-2zM8 7h2v10H8z"></path>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" className="control-icon">
                            <path d="M8 5v14l11-7z"></path>
                        </svg>
                    )}
                </button>
                <button className="control-btn" onClick={onNext}>
                    <svg viewBox="0 0 24 24" className="control-icon">
                        <path d="M16 6h2v12h-2zm-8.5 6l8.5 6V6z"></path>
                    </svg>
                </button>
            </div>
            <div className="music-playbar-info">
                {currentTrack && (
                    <p className="music-playbar-title">{currentTrack.title}</p>
                )}
            </div>
            <div className="music-playbar-progress">
                <span className="time">{formatTime(currentTime)}</span>
                <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleProgressChange}
                    className="progress-bar"
                />
                <span className="time">{formatTime(duration)}</span>
            </div>
            <div className="music-playbar-volume">
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={currentTrack.audio?.volume || 0}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="volume-bar"
                />
            </div>
        </div>
    );
};

export default MusicPlaybar;

