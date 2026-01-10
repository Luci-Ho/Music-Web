import { useContext } from 'react';
import { AppContext } from '../components/common/AppContext';
import { toast } from 'react-toastify';

/**
 * Custom hook for music player functionality
 * @returns {object} { playSong, playAlbum, playArtistSongs, currentSong }
 */
const useMusicPlayer = () => {
  const { playSong: contextPlaySong, currentSong } = useContext(AppContext);

  const playSong = (song, songList = []) => {
    if (!song) {
      console.warn('No song provided to playSong');
      return;
    }
    
    contextPlaySong(song, songList);
    toast.success(`Đang phát: ${song.title}`);
  };

  const playAlbum = (songs) => {
    if (songs && songs.length > 0) {
      playSong(songs[0], songs);
    } else {
      console.warn('No songs provided to playAlbum');
    }
  };

  const playArtistSongs = (songs) => {
    if (songs && songs.length > 0) {
      playSong(songs[0], songs);
    } else {
      console.warn('No songs provided to playArtistSongs');
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