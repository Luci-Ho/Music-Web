import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSong = playlist[currentIndex] || null;

  // ✅ phát 1 bài + set playlist nếu có
  const playSong = (song, songList = []) => {
    if (songList.length > 0) {
      setPlaylist(songList);
      const index = songList.findIndex(s => s._id === song._id);
      setCurrentIndex(index !== -1 ? index : 0);
    } else {
      setPlaylist([song]);
      setCurrentIndex(0);
    }
  };

  // ✅ click song trong playlist
  const selectSong = (song) => {
    const index = playlist.findIndex(s => s._id === song._id);
    if (index !== -1) {
      setCurrentIndex(index);
    } else {
      // fallback: playlist rỗng → phát bài đơn
      setPlaylist([song]);
      setCurrentIndex(0);
    }
  };

  // ✅ play all
  const playAll = (songs) => {
    setPlaylist(songs);
    setCurrentIndex(0);
  };

  return (
    <AppContext.Provider value={{
      playlist,
      currentSong,
      currentIndex,
      setCurrentIndex,
      selectSong,
      playSong,
      playAll
    }}>
      {children}
    </AppContext.Provider>
  );
};
