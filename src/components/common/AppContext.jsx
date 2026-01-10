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

  // Hàm mới để phát một bài hát cụ thể và set playlist
  const playSong = (song, songList = []) => {
    // Nếu có danh sách bài hát, dùng nó làm playlist
    if (songList && songList.length > 0) {
      setPlaylist(songList);
      const index = songList.findIndex(s => s.id === song.id);
      setCurrentIndex(index !== -1 ? index : 0);
    } 
    // Nếu không có danh sách, chỉ phát bài hát đó (tạo playlist 1 bài)
    else {
      setPlaylist([song]);
      setCurrentIndex(0);
    }
  };

  return (
    <AppContext.Provider value={{
      playlist,
      currentSong,
      selectSong,
      playAll,
      playSong,
      currentIndex,
      setCurrentIndex
    }}>
      {children}
    </AppContext.Provider>
  );
};
