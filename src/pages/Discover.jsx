import React from 'react';
import D2CardRow from '../components/common/D2Card.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import Footer from '../components/layout/Footer.jsx';
import '../style/Dis.css';
import { genres, mood, artist, musicVideo,songsList } from '../components/data/disdata.js';
import ArtistRow from '../components/common/Artist.jsx';
import VideoGrid from '../components/common/Video.jsx';
import SongsGrid from '../components/common/NewSong.jsx';

const Discover = () => {

    return (
        <div className="container">
            <TopBar />
            <D2CardRow datas={genres} title1="Music" title2="Genres" decolor="#ffffff" />
            <D2CardRow datas={mood} title1="Mood" title2="Playlist" decolor="purple" />
            <ArtistRow datas={artist} />
            <VideoGrid datas={musicVideo} title1="Music" title2="Video" />
            <SongsGrid datas={songsList} title1="New" title2="Song" />
            <Footer />
        </div>
    )
};
export default Discover;
