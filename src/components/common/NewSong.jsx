import React from 'react';
import './NewSong.css';
import SectionTitle from './SectionTitle';
import { artist as artistList } from '../data/disdata';
import formatNumber from '../../hooks/formatNumber';
import useResponsiveCount from '../../hooks/useResponsiveCount';

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

const SongsGrid = ({ datas = [], title1 = 'New', title2 = 'Song', onViewAll, maxItems }) => {

    const responsive = useResponsiveCount({ cardWidth: 230, gap: 20, min: 1, max: 8, containerSelector: '.dcontainer', cardSelector: '.d2card' });
    const effectiveMax = typeof maxItems === 'number' ? maxItems : responsive;
    const toShow = Array.isArray(datas) ? datas.slice(0, effectiveMax) : [];

    return (
        <section className="song-section">
            <SectionTitle title1={title1} title2={title2} />

            <div className="flex flex-row pr-4 w-[96%] justify-between items-center list-none">
                <div className="song-grid">
                    {toShow.map((v, i) => {
                        const artistName = typeof v.artist === 'number'
                            ? (artistList.find(a => a.id === v.artist)?.name ?? '')
                            : v.artist;
                        return (
                            <SongCard key={v.id ?? `${v.title}-${i}`} title={v.title} artist={artistName} img={v.img} views={v.views} />);
                    })}
                </div>
                <div className="sviewall" onClick={onViewAll} role={onViewAll ? 'button' : 'link'} tabIndex={0}>
                        <div className="svaplus">+</div>
                        <div className="svat">View All</div>
                </div>
            </div>
        </section>
    );
};

export default SongsGrid;

