import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Dashboard from '../components/layout/Dashboard';
import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';

import '../style/Layout.css';
import '../App.css';

const AddToPlaylist = () => {
  const { id } = useParams();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [song, setSong] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:4000/playlists')
      .then(res => setPlaylists(res.data))
      .catch(err => console.error('Lỗi khi lấy playlist:', err));
  }, []);

  useEffect(() => {
    axios.get(`http://localhost:4000/songs/${id}`)
      .then(res => setSong(res.data))
      .catch(err => console.error('Lỗi khi lấy bài hát:', err));
  }, [id]);

  const handleAdd = () => {
    if (!selectedPlaylistId) return;

    axios.post(`http://localhost:4000/playlists/${selectedPlaylistId}/songs`, {
      songId: id
    })
    .then(() => alert('✅ Đã thêm vào playlist!'))
    .catch(err => console.error('Lỗi khi thêm bài hát:', err));
  };

  if (!song) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="body">
      <div style={{ display: 'flex', width: '100%' }}>
        <Dashboard />

        <div className="container">
          <TopBar />

          <div className="content">
            <h2 style={{ color: 'white', marginBottom: '20px' }}>Thêm bài hát vào playlist</h2>

            <div className="song-info" style={{
              display: 'flex',
              gap: '20px',
              background: '#1e1e2f',
              padding: '30px',
              borderRadius: '12px',
              color: 'white',
              marginBottom: '30px'
            }}>
              <img
                src={song.cover_url}
                alt={song.title}
                style={{ width: '200px', borderRadius: '12px' }}
              />
              <div>
                <h3>{song.title}</h3>
                <p><strong>Ca sĩ:</strong> {song.artist}</p>
                <p><strong>Album:</strong> {song.album}</p>
                <p><strong>Thể loại:</strong> {song.genre}</p>
                <p><strong>Thời lượng:</strong> {song.duration}</p>
                <p><strong>Phát hành:</strong> {song.release_date}</p>
              </div>
            </div>

            <div style={{
              background: '#2a2a3a',
              padding: '20px',
              borderRadius: '12px',
              color: 'white'
            }}>
              <label htmlFor="playlist-select"><strong>Chọn playlist:</strong></label>
              <br />
              <select
                id="playlist-select"
                value={selectedPlaylistId || ''}
                onChange={(e) => setSelectedPlaylistId(e.target.value)}
                style={{ padding: '10px', marginTop: '10px', borderRadius: '8px', width: '100%' }}
              >
                <option value="" disabled>-- Chọn playlist --</option>
                {playlists.map(pl => (
                  <option key={pl.id} value={pl.id}>{pl.name}</option>
                ))}
              </select>

              <button
                onClick={handleAdd}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                ➕ Thêm vào playlist
              </button>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylist;
