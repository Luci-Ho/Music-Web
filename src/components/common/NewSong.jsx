import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NewSong.css';
import SectionTitle from './SectionTitle';
import formatNumber from '../../hooks/formatNumber';
import useMatchingInfo from '../../hooks/useMatchingInfo';

const SongCard = ({ title, artist, img, views, onClick }) => {
  return (
    <div className="song-card" onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="song-thumbnail">
        <img src={img} alt={title} />
      </div>
      <div className="song-bottom">
        <div className="song-bottom-content">
          <div className="song-title">{title}</div>
          <div className="song-sub">
            <span className="song-artist">{artist}</span>
            <span className="song-views">{formatNumber(views)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SongsGrid = ({ data = [], title1 = 'New', title2 = 'Song', limit = 5 }) => {
  const { getArtistName } = useMatchingInfo();
  const navigate = useNavigate();

  const items = Array.isArray(data) ? data.slice(0, limit) : [];

  return (
    <section className="song-section">
      <SectionTitle title1={title1} title2={title2} />

      <div className="flex flex-row pr-4 w-[96%] justify-between items-center list-none">
        <div className="song-grid">
          {items.map((v, i) => {
            const artistKey = v.artist ?? v.artistId;
            const artistName = artistKey == null ? '' : (getArtistName(artistKey) || String(artistKey));
            return (
              <SongCard
                key={v._id ?? v.id ?? `${v.title}-${i}`}
                title={v.title}
                artist={artistName}
                img={v.media?.image ?? v.img}
                views={v.viewCount ?? v.views}
              />
            );
          })}
        </div>
        <div className="sviewall" onClick={() => navigate(`/allsongs`)} role="button" tabIndex={0}>
          <div className="svaplus">+</div>
          <div className="svat">View All</div>
        </div>
      </div>
    </section>
  );
};

export default SongsGrid;