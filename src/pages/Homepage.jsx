import React, { useState, useEffect } from 'react';
import Dashboard from '../components/layout/Dashboard';
import '../style/Layout.css';
import '../App.css';
import HomeContent from './HomeContent';
import Discover from './Discover';

const HomePage = () => {

    return (
        <div className="body">
            <div style={{ display: 'flex', width: '100%' }}>
                <Dashboard />
                <div>
                    <Discover />

                </div>
            </div>
        </div>
    );
};

export default HomePage;
