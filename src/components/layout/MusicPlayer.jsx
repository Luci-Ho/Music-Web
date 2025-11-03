import React, { useContext, useRef, useEffect, useState, useCallback } from "react";
import { AppContext } from "../common/AppContext";
import "./MusicPlayer.css";
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StepBackwardOutlined, 
  StepForwardOutlined,
  HeartOutlined,
  PlusOutlined,
  SoundOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';

export default function MusicPlayer() {
  const { currentSong } = useContext(AppContext);
  const { user, isLoggedIn, login } = useAuth();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isDashboardCollapsed, setIsDashboardCollapsed] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  // Listen for dashboard collapse state changes and existence
  useEffect(() => {
    const checkDashboardState = () => {
      const dashboard = document.getElementById('dashboard');
      if (dashboard) {
        setShowPlayer(true);
        setIsDashboardCollapsed(dashboard.classList.contains('collapsed'));
      } else {
        setShowPlayer(false);
      }
    };

    // Check initial state
    checkDashboardState();

    // Create observer to watch for dashboard existence and class changes
    const observer = new MutationObserver(checkDashboardState);
    
    // More specific observation to reduce performance impact
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
      observer.observe(dashboard, { 
        attributes: true,
        attributeFilter: ['class']
      });
    }
    
    // Fallback: observe body for dashboard creation/removal
    observer.observe(document.body, { 
      childList: true, 
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Audio loading effect with autoplay
  useEffect(() => {
    const audio = audioRef.current;
    if (currentSong && audio) {
      audio.pause();
      audio.src = currentSong.streaming_links.audio_url;
      audio.load();
      setIsPlaying(false);
      setProgress(0); // Reset progress when song changes
      setDuration(0); // Reset duration when song changes
      
      // AutoPlay when song is selected
      const handleCanPlayAutoplay = () => {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Không thể tự động phát nhạc:", err);
            setIsPlaying(false);
          });
        audio.removeEventListener("canplay", handleCanPlayAutoplay);
      };
      
      audio.addEventListener("canplay", handleCanPlayAutoplay);
    }
  }, [currentSong]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setProgress(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    const handleError = (e) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setProgress(0);
      setDuration(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
    };
  }, []);

  // Define functions with useCallback
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Check if audio is ready to play
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
        audio.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error("Không thể phát nhạc:", err);
            setIsPlaying(false);
          });
      } else {
        // Wait for audio to load
        const handleCanPlay = () => {
          audio.play()
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.error("Không thể phát nhạc:", err);
              setIsPlaying(false);
            });
          audio.removeEventListener("canplay", handleCanPlay);
        };
        audio.addEventListener("canplay", handleCanPlay);
      }
    }
  }, [currentSong, isPlaying]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.code) {
        case 'Space':
          e.preventDefault();
          if (currentSong) togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentSong) {
            const newTime = Math.max(0, progress - 10);
            if (audioRef.current) {
              audioRef.current.currentTime = newTime;
              setProgress(newTime);
            }
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentSong && duration) {
            const newTime = Math.min(duration, progress + 10);
            if (audioRef.current) {
              audioRef.current.currentTime = newTime;
              setProgress(newTime);
            }
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentSong, progress, duration, togglePlay]);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return; // Add safety check
    
    const newTime = parseFloat(e.target.value);
    if (isNaN(newTime) || newTime < 0 || newTime > duration) return; // Validate time
    
    audio.currentTime = newTime;
    setProgress(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (isNaN(newVolume) || newVolume < 0 || newVolume > 1) return; // Validate volume
    
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? Math.min((progress / duration) * 100, 100) : 0;

  // Check if current song is favorited
  useEffect(() => {
    if (currentSong && user) {
      const favorites = Array.isArray(user.favorites) ? user.favorites : [];
      setIsFavorited(favorites.includes(currentSong.id));
    } else {
      setIsFavorited(false);
    }
  }, [currentSong, user]);

  // Load playlists when component mounts
  useEffect(() => {
    if (user) {
      // Get playlists from user object directly instead of separate endpoint
      const userPlaylists = user.playlists || [];
      setPlaylists(userPlaylists);
    } else {
      setPlaylists([]);
    }
  }, [user]);

  // Add/Remove from favorites
  const toggleFavorite = useCallback(async () => {
    if (!currentSong || !user) return;

    // Get current favorites
    const favorites = Array.isArray(user.favorites) ? user.favorites : [];
    const isFav = favorites.includes(currentSong.id);
    
    // optimistic update
    const updated = isFav ? favorites.filter(id => id !== currentSong.id) : [...favorites, currentSong.id];
    const prev = favorites;
    setIsFavorited(!isFav);

    // update local user copy and persist locally
    const updatedUser = { ...(user || {}), favorites: updated };
    login(updatedUser);
    
    try { 
      window.dispatchEvent(new Event('userUpdated')); 
    } catch (err) { 
      /* ignore */ 
    }

    // persist to backend (json-server style)
    const API_USERS = 'http://localhost:4000/users';
    try {
      const res = await fetch(`${API_USERS}/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites: updated }),
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
    } catch (err) {
      // rollback
      setIsFavorited(isFav);
      const rollbackUser = { ...(user || {}), favorites: prev };
      login(rollbackUser);
      
      try { 
        window.dispatchEvent(new Event('userUpdated')); 
      } catch (e) { 
        /* ignore */ 
      }
      
      console.error("Error toggling favorite:", err);
      toast.error('Không thể cập nhật yêu thích. Vui lòng thử lại.');
    }
  }, [currentSong, user, login]);

  // Add to playlist
  const addToPlaylist = useCallback(async (playlistId) => {
    if (!currentSong || !user) return;

    try {
      // Find the playlist in user's playlists
      const userPlaylists = user.playlists || [];
      const playlist = userPlaylists.find(p => p.id === playlistId);
      
      if (!playlist) {
        alert('Không tìm thấy playlist!');
        return;
      }

      // Check if song already exists in playlist
      const songExists = playlist.songs.some(song => 
        (typeof song === 'string' ? song : song.id) === currentSong.id
      );

      if (songExists) {
        alert('Bài hát đã có trong playlist này!');
        return;
      }

      // Create updated playlists array
      const updatedPlaylists = userPlaylists.map(p => {
        if (p.id === playlistId) {
          return {
            ...p,
            songs: [...p.songs, {
              id: currentSong.id,
              title: currentSong.title,
              artist: currentSong.artist
            }]
          };
        }
        return p;
      });

      // Update user with new playlists
      const updatedUser = { ...user, playlists: updatedPlaylists };

      // Update backend
      await fetch(`http://localhost:4000/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlists: updatedPlaylists
        })
      });

      // Update local state and storage
      login(updatedUser);
      setPlaylists(updatedPlaylists);
      setShowPlaylistModal(false);
      
      try { 
        window.dispatchEvent(new Event('userUpdated')); 
      } catch (err) { 
        /* ignore */ 
      }

      toast.success('Đã thêm vào playlist thành công!');
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error('Có lỗi xảy ra khi thêm vào playlist!');
    }
  }, [currentSong, user, login]);

  // Don't render if no dashboard is present
  if (!showPlayer) {
    return null;
  }

  if (!currentSong) {
    return (
      <div 
        className="music-player" 
        style={{ 
          left: isDashboardCollapsed ? '100px' : '300px' 
        }}
      >
        <div className="player-content">
          <div className="song-info">
            <div className="song-details">
              <span className="choose-song">Choose a song to play</span>
            </div>
          </div>
          
          <div className="player-controls">
            <div className="control-buttons">
              <StepBackwardOutlined className="control-btn disabled" />
              <PlayCircleOutlined className="play-btn disabled" />
              <StepForwardOutlined className="control-btn disabled" />
            </div>
            
            <div className="progress-section">
              <span className="time">0:00</span>
              <div className="progress-bar">
                <input type="range" min="0" max="100" value="0" disabled />
              </div>
              <span className="time">0:00</span>
            </div>
          </div>

          <div className="player-actions">
            <HeartOutlined className="action-btn disabled" />
            <PlusOutlined className="action-btn disabled" />
            <SoundOutlined className="action-btn" />
            <div className="volume-control">
              <input type="range" min="0" max="1" step="0.1" value="1" disabled />
            </div>
            <UnorderedListOutlined className="action-btn" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="music-player" 
      style={{ 
        left: isDashboardCollapsed ? '100px' : '300px' 
      }}
    >
      <div className="player-content">
        <div className="song-info">
          <img src={currentSong.cover_url} alt={currentSong.title} />
          <div className="song-details">
            <h4>{currentSong.title}</h4>
            <p>{currentSong.artist}</p>
          </div>
        </div>
        
        <div className="player-controls">
          <div className="control-buttons">
            <StepBackwardOutlined className="control-btn" />
            {isPlaying ? (
              <PauseCircleOutlined className="play-btn" onClick={togglePlay} />
            ) : (
              <PlayCircleOutlined className="play-btn" onClick={togglePlay} />
            )}
            <StepForwardOutlined className="control-btn" />
          </div>
          
          <div className="progress-section">
            <span className="time">{formatTime(progress)}</span>
            <div className="progress-bar">
              <input
                type="range"
                min="0"
                max={duration}
                value={progress}
                onChange={handleSeek}
                style={{
                  background: `linear-gradient(to right, #1db954 0%, #1db954 ${progressPercentage}%, #404040 ${progressPercentage}%, #404040 100%)`
                }}
              />
            </div>
            <span className="time">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="player-actions">
          <HeartOutlined 
            className={`action-btn ${isFavorited ? 'favorited' : ''}`}
            onClick={toggleFavorite}
            style={{ color: isFavorited ? '#ff4757' : '#b3b3b3' }}
          />
          <PlusOutlined 
            className="action-btn" 
            onClick={() => setShowPlaylistModal(true)}
          />
          <SoundOutlined className="action-btn" />
          <div className="volume-control">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              style={{
                background: `linear-gradient(to right, #1db954 0%, #1db954 ${volume * 100}%, #404040 ${volume * 100}%, #404040 100%)`
              }}
            />
          </div>
          <UnorderedListOutlined className="action-btn" />
        </div>
      </div>

      <audio ref={audioRef} style={{ display: "none" }} />

      {/* Playlist Modal */}
      {showPlaylistModal && currentSong && (
        <div className="playlist-modal-overlay" onClick={() => setShowPlaylistModal(false)}>
          <div className="playlist-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Thêm "{currentSong.title}" vào Playlist</h3>
            <div className="playlist-list">
              {playlists.map(playlist => (
                <div 
                  key={playlist.id} 
                  className="playlist-item"
                  onClick={() => addToPlaylist(playlist.id)}
                >
                  <span>{playlist.name}</span>
                  <span className="song-count">({playlist.songs?.length || 0} bài)</span>
                </div>
              ))}
            </div>
            <button 
              className="close-modal-btn"
              onClick={() => setShowPlaylistModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
