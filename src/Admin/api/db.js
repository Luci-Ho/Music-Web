const API_URL = 'http://localhost:4000';


async function fetchJson(path) {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('network');
    const json = await res.json();
    return json;
  } catch {
    return null;
  }
}

export async function getSongs() {
  // Try API /songs
  const apiRes = await fetchJson('/songsList');
  if (Array.isArray(apiRes)) return apiRes.slice();

  // Try API root returning whole DB
  const root = await fetchJson('/');
  if (root && Array.isArray(root.songs)) return root.songs.slice();

  // Fallback to bundled data
  return Promise.resolve([...songs]);
}

export async function getUsers() {
  const apiRes = await fetchJson('/users');
  if (Array.isArray(apiRes)) return apiRes.slice();

  const root = await fetchJson('/');
  if (root && Array.isArray(root.users)) return root.users.slice();

  return Promise.resolve([...users]);
}

// Local-only mutation helpers (server-backed APIs would be different)
export async function addSong(song) {
  const id = (Date.now()).toString(36).slice(-6);
  const newSong = { ...song, id };
  songs = [newSong, ...songs];
  return Promise.resolve(newSong);
}

export async function updateSong(id, updates) {
  songs = songs.map(s => (s.id === id ? { ...s, ...updates } : s));
  return Promise.resolve(songs.find(s => s.id === id));
}

export async function deleteSong(id) {
  songs = songs.filter(s => s.id !== id);
  return Promise.resolve(true);
}
