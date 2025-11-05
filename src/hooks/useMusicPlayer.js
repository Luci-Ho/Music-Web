import { useContext } from 'react';
import { AppContext } from '../components/common/AppContext';
import { toast } from 'react-toastify';

/**
 * Custom hook for music player functionality
 * @returns {object} { playSong, playAlbum, currentSong }
 */
const useMusicPlayer = () => {
  const { setCurrentSong, currentSong } = useContext(AppContext);

  const playSong = (song) => {
    setCurrentSong(song);
    toast.success(`Đang phát: ${song.title}`);
  };

  const playAlbum = (songs) => {
    if (songs && songs.length > 0) {
      playSong(songs[0]);
    }
  };

  const playArtistSongs = (songs) => {
    if (songs && songs.length > 0) {
      playSong(songs[0]);
    }
  };

  return {
    playSong,
    playAlbum,
    playArtistSongs,
    currentSong
  };
};

export default useMusicPlayer;