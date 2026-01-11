import React, { useEffect, useState } from 'react';
import D2CardRow from '../components/common/D2Card.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import Footer from '../components/layout/Footer.jsx';
import '../style/Dis.css';

import ArtistRow from '../components/common/Artist.jsx';
import VideoGrid from '../components/common/Video.jsx';
import SongsGrid from '../components/common/NewSong.jsx';
import CardGrid from '../components/common/CardGrid.jsx';

import { getDiscoverData } from '../services/discover.service.js';

const Discover = () => {
  const [discoverData, setDiscoverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDiscoverData()
      .then((data) => setDiscoverData(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Đang tải dữ liệu Discover...</p>;
  if (error) return <p className="error">Lỗi: {error}</p>;

  return (
    <div className="box">
      <TopBar />

      <D2CardRow title1="Music" title2="Genres" data={discoverData?.genres} />
      <D2CardRow title1="Mood" title2="Playlist" data={discoverData?.moods} />
      <ArtistRow data={discoverData?.artists} />
      <VideoGrid title1="Music" title2="Video" data={discoverData?.musicVideos} />
      <SongsGrid title1="New" title2="Song" data={discoverData?.songsList} />
      <CardGrid title1="New" title2="Album" limit={6} data={discoverData?.albums} />

      <Footer />
    </div>
  );
};

export default Discover;