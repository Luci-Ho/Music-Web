import { createContext, useContext, useCallback, useMemo, useState } from "react";
import {
  adminGetSongs,
  adminCreateSong,
  adminUpdateSong,
  adminDeleteSong,
} from "../api/admin.song.api";

const AdminSongContext = createContext(null);

export function AdminSongProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetSongs();
      // Nếu backend trả {data: []} thì đổi thành: data.data
      setSongs(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSong = useCallback(async (payload) => {
    const created = await adminCreateSong(payload);
    setSongs((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateSong = useCallback(async (id, payload) => {
    const updated = await adminUpdateSong(id, payload);
    setSongs((prev) => prev.map((s) => (s._id === id ? updated : s)));
    return updated;
  }, []);

  const deleteSong = useCallback(async (id) => {
    await adminDeleteSong(id);
    setSongs((prev) => prev.filter((s) => s._id !== id));
  }, []);

  const value = useMemo(
    () => ({
      songs,
      loading,
      error,
      fetchSongs,
      createSong,
      updateSong,
      deleteSong,
    }),
    [songs, loading, error, fetchSongs, createSong, updateSong, deleteSong]
  );

  return <AdminSongContext.Provider value={value}>{children}</AdminSongContext.Provider>;
}

export function useAdminSong() {
  const ctx = useContext(AdminSongContext);
  if (!ctx) throw new Error("useAdminSong must be used inside AdminSongProvider");
  return ctx;
}
export default AdminSongContext;