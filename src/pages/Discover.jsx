import React, { useEffect, useState } from 'react';
import D2CardRow from '../components/common/D2Card.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import Footer from '../components/layout/Footer.jsx';
import '../style/Dis.css';
import '../style/Layout.css'
import ArtistRow from '../components/common/Artist.jsx';
import VideoGrid from '../components/common/Video.jsx';
import SongsGrid from '../components/common/NewSong.jsx';
import CardGrid from '../components/common/CardGrid.jsx';


const Discover = () => {

    return (
        <div className="container">
            <TopBar />
            <D2CardRow source={'genres'} title1="Music" title2="Genres" />
            <D2CardRow source={'moods'} title1="Mood" title2="Playlist" />
            <ArtistRow source={'artists'} />
            <VideoGrid source={'musicVideos'} title1="Music" title2="Video" />
            <SongsGrid source={'songs'} title1="New" title2="Song" />
            <CardGrid title="New" title2="Album" limit={6} />
            <Footer />
        </div>
    );
};

export default Discover;
