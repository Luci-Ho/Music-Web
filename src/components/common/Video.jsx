import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircleOutlined } from '@ant-design/icons';
import './Video.css';
import formatNumber from '../../hooks/formatNumber';
import SectionTitle from './SectionTitle';
import useMatchingInfo from '../../hooks/useMatchingInfo';

import { getAllVideos } from '../../services/video.service';


const VideoCard = ({ title, artist, img, views, onClick, videoData }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="video-card"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="video-thumbnail">
                <img
                    src={img}
                    alt={title}
                />
                {/* Play overlay khi hover */}
                <div
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300"
                    style={{ opacity: isHovered ? 1 : 0 }}
                >
                    <PlayCircleOutlined className="text-white text-4xl" />
                </div>
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

const VideoGrid = ({ source = '', title1 = 'Music', title2 = 'Video', onViewAll, limit = 8 }) => {

    const navigate = useNavigate();
    const [datas, setDatas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getArtistName } = useMatchingInfo();

    const navigateToVideo = (videoData) => {
        navigate(`/video/${videoData.id}`, {
            state: { video: videoData }
        });
    };

    useEffect(() => {
        setLoading(true);

        getAllVideos()
            .then((res) => {
                const list = Array.isArray(res.data) ? res.data.slice(0, limit) : [];
                setDatas(list);
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Lỗi tải video');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [limit]);

    // artist list handled by useMatchingInfo

    return (
        <section className="video-section">
            <SectionTitle title1={title1} title2={title2} />

            {loading && <p className="loading">Đang tải bài hát...</p>}
            {error && <p className="error">Lỗi: {error}</p>}

            {!loading && !error && (
                <div className="flex w-[96%] flex-row pr-4 justify-between items-center ">
                    <div className="video-grid">
                        {datas.map((v, i) => {
                            const artistKey = v.artist ?? v.artistId;
                            const artistName = (artistKey === null || artistKey === undefined)
                                ? ''
                                : (getArtistName(artistKey) || String(artistKey));
                            return (
                                <VideoCard
                                    key={v._id}
                                    title={v.title}
                                    artist={v.artistId?.name || ''}
                                    img={v.media?.imgage}
                                    views={v.viewCount}
                                    videoData={v}
                                    onClick={() => navigateToVideo(v)}
                                />
                            );
                        })}
                    </div>
                    <div className="vviewall" onClick={() => navigate(`/video/viewall`)} tabIndex={0}>
                        <div className="vvaplus">+</div>
                        <div className="vvat">View All</div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default VideoGrid;
export { VideoCard };
