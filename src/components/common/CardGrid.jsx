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
                <svg xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24" fill="currentColor"
                  className="size-6">
                  <path 
                  fillRule="evenodd" 
                  d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" 
                  clipRule="evenodd" />
                </svg>
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
