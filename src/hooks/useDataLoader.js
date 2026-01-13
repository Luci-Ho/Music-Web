import { useState, useEffect, useMemo } from 'react';
import data from '../routes/db.json';

/**
 * Custom hook for loading and managing data from db.json
 * @returns {object} { albums, artists, songs, allSongs, artistMap, loading }
 */
const useDataLoader = () => {
  const [loading, setLoading] = useState(true);

  // Get all data from db.json
  const albums = data.albums || [];
  const artists = data.artists || [];
  const songs = data.songs || [];
  const songsList = data.songsList || [];

  // Combine songs from both arrays
  const allSongs = useMemo(() => [...songs, ...songsList], [songs, songsList]);

  // Create artist name map for quick lookup
  const artistMap = useMemo(() => {
    return Object.fromEntries(artists.map(artist => [artist._id, artist.name]));
  }, [artists]);

  useEffect(() => {
    // Simulate loading time for consistency
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  return {
    albums,
    artists,
    songs,
    allSongs,
    artistMap,
    loading,
    setLoading
  };
};

export default useDataLoader;