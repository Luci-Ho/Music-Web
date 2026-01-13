import React, { useState, useEffect, useRef } from 'react';
import { PlayCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const FlexibleVideoPlayer = ({ video, onError }) => {
  const [playerType, setPlayerType] = useState('iframe'); // iframe, link, error
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  useEffect(() => {
    // Reset states when video changes
    setHasError(false);
    setIsLoading(true);
    setPlayerType('iframe');
    
    // Clear any existing timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    // Set a backup timeout to fallback if iframe doesn't load after 10 seconds
    errorTimeoutRef.current = setTimeout(() => {
      if (isLoading && !hasError) {
        console.log('Iframe timeout, falling back to YouTube link');
        handleIframeError();
      }
    }, 10000); // 10 seconds timeout

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [video?._id]);

  const handleIframeError = () => {
    console.log('Iframe failed, showing fallback');
    setHasError(true);
    setIsLoading(false);
    setPlayerType('link');
    if (onError) onError();
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setPlayerType('iframe');
    
    // Clear timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    
    // Set new timeout
    errorTimeoutRef.current = setTimeout(() => {
      if (isLoading && !hasError) {
        console.log('Retry timeout, falling back to YouTube link');
        handleIframeError();
      }
    }, 10000);
  };

  const handleIframeLoad = () => {
    console.log('Iframe loaded successfully');
    setIsLoading(false);
    setHasError(false);
    
    // Clear error timeout since iframe loaded successfully
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
  };

  const getYouTubeWatchUrl = (embedUrl) => {
    if (!embedUrl) return '#';
    
    // Handle different YouTube URL formats
    let videoId = null;
    
    if (embedUrl.includes('/embed/')) {
      const match = embedUrl.match(/\/embed\/([^?&]+)/);
      videoId = match ? match[1] : null;
    } else if (embedUrl.includes('watch?v=')) {
      const match = embedUrl.match(/watch\?v=([^?&]+)/);
      videoId = match ? match[1] : null;
    } else if (embedUrl.includes('youtu.be/')) {
      const match = embedUrl.match(/youtu\.be\/([^?&]+)/);
      videoId = match ? match[1] : null;
    }
    
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : embedUrl;
  };

  const getYouTubeThumbnail = (embedUrl) => {
    if (!embedUrl) return video.img;
    
    let videoId = null;
    
    if (embedUrl.includes('/embed/')) {
      const match = embedUrl.match(/\/embed\/([^?&]+)/);
      videoId = match ? match[1] : null;
    } else if (embedUrl.includes('watch?v=')) {
      const match = embedUrl.match(/watch\?v=([^?&]+)/);
      videoId = match ? match[1] : null;
    } else if (embedUrl.includes('youtu.be/')) {
      const match = embedUrl.match(/youtu\.be\/([^?&]+)/);
      videoId = match ? match[1] : null;
    }
    
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : video.img;
  };

  // Ensure we have a proper embed URL
  const getEmbedUrl = (videoUrl) => {
    if (!videoUrl) return null;
    
    // If already an embed URL, return as-is
    if (videoUrl.includes('/embed/')) {
      return videoUrl;
    }
    
    // Convert watch URL to embed URL
    let videoId = null;
    if (videoUrl.includes('watch?v=')) {
      const match = videoUrl.match(/watch\?v=([^?&]+)/);
      videoId = match ? match[1] : null;
    } else if (videoUrl.includes('youtu.be/')) {
      const match = videoUrl.match(/youtu\.be\/([^?&]+)/);
      videoId = match ? match[1] : null;
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
  };

  if (playerType === 'link' || hasError) {
    return (
      <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white relative overflow-hidden">
        <img 
          src={getYouTubeThumbnail(video.videoUrl) || video.img}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 text-center">
          <PlayCircleOutlined className="text-6xl mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
          <p className="text-gray-300 mb-4">Video không thể tải trực tiếp</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ExclamationCircleOutlined />
              Thử lại
            </button>
            <a 
              href={getYouTubeWatchUrl(video.videoUrl)}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <PlayCircleOutlined />
              Xem trên YouTube
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-white text-lg">Đang tải video...</div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        className="w-full h-full rounded-lg"
        src={getEmbedUrl(video.videoUrl)}
        title={video.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onError={handleIframeError}
        onLoad={handleIframeLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default FlexibleVideoPlayer;