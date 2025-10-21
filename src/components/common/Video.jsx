import React from 'react';
import './Video.css';
import formatNumber from '../../hooks/formatNumber';
import SectionTitle from './SectionTitle';
import { artist as artistList } from '../data/disdata';

const VideoCard = ({ title, artist, img, views, onClick }) => {
    return (
        <div className="video-card" onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
            <div className="video-thumbnail">
                <img src={img} alt={title} />
            </div>
            <div className="video-bottom">
                <div className="video-bottom-content">
                    <div className="video-title">{title}</div>
                    <div className="video-sub">
                        <span className="video-artist">{artist}</span>
                        <span className="video-views">{formatNumber(views)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VideoGrid = ({ datas = [], title1 = 'Music', title2 = 'Video', onViewAll }) => {
    const viewCount = datas.view;

    return (
        <section className="video-section">
            <SectionTitle title1={title1} title2={title2} />

            <div className="flex w-[96%] flex-row pr-4 justify-between items-center ">
                <div className="video-grid">
                    {datas.map((v, i) => {
                        const artistName = typeof v.artist === 'number'
                            ? (artistList.find(a => a.id === v.artist)?.name ?? '')
                            : v.artist;
                        return (
                            <VideoCard key={v.id ?? `${v.title}-${i}`} title={v.title} artist={artistName} img={v.img} views={v.views} />
                        );
                    })}
                </div>
                <div className="vviewall" onClick={onViewAll} role={onViewAll ? 'button' : 'link'} tabIndex={0}>
                        <div className="vvaplus">+</div>
                        <div className="vvat">View All</div>
                </div>
            </div>
        </section>
    );
};

export default VideoGrid;
export { VideoCard };
