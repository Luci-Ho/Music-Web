import React, { useState, useEffect } from 'react';
import Dashboard from '../components/layout/Dashboard';
import '../style/Layout.css';
import '../App.css';

const Discover = () => {

    return (
        <div className="body">
            <div style={{ display: 'flex', width: '100%' }}>
                <Dashboard />
                <div>
                    
                </div>
            </div>
        </div>
    );
};

export default Discover;
