import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const LofiRecommender = () => {
  const [mood, setMood] = useState('');
  const [activity, setActivity] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mood.trim() === '' || activity.trim() === '') {
      setError('Please fill in both fields.');
      return;
    }
    navigate('/results', { state: { mood, activity } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-midnight-blue fade-in">
      <div className="max-w-md w-full mx-auto p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Lofi Music Recommender</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <label className="block mb-2">
            Enter your mood:
            <input
              type="text"
              value={mood}
              onChange={(e) => {
                setMood(e.target.value);
                setError('');
              }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </label>
          <label className="block mb-2">
            Enter your activity:
            <input
              type="text"
              value={activity}
              onChange={(e) => {
                setActivity(e.target.value);
                setError('');
              }}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </label>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            disabled={mood.trim() === '' || activity.trim() === ''}
            className={`bg-indigo-500 text-white py-2 px-4 rounded-md transition-colors duration-300 ${mood.trim() === '' || activity.trim() === '' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'
              }`}
          >
            Get Recommendations
          </button>
        </form>
      </div>
    </div>
  );
};

export default LofiRecommender;

