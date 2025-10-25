import React, { useEffect, useState } from 'react';
import { Popover, Button, Input } from 'antd';
import axios from 'axios';
import { isLoggedIn } from '../../utils/auth';

const PlaylistDropdown = ({ songId }) => {
  
  const [visible, setVisible] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    if (visible) {
      axios.get('http://localhost:4000/playlists')
        .then(res => setPlaylists(res.data))
        .catch(err => console.error('Lỗi khi lấy playlist:', err));
    }
  }, [visible]);

  const addToPlaylist = (playlistId) => {
    if (!isLoggedIn()) {
    toast.error('Bạn cần đăng nhập để thêm vào playlist!');
    return;
  }
    axios.get(`http://localhost:4000/songs/${songId}`)
      .then(res => {
        const songData = res.data;
        return axios.get(`http://localhost:4000/playlists/${playlistId}`).then(plRes => {
          const updatedSongs = [...plRes.data.songs, {
            id: songData.id,
            title: songData.title,
            artist: songData.artist
          }];
          return axios.put(`http://localhost:4000/playlists/${playlistId}`, {
            ...plRes.data,
            songs: updatedSongs
          });
        });
      })
      .then(() => setVisible(false))
      .catch(err => console.error('Lỗi khi thêm bài hát:', err));
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;

    axios.get(`http://localhost:4000/songs/${songId}`)
      .then(res => {
        const songData = res.data;
        const newPlaylist = {
          name: newPlaylistName,
          songs: [{
            id: songData.id,
            title: songData.title,
            artist: songData.artist
          }]
        };
        return axios.post('http://localhost:4000/playlists', newPlaylist);
      })
      .then(() => {
        setNewPlaylistName('');
        setVisible(false);
      })
      .catch(err => console.error('Lỗi khi tạo playlist:', err));
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
