import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import '../style/Layout.css';
import '../style/VA.css';
import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';
import formatNumber from '../hooks/formatNumber';
import useMatchingInfo from '../hooks/useMatchingInfo';
import { PlayCircleOutlined, AppstoreOutlined, HeartOutlined } from '@ant-design/icons';

const VideoCard = ({ video, onClick }) => {
    const { getArtistName } = useMatchingInfo();
    const artistName = getArtistName(video.artist || video.artistId) || video.artist || 'Unknown Artist';
    
    return (
        <div 
            className="video-all-card" 
            onClick={onClick}
        >
            <div className="video-all-thumbnail">
                <img src={video.img} alt={video.title} />
                <div className="video-all-overlay">
                    <PlayCircleOutlined className="video-all-play-icon" />
                </div>
            </div>
            <div className="video-all-info">
                <h3 className="video-all-title">{video.title}</h3>
                <p className="video-all-artist">{artistName}</p>
                <p className="video-all-views">{formatNumber(video.views)} lượt xem</p>
            </div>
        </div>
    );
};

const GenreCard = ({ genre, onClick }) => {
    return (
        <div 
            className="video-all-card" 
            onClick={onClick}
        >
            <div className="video-all-thumbnail">
                <img src={genre.img} alt={genre.title} />
                <div className="video-all-overlay">
                    <AppstoreOutlined className="video-all-play-icon" />
                </div>
            </div>
            <div className="video-all-info">
                <h3 className="video-all-title">{genre.title}</h3>
                <p className="video-all-artist">Thể loại nhạc</p>
            </div>
        </div>
    );
};

const MoodCard = ({ mood, onClick }) => {
    return (
        <div 
            className="video-all-card" 
            onClick={onClick}
        >
            <div className="video-all-thumbnail">
                <img src={mood.img} alt={mood.title} />
                <div className="video-all-overlay">
                    <HeartOutlined className="video-all-play-icon" />
                </div>
            </div>
            <div className="video-all-info">
                <h3 className="video-all-title">{mood.title}</h3>
                <p className="video-all-artist">Tâm trạng</p>
            </div>
        </div>
    );
};

const ViewAllPage = ({ pageType = 'videos' }) => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getPageConfig = () => {
        switch (pageType) {
            case 'genres':
                return {
                    endpoint: 'genres',
                    title: 'Tất cả Thể loại',
                    itemName: 'thể loại'
                };
            case 'moods':
                return {
                    endpoint: 'moods',
                    title: 'Tất cả Tâm trạng',
                    itemName: 'tâm trạng'
                };
            default:
                return {
                    endpoint: 'videos',
                    title: 'Tất cả Videos',
                    itemName: 'videos'
                };
        }
    };

    const config = getPageConfig();

    useEffect(() => {
        // Fetch data from API based on pageType
        fetch(`http://localhost:4000/${config.endpoint}`)
            .then(res => {
                if (!res.ok) throw new Error(`Không thể tải ${config.itemName}`);
                return res.json();
            })
            .then(data => {
                setData(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [pageType]);

    const handleItemClick = (item) => {
        switch (pageType) {
            case 'genres':
                navigate(`/genre/${item.id}`);
                break;
            case 'moods':
                navigate(`/mood/${item.id}`);
                break;
            default:
                navigate(`/video/${item.id}`, { state: { video: item } });
                break;
        }
    };

    const renderCard = (item) => {
        switch (pageType) {
            case 'genres':
                return (
                    <GenreCard
                        key={item.id}
                        genre={item}
                        onClick={() => handleItemClick(item)}
                    />
                );
            case 'moods':
                return (
                    <MoodCard
                        key={item.id}
                        mood={item}
                        onClick={() => handleItemClick(item)}
                    />
                );
            default:
                return (
                    <VideoCard
                        key={item.id}
                        video={item}
                        onClick={() => handleItemClick(item)}
                    />
                );
        }
    };

    if (loading) {
        return (
            <>
                <TopBar />
                <div className="content">
                    <div className="bluebox">
                        <div className="loading-message">Đang tải {config.itemName}...</div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <TopBar />
                <div className="content">
                    <div className="bluebox">
                        <div className="error-message">Lỗi: {error}</div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <TopBar />
            <div className="content" style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                minHeight: '100vh'
            }}>
                <div className="bluebox">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-white text-3xl font-bold">{config.title}</h1>
                            <p className="text-gray-300">{data.length} {config.itemName}</p>
                        </div>
                        
                        <div className="video-all-grid">
                            {data.map((item) => renderCard(item))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ViewAllPage;
