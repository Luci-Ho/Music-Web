import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined,
  SoundOutlined,
  ShareAltOutlined,
  HeartOutlined,
  HeartFilled,
  ArrowLeftOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';
import SectionTitle from '../components/common/SectionTitle';
import LoadingPage from '../components/common/LoadingPage';
import EmptyStatePage from '../components/common/EmptyStatePage';
import FlexibleVideoPlayer from '../components/common/FlexibleVideoPlayer';
import useDataLoader from '../hooks/useDataLoader';
import useFavorites from '../hooks/useFavorites';
import useFormatViews from '../hooks/useFormatViews';
import useMatchingInfo from '../hooks/useMatchingInfo';
import formatNumber from '../hooks/formatNumber';

import '../style/Layout.css';
import '../style/VideoPlayer.css';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  
  const { loading } = useDataLoader();
  const { getArtistName } = useMatchingInfo();
  const { formatViews } = useFormatViews();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Load video data
    if (location.state?.video) {
      setVideo(location.state.video);
    } else {
      // Fetch video from API
      fetch(`http://localhost:5000/videos/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Video not found');
          return res.json();
        })
        .then(data => setVideo(data))
        .catch(err => {
          console.error('Error loading video:', err);
          setVideo(null);
        });
    }

    // Load related videos
    fetch('http://localhost:5000/videos')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(v => v.id !== id).slice(0, 6);
        setRelatedVideos(filtered);
      })
      .catch(err => console.error('Error loading related videos:', err));
  }, [id, location.state]);

  const handleVideoError = () => {
    setVideoError(true);
  };

  const navigateToVideo = (videoData) => {
    navigate(`/video/${videoData.id}`, { 
      state: { video: videoData },
      replace: false 
    });
  };

  if (loading) {
    return <LoadingPage message="Đang tải video..." />;
  }

  if (!video) {
    return (
      <EmptyStatePage 
        title="Không tìm thấy video"
        buttonText="Quay lại danh sách video"
        onButtonClick={() => navigate('/video/viewall')}
      />
    );
  }

  const artistName = getArtistName(video.artist || video.artistId) || video.artist || 'Unknown Artist';
  const isFav = isFavorite(video.id);

  return (
    <>
      <TopBar />
      <div className="content" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        minHeight: '100vh'
      }}>
        <div className="bluebox">
          <div className="px-6 py-4">
            {/* Back Button */}
            <button 
              onClick={() => navigate('/video/viewall')}
              className="text-white hover:text-gray-300 mb-4 flex items-center gap-2 transition-colors"
            >
              <ArrowLeftOutlined /> Quay lại
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Video Player */}
              <div className="lg:col-span-2">
                <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
                  <FlexibleVideoPlayer 
                    video={video} 
                    onError={handleVideoError}
                  />
                </div>

                {/* Video Info */}
                <div className="mt-6">
                  <h1 className="text-white text-2xl font-bold mb-3">{video.title}</h1>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <EyeOutlined />
                        <span>{formatViews(video.views)} lượt xem</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CalendarOutlined />
                        <span>{new Date(video.releaseDate || '2024-01-01').toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleFavorite(video.id)}
                        className={`p-3 rounded-full transition-all ${
                          isFav 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                        title={isFav ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                      >
                        {isFav ? <HeartFilled /> : <HeartOutlined />}
                      </button>
                      
                      <button
                        onClick={() => toast.info('Chức năng chia sẻ sẽ được cập nhật!')}
                        className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                        title="Chia sẻ"
                      >
                        <ShareAltOutlined />
                      </button>
                    </div>
                  </div>

                  {/* Artist Info */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <UserOutlined className="text-2xl text-gray-300" />
                      <div>
                        <h3 className="text-white font-semibold text-lg">{artistName}</h3>
                        <p className="text-gray-400 text-sm">Nghệ sĩ</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {video.description || `Video âm nhạc từ ${artistName}. Thưởng thức những giai điệu tuyệt vời và chất lượng hình ảnh cao.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Related Videos Sidebar */}
              <div className="lg:col-span-1">
                <h3 className="text-white text-xl font-semibold mb-4">Video liên quan</h3>
                
                <div className="space-y-4">
                  {relatedVideos.map((relatedVideo) => {
                    const relatedArtist = getArtistName(relatedVideo.artist || relatedVideo.artistId) || relatedVideo.artist || 'Unknown Artist';
                    return (
                      <div
                        key={relatedVideo.id}
                        onClick={() => navigateToVideo(relatedVideo)}
                        className="flex gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all cursor-pointer group"
                      >
                        <div className="relative flex-shrink-0">
                          <img 
                            src={relatedVideo.img} 
                            alt={relatedVideo.title}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded">
                            <PlayCircleOutlined className="text-white text-2xl" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
                            {relatedVideo.title}
                          </h4>
                          <p className="text-gray-400 text-xs mb-1">{relatedArtist}</p>
                          <p className="text-gray-500 text-xs">
                            {formatNumber(relatedVideo.views)} lượt xem
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VideoPlayerPage;