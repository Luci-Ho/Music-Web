import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSong = playlist[currentIndex] || null;

  const selectSong = (song) => {
    const index = playlist.findIndex(s => s.id === song.id);
    if (index !== -1) setCurrentIndex(index);
  };

  const playAll = (songs) => {
    setPlaylist(songs);
    setCurrentIndex(0);
  };

  return (
    <AppContext.Provider value={{
      playlist,
      currentSong,
      selectSong,
      playAll,
      currentIndex,
      setCurrentIndex
    }}>
      {children}
    </AppContext.Provider>
  );
};
