import React, { useState, useEffect } from 'react';
import Dashboard from '../components/layout/Dashboard';
import '../App.css';
import '../style/Layout.css'
import ViewAll from './VA';


const ViewAllPage = () => {

    return (
        <div className="body">
            <div style={{ display: 'flex', width: '100%' }}>
                <Dashboard />
                <div>
                    <ViewAll />
                </div>
            </div>
        </div>
    );
};

export default ViewAllPage;
