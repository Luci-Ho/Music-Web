import  api  from './api';

export const getPlaylists = async () => {
  const res = await fetch(`${API_URL}/api/playlists`);
  if (!res.ok) throw new Error("Failed to fetch playlists");
  return res.json();
};
