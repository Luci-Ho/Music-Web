// src/hooks/usePlaylistTrigger.js
import { useContext } from 'react';
import { PlaylistPopupContext } from '../components/playlist/GlobalPlaylistContext';

export default function usePlaylistTrigger() {
  const context = useContext(PlaylistPopupContext);
  if (!context) {
    throw new Error('usePlaylistTrigger must be used within a PlaylistPopupContext.Provider');
  }
  const { openPopup } = context;
  return { openPopup };
}
