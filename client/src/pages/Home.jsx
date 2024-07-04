import React, { useState } from 'react';
import LofiRecommender from '../components/LofiRecommender';

const Home = () => {
    return (
        <div className="Home">
            <main className="Home-content">
                <LofiRecommender />
            </main>
        </div>
    );
};

export default Home;
