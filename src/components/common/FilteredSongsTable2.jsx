// tính sửa giao diện của phần này của ông làm cho đẹp hơn nhưng mà chưa làm được

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlayCircleOutlined, HeartFilled, HeartTwoTone } from '@ant-design/icons';
import useAuth from '../../hooks/useAuth';
import TopBar from '../layout/TopBar';
import '../common/FilteredSongsTable2.css'; // ✅ Đã cập nhật đúng đường dẫn

const FilteredSongsTable2 = ({ filterType = 'genre', filterId, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, login } = useAuth();

  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [genres, setGenres] = useState([]);
  const [moods, setMoods] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [songsRes, artistsRes, albumsRes, genresRes, moodsRes] = await Promise.all([
        fetch('http://localhost:5000/songsList'),
        fetch('http://localhost:5000/artists'),
        fetch('http://localhost:5000/albums'),
        fetch('http://localhost:5000/genres'),
        fetch('http://localhost:5000/moods'),
      ]);
      const [songsData, artistsData, albumsData, genresData, moodsData] = await Promise.all([
        songsRes.json(),
        artistsRes.json(),
        albumsRes.json(),
        genresRes.json(),
        moodsRes.json(),
      ]);
      setSongs(songsData);
      setArtists(artistsData);
      setAlbums(albumsData);
      setGenres(genresData);
      setMoods(moodsData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFavorites(user?.favorites || []);
  }, [user]);

  const bannerImg = useMemo(() => {
    if (filterType === 'genre') return genres.find(g => g._id === filterId)?.img;
    if (filterType === 'mood') return moods.find(m => m._id === filterId)?.img;
    if (filterType === 'artist') return artists.find(a => a._id === filterId)?.img;
    return null;
  }, [filterType, filterId, genres, moods, artists]);

  const artistMap = useMemo(() => Object.fromEntries(artists.map(a => [a._id, a.name])), [artists]);
  const albumMap = useMemo(() => Object.fromEntries(albums.map(a => [a._id, a.title])), [albums]);

  const filtered = useMemo(() => {
    if (filterType === 'favorites') {
      return songs.filter(s => favorites.includes(s._id));
    }
    if (!filterId) return [];
    switch (filterType) {
      case 'genre':
        return songs.filter(s => s.genreId === filterId);
      case 'mood':
        return songs.filter(s => s.moodId === filterId);
      case 'artist':
        return songs.filter(s => s.artistId === filterId);
      default:
        return [];
    }
  }, [songs, filterType, filterId, favorites]);

  const toggleFavorite = async (e, songId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }

    const isFav = favorites.includes(songId);
    const updated = isFav ? favorites.filter(id => id !== songId) : [...favorites, songId];
    setFavorites(updated);
    login({ ...(user || {}), favorites: updated });

    try {
      await fetch(`http://localhost:5000/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites: updated }),
      });
    } catch (err) {
      setFavorites(isFav ? [...favorites, songId] : favorites.filter(id => id !== songId));
    }
  };

  return (
    <div className="main">
      <div className="album-detail">
        <div className="album-header">
          {/* <TopBar /> */}
          <div className="trendingmusic">
            <div className="banner-trending-music">
              <img
                className="banner-album-normal"
                src={bannerImg || "https://www.freeiconspng.com/uploads/valentine-heart-icon-6.png"}
                alt="Banner"
              />
            </div>

            <div className="container-trending-content-mobile">
              <h2 className="hide-on-mobile">{title || "Trending Songs"} <span>{filterType}</span></h2>
              <p className="trending-music-content">Discover the latest hits and timeless classics.</p>
              <div className="Playlist-trending-songs">
                <p>{filtered.length} songs<span>.</span>1h36m</p>
                <img className="play-button-mobile" src="/image/icon/blue-octicon_play-16.svg" alt="Play" />
              </div>
            </div>

            <div>
              <button className="play-button">
                Play All
                <PlayCircleOutlined className="play-icon" />
              </button>
            </div>
          </div>
        </div>

        <div className="SongList mt-5">
          <table className="table-auto w-full text-left text-white">
            <thead>
              <tr className="text-gray-300/80">
                <th className="pl-2">#</th>
                <th>Song</th>
                <th>Release</th>
                <th>Album</th>
                <th>Time</th>
                <th>Like</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50 gap-2">
              {filtered.map((s, i) => {
                const albumTitle = albumMap[s.albumId] || '-';
                const artistName = artistMap[s.artistId] || '-';
                const isFav = favorites.includes(s._id);

                return (
                  <tr key={s._id || i} className="hover:bg-gray-800/30">
                    <td className="pl-2 align-middle py-3 text-gray-300">{i + 1}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-3">
                        <img src={s.img || "https://via.placeholder.com/48?text=No+Image"} alt={s.title} className="w-12 h-12 rounded object-cover" />
                        <div>
                          <div className="font-semibold text-white">{s.title}</div>
                          <div className="text-sm text-gray-400">{artistName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-gray-300">{s.releaseYear || '-'}</td>
                    <td className="py-2 text-gray-300">{albumTitle}</td>
                    <td className="py-2 text-gray-300">{s.duration || '-'}</td>
                    <td className="py-2 text-gray-300">
                      <button onClick={(e) => toggleFavorite(e, s._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        {isFav ? <HeartFilled style={{ color: 'red', fontSize: '1.25rem' }} /> : <HeartTwoTone twoToneColor="#eb2f96" style={{ fontSize: '1.25rem' }} />}
                      </button>
                    </td>
                    <td className="py-2 text-right pr-4">
                      <PlayCircleOutlined style={{ fontSize: '1.25rem' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FilteredSongsTable2;
