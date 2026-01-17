import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Artist.css';
import SectionTitle from './SectionTitle';
// Removed useResponsiveCount hook — use a simple default fallback instead
import ArtistService from '../../services/artist.service';

const ArtistItem = ({ artist, onClick }) => (
  <div
    className="artist-item"
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    <div className="artist-avatar">
      <img src={artist.img} alt={artist.name} />
    </div>
    <div className="artist-name">{artist.name}</div>
  </div>
);

const ArtistRow = ({ data = [], limit = 6 }) => {
  const [artistList, setArtistList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await ArtistService.getAll();
        setArtistList(data.slice(0, limit));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, [limit]);

  return (
    <div className="w-full flex flex-col mb-10">
      <div className="acontainer">
        <SectionTitle title1={"Popular"} title2={"Artists"} />

        {loading && <p className="loading">Đang tải bài hát...</p>}
        {error && <p className="error">Lỗi: {error}</p>}

        <div className="artist-row">
          {artistList.map((a, i) => {
            const artistId = a._id || a.legacyId;

            return (
              <Link
                to={`/artist/${artistId}`}
                key={artistId ?? `${a.name}-${i}`}
                style={{ textDecoration: 'none' }}
              >
                <ArtistItem artist={a} />
              </Link>
            );
          })}


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