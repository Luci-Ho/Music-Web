import React, { useMemo, useContext } from "react";
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
  data = [],
  onViewAll
}) {
  const { playSong } = useContext(AppContext);
  const navigate = useNavigate();

  // Tính toán danh sách bài hát từ data
  const songs = useMemo(() => {
    let filtered = Array.isArray(data) ? [...data] : [];

    if (filterBy) {
      Object.entries(filterBy).forEach(([key, value]) => {
        filtered = filtered.filter((song) => song[key] === value);
      });
    }

    if (filterByYear) {
      filtered = filtered.filter((song) => {
        if (!song.releaseDate) return false;
        return new Date(song.releaseDate).getFullYear() === filterByYear;
      });
    }

    filtered.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    return filtered.slice(0, limit);
  }, [data, limit, filterBy, filterByYear]);

  const handlePlaySong = (song) => {
    playSong(song, songs);
  };

  return (
    <div className="card-grid">
      <div className="grid-title">
        <SectionTitle title1={title1} title2={title2} />
      </div>

      {songs.length === 0 ? (
        <p className="loading">Không có dữ liệu để hiển thị</p>
      ) : (
        <div className="grid-container">
          {songs.map((song, index) => (
            <div className="card" key={song._id ?? index}>
              <div className="card-image">
                <img
                  src={
                    song.cover_url ||
                    song.media?.image ||
                    "/images/none.jpg"
                  }
                  alt={song.title}
                  onClick={() => handlePlaySong(song)}
                />
              </div>

              <div
                className="card-info"
                onClick={() => handlePlaySong(song)}
              >
                <h3>{song.title}</h3>
                <p>{song.artistId?.name || song.artistName || "Unknown Artist"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}