const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

// Local fallback data
let songs = [];
let users = [];


async function fetchJson(path) {
  try {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('network');
    const json = await res.json();
    return json;
  } catch {
    return null;
  }
}

export async function getSongs() {
  // Try API /songsList first (this is the correct endpoint)
  const songsListRes = await fetchJson('/songsList');
  if (Array.isArray(songsListRes)) return songsListRes.slice();

  // Try API /songs as fallback
  const apiRes = await fetchJson('/songs');
  if (Array.isArray(apiRes)) return apiRes.slice();

  // Try API root returning whole DB
  const root = await fetchJson('/');
  if (root && Array.isArray(root.songsList)) return root.songsList.slice();
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
  try {
    // Try to add via API first
    const response = await fetch(`${API_BASE}/songs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(song),
    });

    if (response.ok) {
      const newSong = await response.json();
      console.log('Successfully added song via API:', newSong);
      return newSong;
    } else {
      console.warn('API add failed, falling back to local add');
      // Fallback to local add
      const id = (Date.now()).toString(36).slice(-6);
      const newSong = { ...song, id };
      songs = [newSong, ...songs];
      return Promise.resolve(newSong);
    }
  } catch (error) {
    console.error('Error adding song via API:', error);
    // Fallback to local add
    const id = (Date.now()).toString(36).slice(-6);
    const newSong = { ...song, id };
    songs = [newSong, ...songs];
    return Promise.resolve(newSong);
  }
}

export async function updateSong(id, updates) {
  try {
    // Try to update via API first
    const response = await fetch(`${API_BASE}/songs/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const updatedSong = await response.json();
      console.log('Successfully updated song via API:', updatedSong);
      return updatedSong;
    } else {
      console.warn('API update failed, falling back to local update');
      // Fallback to local update
      songs = songs.map(s => (s._id === id ? { ...s, ...updates } : s));
      return Promise.resolve(songs.find(s => s._id === id));
    }
  } catch (error) {
    console.error('Error updating song via API:', error);
    // Fallback to local update
    songs = songs.map(s => (s._id === id ? { ...s, ...updates } : s));
    return Promise.resolve(songs.find(s => s._id === id));
  }
}

export async function deleteSong(id) {
  try {
    // Try to delete via API first
    const response = await fetch(`${API_BASE}/songs/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log('Successfully deleted song via API:', id);
      return true;
    } else {
      console.warn('API delete failed, falling back to local delete');
      // Fallback to local delete
      songs = songs.filter(s => s._id !== id);
      return Promise.resolve(true);
    }
  } catch (error) {
    console.error('Error deleting song via API:', error);
    // Fallback to local delete
    songs = songs.filter(s => s._id !== id);
    return Promise.resolve(true);
  }
}
