// Convenience wrapper to import JSON data and re-export named collections.
import list from './list2.json';

export const genres = list.genres || [];
export const mood = list.moods || [];
export const artist = list.artists || [];
export const musicVideo = list.musicVideos || [];
export const song = list.songs || [];
export const newAlbums = list.newAlbums || [];

export default list;