import React from 'react';
import D2CardRow from '../components/common/D2Card.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import Footer from '../components/layout/Footer.jsx';
import '../style/Dis.css';
import { genres, mood, artist } from '../components/data/disdata.js';
import ArtistRow from '../components/common/Artist.jsx';
import "../style/Layout.css";


const Discover = () => {

    return (
        <div className="container">
            <div>
            <TopBar />

            </div>

            <div>
                <D2CardRow datas={genres} title1="Music" title2="Genres" />
                <D2CardRow datas={mood} title1="Mood" title2="Playlist" />
                <ArtistRow datas={artist} />
            </div>

            <Footer />

        </div>
    );
};

export default Discover;