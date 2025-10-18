import React from 'react';
import D2CardRow from '../components/common/D2Card.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import Footer from '../components/layout/Footer.jsx';
import '../style/Dis.css';
import { genres, mood, artist } from '../components/data/disdata.js';
import ArtistRow from '../components/common/Artist.jsx';


const Discover = () => {
        
    return (
        <div className="body">
            <TopBar />
            <D2CardRow datas={genres} title1="Music" title2="Genres" decolor="#ffffff" />
            <D2CardRow datas={mood} title1="Mood" title2="Playlist" decolor="purple" />
            <ArtistRow datas={artist} />

            <Footer />
        </div>
    );
};

export default Discover;
