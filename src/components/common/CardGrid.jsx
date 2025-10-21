import React, { useEffect, useState } from "react";
import "./CardGrid.css";

export default function CardGrid({ title = "Danh mục bài hát", limit = 5 }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/songs")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể lấy dữ liệu");
        return res.json();
      })
      .then((data) => {
        setSongs(data.slice(0, limit)); // giới hạn số bài
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [limit]);

  return (
    <div className="card-grid">
      <h2 className="grid-title">{title}</h2>

      {loading && <p className="loading">Đang tải bài hát...</p>}
      {error && <p className="error">Lỗi: {error}</p>}

      <div className="grid-container">
        {songs.map((song, index) => (
          <div className="card" key={index}>
            <div className="card-image">
              <img src={song.cover_url} alt={song.title} />
              <div className="music-icon">
                🎶
              </div>
            </div>
            <div className="card-info">
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
