import React, { useState, useEffect } from 'react';
import Dashboard from '../components/layout/Dashboard';
import Footer from '../components/layout/Footer';
import TopBar from '../components/layout/TopBar';
import '../style/Layout.css';
import '../App.css';
// import HomeContent from './HomeContent';

const HomePage = () => {

    return (
        <div className="body">
            <div style={{ display: 'flex', width: '100%' }}>
                <Dashboard />
                <div>
                    <TopBar />
                    {/* <HomeContent /> */}
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
