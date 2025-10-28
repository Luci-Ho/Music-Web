import React, { useState, useEffect } from 'react';
import Dashboard from '../components/layout/Dashboard';
import '../App.css';
import '../style/Layout.css'
import ViewAll from './VA';
import Footer from '../components/layout/Footer';


const ViewAllPage = () => {

    return (
        <div className="body">
            <div style={{ display: 'flex', width: '100%' }}>
                <Dashboard />
                <div className='container'>
                    <ViewAll />
                    <Footer />
                </div>
                
            </div>
            
        </div>
    );
};

export default ViewAllPage;
