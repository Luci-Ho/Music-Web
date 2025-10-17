import React, { useState, useEffect } from 'react';
import Dashboard from '../components/layout/Dashboard';
import TopBar from '../components/layout/TopBar.jsx';
import Footer from '../components/layout/Footer.jsx';
import D2Card from '../components/common/D2Card.jsx';
import '../App.css';

const Discover = () => {

    return (
        <div className="body">
            <div style={{ display: 'flex', width: '100%' }}>
                <Dashboard />
                <div className="container">
                    <TopBar />

                    <div className="content">
                        <p>hello</p>
                    </div>

                    <Footer />

                </div>

                <div className='Genres'>
                    <h1 className="tag">Music <span>Genres</span></h1>
                    <ul>
                        <D2Card title="Rock" img="rock.jpg" />
                        <D2Card title="Pop" img="pop.jpg" />
                        <D2Card title="Jazz" img="jazz.jpg" />
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Discover;
