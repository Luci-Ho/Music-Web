import React, { useEffect, useState } from "react";
import { Button, Card, message } from "antd";
import SongsTable from "../component/SongTable";
import { adminGetSongs, adminDeleteSong, adminUpdateSong, adminCreateSong } from "../api/admin.song.api";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function SongsView() {
  const [songs, setSongs] = useState([]);
  const [showUndefined, setShowUndefined] = useState(false);

  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [genres, setGenres] = useState([]);

  const [suggestions, setSuggestions] = useState({ artists: [], albums: [], genres: [] });

  useEffect(() => {
    load();
    loadSuggestions();
  }, []);

  async function load() {
    try {
      const list = await adminGetSongs();
      console.log("[SongsView] songs =", list);
      setSongs(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setSongs([]);
    }
  }

  async function loadSuggestions() {
    try {
      const [artistsRes, albumsRes, genresRes] = await Promise.all([
        fetch(`${API_BASE}/artists`),
        fetch(`${API_BASE}/albums`),
        fetch(`${API_BASE}/genres`),
      ]);

      const a = (await artistsRes.json()) || [];
      const al = (await albumsRes.json()) || [];
      const g = (await genresRes.json()) || [];

      setArtists(Array.isArray(a) ? a : []);
      setAlbums(Array.isArray(al) ? al : []);
      setGenres(Array.isArray(g) ? g : []);

      setSuggestions({
        artists: (Array.isArray(a) ? a : []).map((x) => ({ value: x.name, _id: x._id, label: x.name })),
        albums: (Array.isArray(al) ? al : []).map((x) => ({ value: x.title || x.name, _id: x._id, label: x.title || x.name })),
        genres: (Array.isArray(g) ? g : []).map((x) => ({ value: x.title || x.name, _id: x._id, label: x.title || x.name })),
      });
    } catch (e) {
      console.error(e);
      setSuggestions({ artists: [], albums: [], genres: [] });
    }
  }

  async function handleDelete(_id) {
    await adminDeleteSong(_id);
    message.success("Deleted");
    load();
  }

  async function handleEdit(song) {
    try {
      const payload = { ...song };

      // bỏ các field chỉ để display
      delete payload.artist;
      delete payload.album;
      delete payload.genre;
      delete payload.listens;
      delete payload.date;
      delete payload.songId;

      await adminUpdateSong(song._id, payload);
      message.success("Updated");
      load();
    } catch (e) {
      console.error(e);
      message.error("Update failed (check BE PATCH /api/songs/:id)");
    }
  }

  async function handleAdd(payload) {
    try {
      await adminCreateSong(payload);
      message.success("Song added");
      load();
    } catch (e) {
      console.error(e);
      message.error("Create failed (check BE POST /api/songs)");
      throw e;
    }
  }

  const filteredSongs = showUndefined
    ? songs.filter((s) => s?.isActive === false || s?.isHidden || !s?.artistId || !s?.genreId)
    : songs.filter((s) => s?.isHidden !== true && s?.isActive !== false);

  const restoreHiddenSong = async (songId) => {
    try {
      await adminUpdateSong(songId, { isHidden: false, isActive: true });
      message.success("Restored");
      load();
    } catch (e) {
      console.error(e);
      message.error("Restore failed (check BE PATCH /api/songs/:id)");
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2>Songs Management</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Button type={showUndefined ? "default" : "primary"} onClick={() => setShowUndefined(false)}>
            Active Songs ({songs.filter((s) => s?.isHidden !== true && s?.isActive !== false).length})
          </Button>
          <Button type={showUndefined ? "primary" : "default"} onClick={() => setShowUndefined(true)} danger={showUndefined}>
            Undefined/Hidden ({songs.filter((s) => s?.isHidden || s?.isActive === false || !s?.artistId || !s?.genreId).length})
          </Button>
        </div>
      </div>

      <Card>
        <SongsTable
          songs={filteredSongs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          showUndefined={showUndefined}
          onRestore={restoreHiddenSong}
          suggestions={suggestions}
        />
      </Card>
    </section>
  );
}
