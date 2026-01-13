import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';

import '../style/Layout.css';
import '../App.css';

const AddToPlaylist = () => {
  const { id } = useParams();
  const { user, login } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [song, setSong] = useState(null);

  useEffect(() => {
    // Get playlists from current user instead of global endpoint
    if (user && user.playlists) {
      setPlaylists(user.playlists);
    }
  }, [user]);

  useEffect(() => {
    axios.get(`http://localhost:5000/songs/${id}`)
      .then(res => setSong(res.data))
      .catch(err => console.error('Lỗi khi lấy bài hát:', err));
  }, [id]);

  const handleAdd = async () => {
    if (!selectedPlaylistId || !user) return;

    try {
      // Find the playlist in user's playlists
      const userPlaylists = user.playlists || [];
      const playlist = userPlaylists.find(p => p._id === selectedPlaylistId);
      
      if (!playlist) {
        alert('Không tìm thấy playlist!');
        return;
      }

      // Check if song already exists in playlist
      const songExists = playlist.songs.some(s => 
        (typeof s === 'string' ? s : s._id) === id
      );

      if (songExists) {
        alert('Bài hát đã có trong playlist này!');
        return;
      }

      // Create updated playlists array
      const updatedPlaylists = userPlaylists.map(p => {
        if (p._id === selectedPlaylistId) {
          return {
            ...p,
            songs: [...p.songs, {
              id: song._id,
              title: song.title,
              artist: song.artist
            }]
          };
        }
        return p;
      });

      // Update user with new playlists
      const updatedUser = { ...user, playlists: updatedPlaylists };

      // Update backend
      await axios.patch(`http://localhost:5000/users/${user._id}`, {
        playlists: updatedPlaylists
      });

      // Update local state
      login(updatedUser);
      setPlaylists(updatedPlaylists);
      
      alert('✅ Đã thêm vào playlist!');
    } catch (err) {
      console.error('Lỗi khi thêm bài hát:', err);
      alert('❌ Có lỗi xảy ra khi thêm bài hát!');
    }
  };

  if (!song) return <p>Đang tải dữ liệu...</p>;

  return (
    <>
      <TopBar />
      <div className="content" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
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
                  <option key={pl._id} value={pl._id}>{pl.name}</option>
                ))}
              </select>

              <button
                onClick={handleAdd}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #EE10B0, #EE10B0)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #d60e9e, #d60e9e)'}
                onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #EE10B0, #EE10B0)'}
              >
                ➕ Thêm vào playlist
              </button>
            </div>
      </div>
      <Footer />
    </>
  );
};

export default AddToPlaylist;
