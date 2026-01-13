import React, { useContext, useRef, useEffect, useState, useCallback } from "react";
import { AppContext } from "../common/AppContext";
import "./MusicPlayer.css";
import LikeButton from '../common/LikeButton';
import { handleFavoriteToggle } from '../../utils/handleFavoriteToggle';
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useDashboard } from '../../App';
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';

import usePlaylistTrigger from '../../hooks/usePlaylistTrigger';

export default function MusicPlayer() {
  const {
    playlist,
    currentSong,
    selectSong,
    currentIndex,
    setCurrentIndex
  } = useContext(AppContext);

  const { openPopup } = usePlaylistTrigger();

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [canSeek, setCanSeek] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const { user, login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { dashboardCollapsed } = useDashboard();
  const [favorites, setFavorites] = useState(() =>
    user && Array.isArray(user.favorites) ? user.favorites : []
  );

  // Hide music player in admin routes and login/signup pages
  const hidePlayer = ['/login', '/signup', '/loading'].includes(location.pathname);

  useEffect(() => {
    setFavorites(user && Array.isArray(user.favorites) ? user.favorites : []);
  }, [user]);

  const isFav = currentSong?.id && favorites.includes(currentSong.id);

  const handleToggleFavorite = (e) => {
    handleFavoriteToggle({
      e,
      songId: currentSong.id,
      isFav,
      favorites,
      setFavorites,
      user,
      login,
      navigate,
      location,
    });
  };

  // Load bài hát mới
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const audioUrl = currentSong?.media?.audioUrl;

    if (!audioUrl) {
      console.error('❌ Song missing audioUrl:', currentSong);
      return;
    }

    console.log("🎧 AUDIO URL =", audioUrl);

    // stop bài cũ
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);

    // load bài mới
    audio.src = audioUrl;
    audio.load();

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setCanSeek(true);

      if (shouldAutoPlay) {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.warn("⚠️ autoplay blocked:", err);
          });
      }
    };

    const updateProgress = () => {
      setProgress(audio.currentTime);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", updateProgress);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, [currentSong, shouldAutoPlay]);


  // Xử lý khi bài hát kết thúc
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      // Tự động chuyển bài tiếp theo chỉ khi user đã cho phép auto-play
      if (shouldAutoPlay && currentIndex < playlist.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex, playlist.length, setCurrentIndex]);


  // Phát hoặc tạm dừng
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (audio.paused) {
      setShouldAutoPlay(true); // Đánh dấu user muốn auto-play
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Không thể phát nhạc:", err));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };


  // Tua thời gian
  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration || !canSeek) return;

    const newTime = parseFloat(e.target.value);
    if (isNaN(newTime)) return;

    audio.currentTime = newTime;
    setProgress(newTime);

    // Nếu đang phát thì tiếp tục phát sau khi tua
    if (!audio.paused) {
      audio.play().catch((err) => {
        console.error("Không thể phát sau khi tua:", err);
      });
    }
  };




  // Format thời gian
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (!currentSong) return null;

  // Hide music player for login/signup pages
  if (hidePlayer) return null;

  const playerStyle = {
    left: dashboardCollapsed ? '100px' : '300px',
    transition: 'left 0.2s ease'
  };

  return (

    <div className="music-player" style={playerStyle}>
      <div className="player-left">
        <img
          src={currentSong.coverUrl || "/images/none.jpg"}
          alt={currentSong.title}
          onError={(e) => {
            e.target.src = "/images/none.jpg";
          }}
        />

        <div className="song-info">
          <h4>{currentSong.title}</h4>
          <p>{currentSong.artist}</p>
        </div>
      </div>

      <div className="player-center">
        <div className="controls">
          <button onClick={() => {
            if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
          }}><DoubleLeftOutlined /></button>
          <button className="" onClick={togglePlay}>
            {isPlaying ? (
              <PauseCircleOutlined style={{ fontSize: '30px' }} />
            ) : (
              <PlayCircleOutlined style={{ fontSize: '30px' }} />
            )}
          </button>
          <button onClick={() => {
            if (currentIndex < playlist.length - 1) setCurrentIndex(currentIndex + 1);
          }}><DoubleRightOutlined /></button>
        </div>
        <div className="progress-bar">
          <span>{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={Number(progress)}
            step="0.1"
            onInput={handleSeek}
            style={{
              backgroundSize: `${(progress / duration) * 100}% 100%`
            }}
          />

          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-right">
        {currentSong && (
          <LikeButton isFav={isFav}
            onClick={handleToggleFavorite} />
        )}

        <button onClick={() => openPopup(currentSong.id)}>
          <PlusCircleOutlined />
        </button>

      </div>

      <audio ref={audioRef} style={{ display: "none" }} />
    </div>

  );
}
