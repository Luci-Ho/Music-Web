import React, { useContext } from 'react';
import PlaylistPopup from './PlaylistPopup';
import { PlaylistPopupContext } from './GlobalPlaylistContext';

const GlobalPlaylistPopup = () => {
  const playlist = useContext(PlaylistPopupContext); // ✅ dùng context, không gọi lại hook

  if (!playlist) return null;

  return (
    playlist.showPlaylistPopup && (
      <PlaylistPopup
        songId={playlist.selectedSongId}
        playlists={playlist.userPlaylists}
        showCreate={playlist.showCreatePlaylist}
        newPlaylistName={playlist.newPlaylistName}
        setNewPlaylistName={playlist.setNewPlaylistName}
        onAdd={playlist.addToPlaylist}
        onCreate={playlist.createNewPlaylist}
        onClose={playlist.closePopup}
        toggleCreate={() => playlist.setShowCreatePlaylist(!playlist.showCreatePlaylist)}
      />
    )
  );
};

export default GlobalPlaylistPopup;
