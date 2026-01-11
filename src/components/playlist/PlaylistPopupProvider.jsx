// src/components/Playlist/PlaylistPopupProvider.jsx
import React from 'react';
import usePlaylistManager from '../../hooks/usePlaylistManager';
import { PlaylistPopupContext } from './GlobalPlaylistContext';

export default function PlaylistPopupProvider({ children }) {
  const playlist = usePlaylistManager();

  return (
    <PlaylistPopupContext.Provider value={playlist}>
      {children}
    </PlaylistPopupContext.Provider>
  );
}
