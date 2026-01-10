import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Artist.css';
import SectionTitle from './SectionTitle';
// Removed useResponsiveCount hook — use a simple default fallback instead

const ArtistItem = ({ artist, onClick }) => (
    <div className="artist-item" onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
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

    const navigate = useNavigate();

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
            }, [limit, source]);

    return (
        <div className="w-full flex flex-col mb-10">
            <div className="acontainer">
                <SectionTitle title1={"Popular"} title2={"Artists"} />

                {loading && <p className="loading">Đang tải bài hát...</p>}
                {error && <p className="error">Lỗi: {error}</p>}

                <div className="artist-row"> 
                    {artists.map((a, i) => (
                        <Link to={`/artist/${a.id}`} key={a.id ?? `${a.name}-${i}`} style={{ textDecoration: 'none' }}>
                            <ArtistItem artist={a} />
                        </Link>
                    ))}

                    <Link to={`/artist`} className="aviewall" tabIndex={0}>
                        <div className="avaplus">+</div>
                        <p className="avat">View All</p>
                    </Link>
            </div>
            </div>
        </div>
    );
};

export default ArtistRow;
