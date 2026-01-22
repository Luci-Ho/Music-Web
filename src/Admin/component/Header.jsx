import React, { useState, useEffect, useMemo } from "react";
import { Input, Avatar, Select, AutoComplete } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const adminUser = JSON.parse(localStorage.getItem("adminuser") || "null");

// ✅ token key: bạn đổi đúng theo app bạn đang lưu
// thường là: "token" / "accessToken" / "admin_token"
const getToken = () =>
  localStorage.getItem("admin_token") ||
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  "";

async function safeFetchArray(url, headers = {}) {
  const res = await fetch(url, { headers });
  const text = await res.text();

  // backend trả HTML (Cannot GET...) hoặc trang lỗi
  if (text.trim().startsWith("<")) {
    console.warn("[safeFetchArray] HTML response:", res.status, url);
    return [];
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.warn("[safeFetchArray] Invalid JSON:", res.status, url);
    return [];
  }

  // normalize về array
  const arr =
    Array.isArray(json) ? json :
    Array.isArray(json?.data) ? json.data :
    Array.isArray(json?.songs) ? json.songs :
    Array.isArray(json?.artists) ? json.artists :
    Array.isArray(json?.albums) ? json.albums :
    Array.isArray(json?.users) ? json.users :
    [];

  return Array.isArray(arr) ? arr : [];
}

export default function Header({ query, setQuery }) {
  const { userLevel, setUserLevel, setCurrentUser } = useAuth("l1");

  const [allData, setAllData] = useState({
    songs: [],
    artists: [],
    albums: [],
    users: [],
  });

  // Load all data for search
  useEffect(() => {
    const loadSearchData = async () => {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const [songs, artists, albums, users] = await Promise.all([
          safeFetchArray(`${API_BASE}/songs`, headers),
          safeFetchArray(`${API_BASE}/artists`, headers),
          safeFetchArray(`${API_BASE}/albums`, headers),
          safeFetchArray(`${API_BASE}/users`, headers),
        ]);

        setAllData({ songs, artists, albums, users });
      } catch (error) {
        console.error("Failed to load search data:", error);
        setAllData({ songs: [], artists: [], albums: [], users: [] });
      }
    };

    loadSearchData();
  }, []);

  // text normalize (search tiếng Việt)
  const normalizeText = (text) =>
    String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");

  // map nhanh artistId -> artistName
  const artistNameById = useMemo(() => {
    const map = new Map();
    (allData.artists || []).forEach((a) => {
      if (a?._id) map.set(String(a._id), a?.name || "");
    });
    return map;
  }, [allData.artists]);

  // Search options
  const searchOptions = useMemo(() => {
    if (!query || query.length < 2) return [];

    const q = normalizeText(query);
    const results = [];

    // Songs: BE có thể trả artistId (ObjectId) thay vì song.artist
    (allData.songs || []).forEach((song) => {
      const title = song?.title || "";
      const artistLabel =
        typeof song?.artistId === "object"
          ? song?.artistId?.name || ""
          : artistNameById.get(String(song?.artistId)) || song?.artist || "";

      if (normalizeText(title).includes(q) || normalizeText(artistLabel).includes(q)) {
        results.push({
          value: `song-${song._id}`,
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#EE10B0", fontSize: 12 }}>♪</span>
              <span>{title}</span>
              <span style={{ color: "#666", fontSize: 12 }}>- {artistLabel}</span>
            </div>
          ),
          type: "song",
          data: { ...song, artistLabel },
        });
      }
    });

    // Artists
    (allData.artists || []).forEach((artist) => {
      const name = artist?.name || "";
      if (normalizeText(name).includes(q)) {
        results.push({
          value: `artist-${artist._id}`,
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#EE10B0", fontSize: 12 }}>👤</span>
              <span>{name}</span>
              <span style={{ color: "#666", fontSize: 12 }}>Artist</span>
            </div>
          ),
          type: "artist",
          data: artist,
        });
      }
    });

    // Albums
    (allData.albums || []).forEach((album) => {
      const title = album?.title || album?.name || "";
      if (normalizeText(title).includes(q)) {
        results.push({
          value: `album-${album._id}`,
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#EE10B0", fontSize: 12 }}>💿</span>
              <span>{title}</span>
              <span style={{ color: "#666", fontSize: 12 }}>Album</span>
            </div>
          ),
          type: "album",
          data: album,
        });
      }
    });

    // Users
    (allData.users || []).forEach((u) => {
      const username = u?.username || "";
      const email = u?.email || "";
      if (normalizeText(username).includes(q) || normalizeText(email).includes(q)) {
        results.push({
          value: `user-${u._id}`,
          label: (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#EE10B0", fontSize: 12 }}>👥</span>
              <span>{username}</span>
              <span style={{ color: "#666", fontSize: 12 }}>- {email}</span>
            </div>
          ),
          type: "user",
          data: u,
        });
      }
    });

    return results.slice(0, 10);
  }, [query, allData, artistNameById]);

  const handleSearch = (value) => setQuery(value);

  const handleSelect = (value, option) => {
    const data = option?.data || {};
    setQuery(data.title || data.name || data.username || "");
  };

  const handleLevelChange = (newLevel) => {
    setUserLevel(newLevel);
    setCurrentUser((prev) => ({ ...prev, level: newLevel }));
  };

  return (
    <header className="admin-header">
      <div className="left">
        <AutoComplete
          options={searchOptions}
          onSearch={handleSearch}
          onSelect={handleSelect}
          value={query}
          style={{ width: 420 }}
          placeholder="Search songs, artists, albums, users..."
          allowClear
          filterOption={false}
          notFoundContent={query && query.length >= 2 ? "No results found" : null}
        >
          <Input
            prefix={<SearchOutlined style={{ color: "#EE10B0" }} />}
            style={{
              borderColor: "#EE10B0",
              boxShadow: "0 0 0 2px rgba(238, 16, 176, 0.1)",
            }}
          />
        </AutoComplete>
      </div>

      <div className="right">
        <div className="admin-info">
          <div className="name">{adminUser?.username || "Admin"}</div>
          <div className="email">{adminUser?.email || "admin@melodies"}</div>

          <div className="role-switcher" style={{ marginTop: 4 }}>
            <span style={{ fontSize: 12, color: "#666" }}>Test Role: </span>
            <Select value={userLevel} onChange={handleLevelChange} size="small" style={{ width: 110 }}>
              <Select.Option value="l1">Admin</Select.Option>
              <Select.Option value="l2">Moderator</Select.Option>
            </Select>
          </div>
        </div>

        <Avatar size="large" icon={<UserOutlined />} />
      </div>
    </header>
  );
}
