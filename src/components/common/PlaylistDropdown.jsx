import React, { useEffect, useState } from 'react';
import { Popover, Button, Input } from 'antd';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const PlaylistDropdown = ({ songId }) => {
  const { user, login, isLoggedIn } = useAuth();
  const [visible, setVisible] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    if (visible && user) {
      // Get playlists from current user instead of global endpoint
      setPlaylists(user.playlists || []);
    }
  }, [visible, user]);

  const addToPlaylist = async (playlistId) => {
    if (!isLoggedIn) {
      toast.error('Bạn cần đăng nhập để thêm vào playlist!');
      return;
    }

    try {
      // Get song data
      const songRes = await axios.get(`http://localhost:4000/songs/${songId}`);
      const songData = songRes.data;

      // Find the playlist in user's playlists
      const userPlaylists = user.playlists || [];
      const playlist = userPlaylists.find(p => p.id === playlistId);
      
      if (!playlist) {
        toast.error('Không tìm thấy playlist!');
        return;
      }

      // Check if song already exists in playlist
      const songExists = playlist.songs.some(s => 
        (typeof s === 'string' ? s : s.id) === songData.id
      );

      if (songExists) {
        toast.error('Bài hát đã có trong playlist này!');
        return;
      }

      // Create updated playlists array
      const updatedPlaylists = userPlaylists.map(p => {
        if (p.id === playlistId) {
          return {
            ...p,
            songs: [...p.songs, {
              id: songData.id,
              title: songData.title,
              artist: songData.artist
            }]
          };
        }
        return p;
      });

      // Update user with new playlists
      const updatedUser = { ...user, playlists: updatedPlaylists };

      // Update backend
      await axios.patch(`http://localhost:4000/users/${user.id}`, {
        playlists: updatedPlaylists
      });

      // Update local state
      login(updatedUser);
      setPlaylists(updatedPlaylists);
      setVisible(false);
      
      try { 
        window.dispatchEvent(new Event('userUpdated')); 
      } catch (err) { 
        /* ignore */ 
      }

      toast.success('Đã thêm vào playlist thành công!');
    } catch (err) {
      console.error('Lỗi khi thêm bài hát:', err);
      toast.error('Có lỗi xảy ra khi thêm bài hát!');
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim() || !isLoggedIn) return;

    try {
      // Get song data
      const songRes = await axios.get(`http://localhost:4000/songs/${songId}`);
      const songData = songRes.data;

      // Create new playlist with unique ID
      const newPlaylistId = `${user.id}_${Date.now()}`;
      const newPlaylist = {
        id: newPlaylistId,
        name: newPlaylistName,
        songs: [{
          id: songData.id,
          title: songData.title,
          artist: songData.artist
        }]
      };

      // Add to user's playlists
      const userPlaylists = user.playlists || [];
      const updatedPlaylists = [...userPlaylists, newPlaylist];
      const updatedUser = { ...user, playlists: updatedPlaylists };

      // Update backend
      await axios.patch(`http://localhost:4000/users/${user.id}`, {
        playlists: updatedPlaylists
      });

      // Update local state
      login(updatedUser);
      setPlaylists(updatedPlaylists);
      setNewPlaylistName('');
      setVisible(false);
      
      try { 
        window.dispatchEvent(new Event('userUpdated')); 
      } catch (err) { 
        /* ignore */ 
      }

      toast.success('Đã tạo playlist mới thành công!');
    } catch (err) {
      console.error('Lỗi khi tạo playlist:', err);
      toast.error('Có lỗi xảy ra khi tạo playlist!');
    }
  };

  const content = (
    <div style={{ width: '220px' }}>
      <p style={{ marginBottom: '8px' }}>Chọn playlist:</p>
      {playlists.map(pl => (
        <Button
          key={pl.id}
          type="text"
          style={{ width: '100%', textAlign: 'left', marginBottom: '5px' }}
          onClick={() => addToPlaylist(pl.id)}
        >
          🎵 {pl.name}
        </Button>
      ))}

      <hr style={{ margin: '12px 0' }} />

      <Input
        placeholder="New playlist"
        value={newPlaylistName}
        onChange={(e) => setNewPlaylistName(e.target.value)}
        onPressEnter={createPlaylist}
      />
      <Button
        type="link"
        onClick={createPlaylist}
        style={{ paddingLeft: 0, marginTop: '6px' }}
      >
        create
      </Button>
    </div>
  );

  return (
    <Popover
      content={content}
      title="Thêm vào playlist"
      trigger="click"
      open={visible}
      onOpenChange={(v) => setVisible(v)}
    >
      <Button className="action-btn">➕ Thêm vào playlist</Button>
    </Popover>
  );
};

export default PlaylistDropdown;
