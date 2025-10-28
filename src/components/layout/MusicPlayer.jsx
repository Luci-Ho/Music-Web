import React, { useContext, useRef, useEffect, useState } from "react";
import { AppContext } from "../common/AppContext";
import "./MusicPlayer.css";

export default function MusicPlayer() {
  const { currentSong } = useContext(AppContext);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (currentSong && audio) {
      audio.pause();
      audio.src = currentSong.streaming_links.audio_url;
      audio.load();
      setIsPlaying(false);
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch((err) => {
        console.error("Không thể phát nhạc:", err);
      });
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setProgress(newTime);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (!currentSong) return null;

  return (
    <div className="music-player">
      <div className="player-info">
        <img src={currentSong.cover_url} alt={currentSong.title} />
        <div>
          <h4>{currentSong.title}</h4>
          <p>{currentSong.artist}</p>
        </div>
      </div>

      <div className="controls">
        <button className="play-btn" onClick={togglePlay}>
          {isPlaying ? "⏸️" : "▶️"}
        </button>

        <div className="progress-bar">
          <span>{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            value={progress}
            onChange={handleSeek}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <audio ref={audioRef} style={{ display: "none" }} />

      <div className="player-actions">
        <button>❤️</button>
        <button>➕</button>
      </div>
    </div>
  );
}
