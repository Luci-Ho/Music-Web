import React, { useState, useEffect } from 'react';
import Dashboard from '../components/layout/Dashboard';
import '../App.css';
import '../style/Layout.css'
import ViewAll from './List';
import Footer from '../components/layout/Footer';


const ViewAllPage = ({ source: initialSource }) => {
    // use prop `initialSource` as the initial state to avoid shadowing the prop name
    const [source, setSource] = useState(initialSource || '');

    // keep local state in sync if parent updates the `initialSource` prop
    useEffect(() => {
        setSource(initialSource || '');
    }, [initialSource]);

    return (
        <div className="body">
            <div style={{ display: 'flex', width: '100%' }}>
                <Dashboard />
                <div className='container'>
                    <ViewAll source={source} />
                    <Footer />
                </div>
                
            </div>
            
        </div>
    );
};

export default ViewAllPage;
