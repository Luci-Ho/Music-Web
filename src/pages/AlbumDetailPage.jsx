import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined,
  HeartOutlined,
  HeartFilled,
  PlusOutlined,
  ShareAltOutlined,
  UserOutlined,
  CalendarOutlined,
  SoundOutlined,
  ArrowLeftOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import useDataLoader from '../hooks/useDataLoader';
import useFavorites from '../hooks/useFavorites';
import useFormatViews from '../hooks/useFormatViews';
import useFormatDuration from '../hooks/useFormatDuration';
import useMusicPlayer from '../hooks/useMusicPlayer';
import useAuth from '../hooks/useAuth';

import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';
import SectionTitle from '../components/common/SectionTitle';
import LoadingPage from '../components/common/LoadingPage';
import EmptyStatePage from '../components/common/EmptyStatePage';

import '../style/Layout.css';
import '../style/VA.css';

const AlbumDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Custom hooks
  const { albums, artists, allSongs, loading } = useDataLoader();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { formatViews } = useFormatViews();
  const { formatDuration, formatTotalDuration } = useFormatDuration();
  const { playSong, playAlbum } = useMusicPlayer();
  const { user, isLoggedIn, login } = useAuth();
  
  const [album, setAlbum] = useState(null);
  const [albumSongs, setAlbumSongs] = useState([]);
  const [artist, setArtist] = useState(null);
  
  // Playlist popup states
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  useEffect(() => {
    // If album data is passed through navigation state
    if (location.state?.album && location.state?.songs) {
      setAlbum(location.state.album);
      setAlbumSongs(location.state.songs);
      
      // Find artist info
      const foundArtist = artists.find(a => a.id === location.state.album.artistId);
      setArtist(foundArtist);
      
      return;
    }

    // Otherwise, find album and songs from data
    const foundAlbum = albums.find(a => a.id === id);
    if (foundAlbum) {
      // Get songs in this album
      const albumSongsData = allSongs.filter(song => 
        foundAlbum.songs.includes(song.id) || song.albumId === foundAlbum.id
      );

      // Find artist
      const foundArtist = artists.find(a => a.id === foundAlbum.artistId);

      setAlbum(foundAlbum);
      setAlbumSongs(albumSongsData);
      setArtist(foundArtist);
    } else {
      toast.error('Không tìm thấy album!');
      navigate('/album');
    }
  }, [id, location.state, navigate, albums, artists, allSongs]);

  // Load user playlists
  useEffect(() => {
    if (user && user.playlists) {
      setUserPlaylists(Array.isArray(user.playlists) ? user.playlists : []);
    } else {
      setUserPlaylists([]);
    }
  }, [user]);

  // Playlist functions
  const addToPlaylist = async (songId, playlistId) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      const updatedPlaylists = userPlaylists.map(playlist => {
        if (playlist.id === playlistId) {
          const songs = Array.isArray(playlist.songs) ? playlist.songs : [];
          if (!songs.includes(songId)) {
            return { ...playlist, songs: [...songs, songId] };
          }
        }
        return playlist;
      });

      setUserPlaylists(updatedPlaylists);
      
      // Update user object
      const updatedUser = { ...user, playlists: updatedPlaylists };
      login(updatedUser);

      // Persist to backend
      const API_USERS = 'http://localhost:5000/users';
      const res = await fetch(`${API_USERS}/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlists: updatedPlaylists }),
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      
      const playlistName = updatedPlaylists.find(p => p.id === playlistId)?.name || 'playlist';
      setShowPlaylistPopup(false);
      toast.success(`Đã thêm bài hát vào ${playlistName}`);
      
    } catch (err) {
      toast.error('Không thể thêm vào playlist. Vui lòng thử lại.');
    }
  };

  const createNewPlaylist = async (songId) => {
    if (!newPlaylistName.trim()) {
      toast.error('Vui lòng nhập tên playlist');
      return;
    }

    try {
      const newPlaylist = {
        id: `pl_${Date.now()}`,
        name: newPlaylistName.trim(),
        songs: [songId],
        createdAt: new Date().toISOString()
      };

      const updatedPlaylists = [...userPlaylists, newPlaylist];
      setUserPlaylists(updatedPlaylists);
      
      // Update user object
      const updatedUser = { ...user, playlists: updatedPlaylists };
      login(updatedUser);

      // Persist to backend
      const API_USERS = 'http://localhost:5000/users';
      const res = await fetch(`${API_USERS}/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlists: updatedPlaylists }),
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      
      toast.success(`Đã tạo playlist "${newPlaylistName}" và thêm bài hát`);
      setNewPlaylistName('');
      setShowCreatePlaylist(false);
      setShowPlaylistPopup(false);
      
    } catch (err) {
      toast.error('Không thể tạo playlist. Vui lòng thử lại.');
    }
  };

  const totalViews = albumSongs.reduce((sum, song) => sum + (song.viewCount || 0), 0);
  const totalDuration = albumSongs.reduce((sum, song) => {
    if (!song.duration) return sum;
    if (typeof song.duration === 'string' && song.duration.includes(':')) {
      const [min, sec] = song.duration.split(':').map(Number);
      return sum + (min * 60) + sec;
    }
    return sum + (parseInt(song.duration) || 0);
  }, 0);

  if (loading) {
    return <LoadingPage message="Đang tải thông tin album..." />;
  }

  if (!album) {
    return (
      <EmptyStatePage 
        title="Không tìm thấy album"
        buttonText="Quay lại danh sách albums"
        onButtonClick={() => navigate('/album')}
      />
    );
  }

  return (
    <>
      <div className="content" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
        <div className="bluebox">
          {/* Album Header */}
          <TopBar />
          <div className="TopPart bg-gradient-to-r from-blue-400 to-gray-600 rounded-lg">
            <div className="top2">
              <div className="BannerPart">
                <img 
                  src="https://media.istockphoto.com/id/1090820484/photo/singer-singing-silhouette.jpg?s=612x612&w=0&k=20&c=VIqPcdZ7M12jJFiO44AxT-hUSRKlNchJbwEGUC8MUIY="
                  alt={album.title} 
                  className="w-[268px] h-[268px] object-cover p-5 rounded-lg" 
                    />
                    <div className="BannerText">
                      <button 
                        onClick={() => navigate('/album')}
                        className="text-white hover:text-gray-300 mb-2 flex items-center gap-2"
                      >
                        <ArrowLeftOutlined /> Quay lại
                      </button>
                      <SectionTitle title1={album.title} title2="Album" />
                      <div className="flex items-center gap-2 mb-2">
                        <UserOutlined className="text-gray-300" />
                        <span className="text-gray-300">{artist?.name || 'Unknown Artist'}</span>
                      </div>
                      <p className="btext">
                        {albumSongs.length} bài hát • {formatViews(totalViews)} lượt nghe • {formatTotalDuration(totalDuration)}
                      </p>
                      <div className="flex gap-4 mt-4">
                        <button 
                          className="px-6 py-3 rounded-full font-semibold text-white transition-colors"
                          style={{ background: 'linear-gradient(135deg, #EE10B0, #EE10B0)' }}
                          onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #d60e9e, #d60e9e)'}
                          onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #EE10B0, #EE10B0)'}
                          onClick={() => playAlbum(albumSongs)}
                          disabled={albumSongs.length === 0}
                        >
                          <PlayCircleOutlined /> Phát album
                        </button>
                        
                        <button 
                          className="px-6 py-3 rounded-full font-semibold text-white transition-colors"
                          style={{ background: 'linear-gradient(135deg, #EE10B0, #EE10B0)' }}
                          onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #d60e9e, #d60e9e)'}
                          onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #EE10B0, #EE10B0)'}
                          onClick={() => toast.info('Chức năng thêm album vào yêu thích sẽ được cập nhật!')}
                        >
                          <HeartOutlined /> Thích
                        </button>
                        
                        <button 
                          className="px-6 py-3 rounded-full font-semibold text-white transition-colors"
                          style={{ background: 'linear-gradient(135deg, #EE10B0, #EE10B0)' }}
                          onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #d60e9e, #d60e9e)'}
                          onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #EE10B0, #EE10B0)'}
                          onClick={() => toast.info('Chức năng chia sẻ sẽ được cập nhật!')}
                        >
                          <ShareAltOutlined /> Chia sẻ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Songs List */}
              <div className="mt-8 px-6">
                <h3 className="text-white text-xl font-semibold mb-4">Danh sách bài hát</h3>
                
                {albumSongs.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'white', padding: '50px' }}>
                    <SoundOutlined className="text-6xl mb-4" />
                    <h3>Album này chưa có bài hát nào</h3>
                    <p>Hãy quay lại sau để cập nhật!</p>
                  </div>
                ) : (
                  <div className="bg-gray-800/20 rounded-lg overflow-hidden">
                    <table className="table-auto w-full text-left text-white">
                      <thead className="bg-gray-700/30">
                        <tr className="text-gray-300/80">
                          <th className="pl-4 py-3">#</th>
                          <th className="py-3">Bài hát</th>
                          <th className="py-3">Ngày phát hành</th>
                          <th className="py-3">Thời lượng</th>
                          <th className="py-3">Lượt nghe</th>
                          <th className="py-3 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/30">
                        {albumSongs.map((song, index) => {
                          const isFav = isFavorite(song.id);
                          
                          return (
                            <tr 
                              key={song.id || index} 
                              className="hover:bg-gray-700/20 transition-colors group"
                            >
                              <td className="pl-4 py-3 text-gray-300">{index + 1}</td>
                              
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={song.img || song.cover_url || song.cover || album.img || "https://via.placeholder.com/48?text=Song"} 
                                    alt={song.title} 
                                    className="w-12 h-12 rounded object-cover" 
                                  />
                                  <div>
                                    <div className="font-semibold text-white hover:underline cursor-pointer">
                                      {song.title}
                                    </div>
                                    <div className="text-sm text-gray-400">{artist?.name || 'Unknown Artist'}</div>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="py-3 text-gray-300">
                                {song.release_date || song.releaseYear || '-'}
                              </td>
                              
                              <td className="py-3 text-gray-300">
                                {formatDuration(song.duration)}
                              </td>
                              
                              <td className="py-3 text-gray-300">
                                {formatViews(song.viewCount)}
                              </td>
                              
                              <td className="py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => playSong(song)}
                                    // style={{ background: 'linear-gradient(135deg, #EE10B0, #EE10B0)', color: 'white' }}
                                    className="hover:opacity-80 transition-opacity p-1 rounded"
                                    title="Phát bài hát"
                                  >
                                    <PlayCircleOutlined style={{ fontSize: '1.25rem' }} />
                                  </button>
                                  
                                  <button
                                    onClick={() => toggleFavorite(song.id)}
                                    className={`transition-colors p-1 ${isFav ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                    title={isFav ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                                  >
                                    {isFav ? 
                                      <HeartFilled style={{ fontSize: '1.25rem' }} /> : 
                                      <HeartOutlined style={{ fontSize: '1.25rem' }} />
                                    }
                                  </button>
                                  
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isLoggedIn) {
                                          navigate('/login', { state: { from: location } });
                                          return;
                                        }
                                        setSelectedSongId(song.id);
                                        setShowPlaylistPopup(true);
                                      }}
                                      className="text-gray-400 hover:text-white transition-colors p-1"
                                      title="Thêm vào playlist"
                                      data-song-id={song.id}
                                    >
                                      <PlusOutlined style={{ fontSize: '1.25rem' }} />
                                    </button>

                                    {/* Playlist Dropdown - Disabled */}
                                    {false && (
                                      <>
                                        {/* Overlay to close dropdown */}
                                        <div 
                                          style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            zIndex: 998
                                          }}
                                          onClick={() => {
                                            setShowPlaylistPopup(false);
                                            setShowCreatePlaylist(false);
                                            setNewPlaylistName('');
                                          }}
                                        />
                                        
                                        {/* Dropdown Menu */}
                                        <div 
                                          style={{
                                            position: 'fixed',
                                            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                                            border: '1px solid rgba(238, 16, 176, 0.3)',
                                            borderRadius: '12px',
                                            minWidth: '280px',
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(238, 16, 176, 0.1)',
                                            zIndex: 9999,
                                            backdropFilter: 'blur(20px)'
                                          }}
                                          ref={(dropdown) => {
                                            if (dropdown) {
                                              // Get button position
                                              const button = document.querySelector(`[data-song-id="${song.id}"]`);
                                              if (button) {
                                                const rect = button.getBoundingClientRect();
                                                const viewportHeight = window.innerHeight;
                                                const viewportWidth = window.innerWidth;
                                                const dropdownWidth = 280;
                                                const maxDropdownHeight = 400;
                                                
                                                // Calculate available space
                                                const spaceBelow = viewportHeight - rect.bottom;
                                                const spaceAbove = rect.top;
                                                const spaceRight = viewportWidth - rect.right;
                                                const spaceLeft = rect.left;
                                                
                                                // Determine optimal positioning
                                                let top, left;
                                                let actualHeight = Math.min(maxDropdownHeight, Math.max(spaceBelow, spaceAbove) - 40);
                                                
                                                // Vertical positioning - xuống dưới 200px
                                                top = rect.bottom + 200;
                                                
                                                // Horizontal positioning - lùi vào trái 200px
                                                left = rect.left - 200;
                                                
                                                // Final boundary checks with safe margins
                                                const margin = 16;
                                                top = Math.max(margin, Math.min(top, viewportHeight - actualHeight - margin));
                                                left = Math.max(margin, Math.min(left, viewportWidth - dropdownWidth - margin));
                                                
                                                // Apply positioning
                                                dropdown.style.top = `${top}px`;
                                                dropdown.style.left = `${left}px`;
                                                dropdown.style.maxHeight = `${actualHeight}px`;
                                              }
                                            }
                                          }}>
                                          <div style={{ padding: '12px 0' }}>
                                            {/* Header */}
                                            <div style={{
                                              padding: '0 16px 12px 16px',
                                              borderBottom: '1px solid rgba(238, 16, 176, 0.2)'
                                            }}>
                                              <h4 style={{
                                                color: 'white',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                margin: 0,
                                                textAlign: 'center'
                                              }}>
                                                🎵 Thêm vào playlist
                                              </h4>
                                            </div>

                                            {/* Create New Playlist Option */}
                                            <div
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setShowCreatePlaylist(!showCreatePlaylist);
                                              }}
                                              style={{
                                                padding: '12px 16px',
                                                cursor: 'pointer',
                                                color: '#EE10B0',
                                                fontWeight: '600',
                                                borderBottom: '1px solid rgba(238, 16, 176, 0.2)',
                                                transition: 'all 0.2s ease',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                              }}
                                              onMouseEnter={(e) => {
                                                e.target.style.background = 'rgba(238, 16, 176, 0.15)';
                                                e.target.style.transform = 'translateX(4px)';
                                              }}
                                              onMouseLeave={(e) => {
                                                e.target.style.background = 'transparent';
                                                e.target.style.transform = 'translateX(0)';
                                              }}
                                            >
                                              <PlusOutlined style={{ fontSize: '12px' }} />
                                              Tạo playlist mới
                                            </div>

                                            {/* Create Playlist Form */}
                                            {showCreatePlaylist && (
                                              <div style={{ 
                                                padding: '16px', 
                                                borderBottom: '1px solid rgba(238, 16, 176, 0.2)',
                                                background: 'rgba(238, 16, 176, 0.05)'
                                              }}>
                                                <input
                                                  type="text"
                                                  placeholder="Nhập tên playlist..."
                                                  value={newPlaylistName}
                                                  onChange={(e) => setNewPlaylistName(e.target.value)}
                                                  onKeyPress={(e) => {
                                                    e.stopPropagation();
                                                    if (e.key === 'Enter') {
                                                      createNewPlaylist(song.id);
                                                    }
                                                  }}
                                                  style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    border: '1px solid rgba(238, 16, 176, 0.3)',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    marginBottom: '12px',
                                                    outline: 'none',
                                                    transition: 'all 0.3s ease'
                                                  }}
                                                  onFocus={(e) => {
                                                    e.target.style.borderColor = '#EE10B0';
                                                    e.target.style.boxShadow = '0 0 0 2px rgba(238, 16, 176, 0.2)';
                                                  }}
                                                  onBlur={(e) => {
                                                    e.target.style.borderColor = 'rgba(238, 16, 176, 0.3)';
                                                    e.target.style.boxShadow = 'none';
                                                  }}
                                                  autoFocus
                                                />
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      createNewPlaylist(song.id);
                                                    }}
                                                    style={{
                                                      flex: 1,
                                                      padding: '8px 16px',
                                                      background: 'linear-gradient(135deg, #EE10B0 0%, #ff3dc4 100%)',
                                                      border: 'none',
                                                      borderRadius: '8px',
                                                      color: 'white',
                                                      fontSize: '13px',
                                                      fontWeight: '600',
                                                      cursor: 'pointer',
                                                      transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                      e.target.style.transform = 'translateY(-2px)';
                                                      e.target.style.boxShadow = '0 4px 15px rgba(238, 16, 176, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                      e.target.style.transform = 'translateY(0)';
                                                      e.target.style.boxShadow = 'none';
                                                    }}
                                                  >
                                                    ✨ Tạo
                                                  </button>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setShowCreatePlaylist(false);
                                                      setNewPlaylistName('');
                                                    }}
                                                    style={{
                                                      flex: 1,
                                                      padding: '8px 16px',
                                                      background: 'rgba(255, 255, 255, 0.1)',
                                                      border: '1px solid rgba(255, 255, 255, 0.2)',
                                                      borderRadius: '8px',
                                                      color: 'white',
                                                      fontSize: '13px',
                                                      fontWeight: '500',
                                                      cursor: 'pointer',
                                                      transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                      e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                                    }}
                                                  >
                                                    Hủy
                                                  </button>
                                                </div>
                                              </div>
                                            )}

                                            {/* Existing Playlists */}
                                            {userPlaylists.length === 0 ? (
                                              <div style={{ 
                                                padding: '24px', 
                                                textAlign: 'center', 
                                                color: '#999',
                                                fontSize: '14px'
                                              }}>
                                                <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>🎵</div>
                                                Chưa có playlist nào
                                              </div>
                                            ) : (
                                              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                {userPlaylists.map((playlist) => {
                                                  const isInPlaylist = Array.isArray(playlist.songs) && playlist.songs.includes(song.id);
                                                  const songCount = Array.isArray(playlist.songs) ? playlist.songs.length : 0;
                                                  return (
                                                    <div
                                                      key={playlist.id}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!isInPlaylist) {
                                                          addToPlaylist(song.id, playlist.id);
                                                          setShowPlaylistPopup(false);
                                                        }
                                                      }}
                                                      style={{
                                                        padding: '12px 16px',
                                                        cursor: isInPlaylist ? 'default' : 'pointer',
                                                        color: isInPlaylist ? '#999' : 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        fontSize: '14px',
                                                        transition: 'all 0.2s ease',
                                                        opacity: isInPlaylist ? 0.6 : 1,
                                                        borderLeft: isInPlaylist ? '3px solid #EE10B0' : '3px solid transparent'
                                                      }}
                                                      onMouseEnter={(e) => {
                                                        if (!isInPlaylist) {
                                                          e.target.style.background = 'rgba(255,255,255,0.1)';
                                                          e.target.style.transform = 'translateX(4px)';
                                                          e.target.style.borderLeft = '3px solid rgba(238, 16, 176, 0.5)';
                                                        }
                                                      }}
                                                      onMouseLeave={(e) => {
                                                        e.target.style.background = 'transparent';
                                                        e.target.style.transform = 'translateX(0)';
                                                        if (!isInPlaylist) {
                                                          e.target.style.borderLeft = '3px solid transparent';
                                                        }
                                                      }}
                                                    >
                                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <span style={{ fontWeight: '500' }}>{playlist.name}</span>
                                                        <span style={{ 
                                                          fontSize: '12px', 
                                                          color: isInPlaylist ? '#666' : '#aaa',
                                                          fontWeight: '400'
                                                        }}>
                                                          {songCount} bài hát
                                                        </span>
                                                      </div>
                                                      {isInPlaylist && (
                                                        <CheckOutlined style={{ 
                                                          color: '#EE10B0', 
                                                          fontSize: '16px'
                                                        }} />
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Album Stats */}
              <div className="mt-8 px-6 pb-6">
                <h3 className="text-white text-xl font-semibold mb-4">Thông tin album</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <SoundOutlined className="text-2xl text-[#1db954] mb-2" />
                    <h4 className="text-xl font-bold text-white">{albumSongs.length}</h4>
                    <p className="text-gray-400 text-sm">Bài hát</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <PlayCircleOutlined className="text-2xl text-[#1db954] mb-2" />
                    <h4 className="text-xl font-bold text-white">{formatViews(totalViews)}</h4>
                    <p className="text-gray-400 text-sm">Lượt nghe</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <CalendarOutlined className="text-2xl text-[#1db954] mb-2" />
                    <h4 className="text-xl font-bold text-white">{formatTotalDuration(totalDuration)}</h4>
                    <p className="text-gray-400 text-sm">Thời lượng</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <UserOutlined className="text-2xl text-[#1db954] mb-2" />
                    <h4 className="text-xl font-bold text-white">
                      {albumSongs.length > 0 ? formatViews(Math.round(totalViews / albumSongs.length)) : '0'}
                    </h4>
                    <p className="text-gray-400 text-sm">TB/bài hát</p>
                  </div>
                </div>

                {/* Artist Info */}
                {artist && (
                  <div className="mt-6 bg-gray-800/30 rounded-lg p-4">
                    <h4 className="text-white text-lg font-semibold mb-3">Về nghệ sĩ</h4>
                    <div className="flex items-center gap-4">
                      <img 
                        src={artist.img || "https://via.placeholder.com/80x80?text=Artist"}
                        alt={artist.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div>
                        <h5 className="text-white font-semibold text-lg">{artist.name}</h5>
                        <p className="text-gray-400 text-sm">Nghệ sĩ</p>
                        <button 
                          className="px-4 py-2 rounded-lg text-white font-semibold transition-colors text-sm"
                          style={{ background: 'linear-gradient(135deg, #EE10B0, #EE10B0)' }}
                          onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #d60e9e, #d60e9e)'}
                          onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #EE10B0, #EE10B0)'}
                          onClick={() => navigate(`/artist/${artist.id}`)}
                        >
                          Xem thêm
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Playlist Popup */}
          {showPlaylistPopup && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                padding: '20px',
                boxSizing: 'border-box',
                animation: 'fadeIn 0.3s ease-out'
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowPlaylistPopup(false);
                  setShowCreatePlaylist(false);
                  setNewPlaylistName('');
                }
              }}
            >
              <style>
                {`
                  @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                  @keyframes slideIn {
                    from { 
                      opacity: 0; 
                      transform: translateY(-50px) scale(0.9); 
                    }
                    to { 
                      opacity: 1; 
                      transform: translateY(0) scale(1); 
                    }
                  }
                `}
              </style>
              <div style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                border: '1px solid rgba(238, 16, 176, 0.3)',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '450px',
                maxHeight: '90vh',
                padding: '28px',
                boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(238, 16, 176, 0.1)',
                backdropFilter: 'blur(25px)',
                transform: 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflowY: 'auto',
                position: 'relative',
                animation: 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    🎵 Thêm vào playlist
                  </h3>
                  <button
                    onClick={() => {
                      setShowPlaylistPopup(false);
                      setShowCreatePlaylist(false);
                      setNewPlaylistName('');
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: 'white',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(238, 16, 176, 0.2)';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Create New Playlist */}
                <div
                  onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    color: '#EE10B0',
                    fontWeight: '600',
                    borderBottom: '1px solid rgba(238, 16, 176, 0.2)',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(238, 16, 176, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  <PlusOutlined style={{ fontSize: '12px' }} />
                  Tạo playlist mới
                </div>

                {/* Create Playlist Form */}
                {showCreatePlaylist && (
                  <div style={{ 
                    padding: '16px', 
                    marginBottom: '16px',
                    borderRadius: '8px',
                    background: 'rgba(238, 16, 176, 0.05)',
                    border: '1px solid rgba(238, 16, 176, 0.2)'
                  }}>
                    <input
                      type="text"
                      placeholder="Nhập tên playlist..."
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          createNewPlaylist(selectedSongId);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(238, 16, 176, 0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        marginBottom: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => createNewPlaylist(selectedSongId)}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: 'linear-gradient(135deg, #EE10B0 0%, #ff3dc4 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Tạo
                      </button>
                      <button
                        onClick={() => {
                          setShowCreatePlaylist(false);
                          setNewPlaylistName('');
                        }}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Playlist List */}
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {userPlaylists.length === 0 ? (
                    <div style={{ 
                      padding: '40px 20px', 
                      textAlign: 'center', 
                      color: '#999',
                      fontSize: '14px'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>🎵</div>
                      <p>Chưa có playlist nào</p>
                      <p style={{ fontSize: '12px', opacity: 0.7 }}>Tạo playlist đầu tiên của bạn!</p>
                    </div>
                  ) : (
                    userPlaylists.map((playlist) => {
                      const isInPlaylist = Array.isArray(playlist.songs) && playlist.songs.includes(selectedSongId);
                      const songCount = Array.isArray(playlist.songs) ? playlist.songs.length : 0;
                      return (
                        <div
                          key={playlist.id}
                          onClick={() => {
                            if (!isInPlaylist) {
                              addToPlaylist(selectedSongId, playlist.id);
                            }
                          }}
                          style={{
                            padding: '12px 16px',
                            cursor: isInPlaylist ? 'default' : 'pointer',
                            color: isInPlaylist ? '#999' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '14px',
                            transition: 'background 0.2s ease',
                            borderRadius: '8px',
                            marginBottom: '4px',
                            border: isInPlaylist ? '1px solid rgba(238, 16, 176, 0.3)' : '1px solid transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!isInPlaylist) {
                              e.target.style.background = 'rgba(238, 16, 176, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '2px' }}>{playlist.name}</div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>{songCount} bài hát</div>
                          </div>
                          {isInPlaylist && (
                            <div style={{ color: '#EE10B0', fontSize: '16px' }}>✓</div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

      <Footer />
    </>
  );
};

export default AlbumDetailPage;