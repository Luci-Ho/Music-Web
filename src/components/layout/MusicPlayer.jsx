import React, { useContext, useRef, useEffect, useState, useCallback } from "react";
import { AppContext } from "../common/AppContext";
import "./MusicPlayer.css";
import LikeButton from '../common/LikeButton';
import { handleFavoriteToggle } from '../../utils/handleFavoriteToggle';
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';

export default function MusicPlayer() {
  const {
    playlist,
    currentSong,
    selectSong,
    currentIndex,
    setCurrentIndex
  } = useContext(AppContext);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [canSeek, setCanSeek] = useState(false);

  const { user, login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [favorites, setFavorites] = useState(() =>
    user && Array.isArray(user.favorites) ? user.favorites : []
  );


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

  // Load bài hát mới, không tự động phát
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setCanSeek(true);
    };

    const updateProgress = () => {
      setProgress(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.pause();
    audio.src = currentSong.streaming_links.audio_url;
    audio.load();

    // audio.play()
    //   .then(() => setIsPlaying(true))
    //   .catch((err) => {
    //     console.warn("⚠️ Không thể tự động phát:", err);
    //     setIsPlaying(false);
    //   });

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    setIsPlaying(false);
    setProgress(0);
    setCanSeek(false);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSong]);


  // Cập nhật trạng thái và tiến trình
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    const updateProgress = () => {
      console.log("⏱️ currentTime:", audio.currentTime);
      setProgress(audio.currentTime);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", updateProgress);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, []);


  // Phát hoặc tạm dừng
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (audio.paused) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Không thể phát nhạc:", err));
    } else {
      audio.pause();
      setIsPlaying(false); // ép cập nhật ngay
    }
  };


  // Tua thời gian
  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return; // Add safety check
    
    const newTime = parseFloat(e.target.value);
    if (!audio || isNaN(newTime)) return;

    // Chỉ tua nếu audio đã có dữ liệu
    if (canSeek) {
      audio.currentTime = newTime;
      setProgress(newTime);

      if (!audio.paused) {
        audio.play().catch((err) => {
          console.error("Không thể phát sau khi tua:", err);
        });
      }
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

  return (

    <div className="music-player">
      <div className="player-left">
        <img src={currentSong.cover_url} alt={currentSong.title} />
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
        <button><PlusCircleOutlined /></button>

      </div>

      <audio ref={audioRef} style={{ display: "none" }} />
    </div>

  );
}
