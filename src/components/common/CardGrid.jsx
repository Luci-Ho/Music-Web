import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CardGrid.css";
import SectionTitle from "./SectionTitle.jsx";

export default function CardGrid({ title = "Danh mục bài hát", title2 = "", limit = 6 , onViewAll}) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      <SectionTitle title1={title} title2={title2} />

      {loading && <p className="loading">Đang tải bài hát...</p>}
      {error && <p className="error">Lỗi: {error}</p>}

      <div className="grid-container">
        {songs.map((song, index) => (
          <div 
          className="card" 
          key={index}
          onClick={() => navigate(`/song/${song.id}`)}
          style={{cursor: "pointer"}}
          >
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
        <div className="cviewall" onClick={onViewAll} role={onViewAll ? 'button' : 'link'} tabIndex={0}>
                <div className="cvaplus">+</div>
                <div className="cvat">View All</div>
        </div>

      </div>
    </div>
  );
}
