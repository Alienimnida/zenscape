import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const LofiRecommender = () => {
  const [mood, setMood] = useState('');
  const [activity, setActivity] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    const box = document.querySelector('.box-3d');
    const { clientX, clientY } = e;
    const { left, top, width, height } = box.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const offsetX = (clientX - centerX) / 20;
    const offsetY = (clientY - centerY) / 20;
    box.style.transform = `rotateY(${offsetX}deg) rotateX(${offsetY}deg)`;
  };

  const handleMouseLeave = () => {
    const box = document.querySelector('.box-3d');
    box.style.transform = 'rotateY(0deg) rotateX(0deg)';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mood.trim() === '' || activity.trim() === '') {
      setError('Please fill in both fields.');
      return;
    }
    navigate('/results', { state: { mood, activity } });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-midnight-blue fade-in"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container-3d">
        <img className="capsule" src="/capsule.png" alt="Capsule" />
        <div className="box-3d">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Lofi Music Recommender</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-gray-700">How are you feeling today?</span>
              <input
                type="text"
                value={mood}
                onChange={(e) => {
                  setMood(e.target.value);
                  setError('');
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">What are you up to right now?</span>
              <input
                type="text"
                value={activity}
                onChange={(e) => {
                  setActivity(e.target.value);
                  setError('');
                }}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </label>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              disabled={mood.trim() === '' || activity.trim() === ''}
              className={`w-full py-3 rounded-md text-lg font-semibold transition-colors duration-300 ${mood.trim() === '' || activity.trim() === '' ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600'
                }`}
            >
              Get Recommendations
            </button>
          </form>
        </div>
        <div className="bowl">
          <img className="bowl" src="/Bowl.png" alt="Bowl" />
        </div>
      </div>
    </div>
  );
};

export default LofiRecommender;
