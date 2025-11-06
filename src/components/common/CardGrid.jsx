import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./CardGrid.css";
import SectionTitle from "./SectionTitle.jsx";
import { AppContext } from "./AppContext";

export default function CardGrid({
  title1 = "",
  title2 = "",
  limit = 5,
  filterBy,
  filterByYear,
  onViewAll
}) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { playAll, selectSong, playSong } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const url = "http://localhost:4000/songs";

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể lấy dữ liệu");
        return res.json();
      })
      .then((data) => {
        let filtered = data;

        if (filterBy) {
          Object.entries(filterBy).forEach(([key, value]) => {
            filtered = filtered.filter((song) => song[key] === value);
          });
        }

        if (filterByYear) {
          filtered = filtered.filter((song) => {
            const year = new Date(song.release_date).getFullYear();
            return year === filterByYear;
          });
        }

        filtered.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        setSongs(filtered.slice(0, limit));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [limit, filterBy, filterByYear]);

  const handlePlaySong = (song) => {
    playSong(song, songs);   // phát bài được chọn và set playlist
  };

  return (
    <div className="card-grid">
      <div className="grid-title">
        <SectionTitle title1={title1} title2={title2} />
      </div>

      {loading && <p className="loading">Đang tải bài hát...</p>}
      {error && <p className="error">Lỗi: {error}</p>}

      <div className="grid-container">
        {songs.map((song, index) => (
          <div className="card" key={index} style={{ cursor: "pointer" }}>
            <div className="card-image">
              <img
                src={song.cover_url}
                alt={song.title}
                onClick={() => handlePlaySong(song)}
                style={{ width: "100%", borderRadius: "5px" }}
              />
            </div>

            <div className="card-info" onClick={() => handlePlaySong(song)}>
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
