import React from 'react';
import { CheckOutlined } from '@ant-design/icons';

const PlaylistList = ({ playlists, songId, onAdd, onClose }) => {
  if (playlists.length === 0) {
    return (
      <div className="text-center text-gray-400 p-6 text-sm">
        <div className="text-3xl mb-2 opacity-50">🎵</div>
        Chưa có playlist nào
      </div>
    );
  }

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
      {playlists.map((playlist) => {
        const isInPlaylist =
          Array.isArray(playlist.songs) && playlist.songs.includes(songId);
        const songCount = Array.isArray(playlist.songs)
          ? playlist.songs.length
          : 0;

        return (
          <div
            key={playlist._id}
            onClick={() => {
              if (!isInPlaylist) {
                onAdd(songId, playlist._id);
                onClose?.();
              }
            }}
            className={`p-3 rounded flex justify-between items-center text-sm transition-all ${
              isInPlaylist ? 'text-gray-500 cursor-default opacity-60' : 'text-white cursor-pointer hover:bg-white/10'
            }`}
          >
            <div>
              <div className="font-medium">{playlist.name}</div>
              <div className="text-xs text-gray-400">{songCount} bài hát</div>
            </div>
            {isInPlaylist && <CheckOutlined style={{ color: '#EE10B0', fontSize: '16px' }} />}
          </div>
        );
      })}
    </div>
  );
};

export default PlaylistList;
