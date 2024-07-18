import React, { useState } from 'react';
import LofiRecommender from '../components/LofiRecommender';

const Home = () => {
    return (
        <div className="Home min-h-screen flex items-center justify-center bg-midnight-blue">
            <main className="Home-content w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <LofiRecommender />
            </main>
        </div>
    );
};

export default Home;
