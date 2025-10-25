import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../components/layout/Footer";
import TopBar from "../components/layout/TopBar";
import Dashboard from "../components/layout/Dashboard";

import "../style/Layout.css";
import "../App.css";

const PlaylistDetail = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    // Lấy thông tin playlist theo ID
    fetch(`http://localhost:4000/playlists/${id}`)
      .then((res) => res.json())
      .then((data) => setPlaylist(data))
      .catch((err) => console.error("Lỗi khi lấy playlist:", err));
  }, [id]);

  if (!playlist) {
    return (
      <div className="body">
        <div style={{ display: "flex", width: "100%" }}>
          <Dashboard />
          <div className="container">
            <TopBar />
            <div className="content">
              <h2 style={{ color: "white" }}>Đang tải playlist...</h2>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="body">
      <div style={{ display: "flex", width: "100%" }}>
        <Dashboard />
        <div className="container">
          <TopBar />
          <div className="content">
            <h2 style={{ color: "white" }}>📁 {playlist.name}</h2>

            <ul style={{ marginTop: "20px" }}>
              {playlist.songs.map((song) => (
                <li key={song.id} style={{ marginBottom: "10px", color: "white" }}>
                  <strong>{song.title}</strong> — {song.artist}
                </li>
              ))}
            </ul>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetail;
