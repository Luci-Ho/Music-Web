import React from 'react';
import { useEffect, useState } from 'react';
import './Artist.css';
import SectionTitle from './SectionTitle';
// Removed useResponsiveCount hook — use a simple default fallback instead

const ArtistItem = ({ artist }) => (
    <div className="artist-item">
        <div className="artist-avatar">
            <img src={artist.img} alt={artist.name} />
        </div>
        <div className="artist-name">{artist.name}</div>
    </div>
);

const ArtistRow = ({ source,  limit = 6 }) => {
    const [artists, setArtists] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    useEffect(() => {
        fetch(`http://localhost:4000/${source}`)
          .then((res) => {
            if (!res.ok) throw new Error("Không thể lấy dữ liệu");
            return res.json();
          })
          .then((data) => {
            setArtists(data.slice(0, limit)); // giới hạn số bài
            setLoading(false);
          })
          .catch((err) => {
            setError(err.message);
            setLoading(false);
          });
      }, [limit]);

    return (
        <div className="w-full flex flex-col mb-10">
            <div className="acontainer">
                <SectionTitle title1={"Popular"} title2={"Artists"} />

                {loading && <p className="loading">Đang tải bài hát...</p>}
                {error && <p className="error">Lỗi: {error}</p>}

                <div className="artist-row"> 
                    {artists.map((a, i) => (
                        <ArtistItem artist={a} key={a.id ?? `${a.name}-${i}`} />
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
