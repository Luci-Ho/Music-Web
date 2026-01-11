import  api  from './api';

export const getSongById = async (id) => {
  const res = await fetch(`${API_URL}/api/songs/${id}`);
  if (!res.ok) throw new Error("Failed to fetch song");
  return res.json();
};
