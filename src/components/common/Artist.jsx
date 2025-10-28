import React, { useEffect, useState } from 'react';
import './Artist.css';
import SectionTitle from './SectionTitle';

import { AppContext } from "./AppContext";


const ArtistItem = ({ artist }) => (
  <div className="artist-item">
    <div className="artist-avatar">
      <img src={artist.img} alt={artist.name} />
    </div>
    <div className="artist-name">{artist.name}</div>
  </div>
);

const ArtistRow = ({ limit = 5 }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/songs")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể lấy dữ liệu");
        return res.json();
      })
      .then((data) => {
        const uniqueArtists = [];
        const seen = new Set();

        data.forEach((song) => {
          if (!seen.has(song.artist)) {
            seen.add(song.artist);
            uniqueArtists.push({
              name: song.artist,
              img: song.artist_avatar,
            });
          }
        });

        setArtists(uniqueArtists.slice(0, limit));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [limit]);

  return (
    <div className="w-full h-full flex flex-col mb-10">
      <div className="acontainer">
        <SectionTitle title1={"Popular"} title2={"Artists"} />
        
        {loading && <p className="loading">Đang tải ca sĩ...</p>}
        {error && <p className="error">Lỗi: {error}</p>}

        <div className="artist-row">
          {artists.map((a, i) => (
            <ArtistItem artist={a} key={`${a.name}-${i}`} />
          ))}

          <div className="aviewall" tabIndex={0}>
            <div className="avaplus">+</div>
            <p className="avat">View All</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistRow;
