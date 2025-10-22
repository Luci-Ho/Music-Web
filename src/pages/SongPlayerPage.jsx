import React, { useState, useEffect } from 'react';
import Dashboard from '../components/layout/Dashboard';
import '../style/Layout.css';
import '../App.css';
import SongPlayer from './SongPlayer';

const SongPlayerPage = () => {

    return (
        <div className="body">
            <div style={{ display: 'flex', width: '100%' }}>
                <Dashboard />
                <div>
                    <SongPlayer/>
                </div>
            </div>
        </div>
    );
};

export default SongPlayerPage;
