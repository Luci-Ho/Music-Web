import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined,
  HeartOutlined,
  HeartFilled,
  PlusOutlined,
  ShareAltOutlined
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

const ArtistDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Custom hooks
  const { artists, allSongs, loading } = useDataLoader();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { formatViews } = useFormatViews();
  const { formatDuration } = useFormatDuration();
  const { playSong, playArtistSongs } = useMusicPlayer();
  const { user, isLoggedIn, login } = useAuth();
  
  const [artist, setArtist] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  
  // Playlist popup states
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  useEffect(() => {
    // If artist data is passed through navigation state
    if (location.state?.artist && location.state?.songs) {
      setArtist(location.state.artist);
      setArtistSongs(location.state.songs);
      return;
    }

    // Otherwise, find artist and songs from data
    const foundArtist = artists.find(a => a.id === id);
    if (foundArtist) {
      const artistSongsData = allSongs.filter(song => 
        song.artist === foundArtist.name || 
        song.artistId === foundArtist.id ||
        song.artist?.toLowerCase() === foundArtist.name?.toLowerCase()
      );

      setArtist(foundArtist);
      setArtistSongs(artistSongsData);
    } else {
      toast.error('Không tìm thấy nghệ sĩ!');
      navigate('/artist');
    }
  }, [id, location.state, navigate, artists, allSongs]);

  // Load user playlists
  useEffect(() => {
    if (user && user.playlists) {
      setUserPlaylists(user.playlists);
    } else {
      setUserPlaylists([]);
    }
  }, [user]);

  // Playlist functions
  const addToPlaylist = async (songId, playlistId) => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này!');
      return;
    }

    try {
      const updatedUser = { ...user };
      const playlistIndex = updatedUser.playlists.findIndex(p => p.id === playlistId);
      
      if (playlistIndex !== -1) {
        if (!updatedUser.playlists[playlistIndex].songs) {
          updatedUser.playlists[playlistIndex].songs = [];
        }
        
        if (!updatedUser.playlists[playlistIndex].songs.includes(songId)) {
          updatedUser.playlists[playlistIndex].songs.push(songId);
          
          const response = await fetch(`http://localhost:3001/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlists: updatedUser.playlists })
          });

          if (response.ok) {
            login(updatedUser);
            setShowPlaylistPopup(false);
            toast.success('Đã thêm bài hát vào playlist!');
          }
        } else {
          toast.info('Bài hát đã có trong playlist này!');
        }
      }
    } catch (err) {
      toast.error('Lỗi khi thêm vào playlist!');
    }
  };

  const createNewPlaylist = async (songId) => {
    if (!newPlaylistName.trim()) {
      toast.error('Vui lòng nhập tên playlist!');
      return;
    }

    try {
      const newPlaylist = {
        id: Date.now().toString(),
        name: newPlaylistName.trim(),
        songs: [songId],
        createdAt: new Date().toISOString()
      };

      const updatedUser = { ...user };
      if (!updatedUser.playlists) {
        updatedUser.playlists = [];
      }
      updatedUser.playlists.push(newPlaylist);

      const response = await fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlists: updatedUser.playlists })
      });

      if (response.ok) {
        login(updatedUser);
        setNewPlaylistName('');
        setShowCreatePlaylist(false);
        setShowPlaylistPopup(false);
        toast.success('Đã tạo playlist mới và thêm bài hát!');
      }
    } catch (err) {
      toast.error('Lỗi khi tạo playlist!');
    }
  };

  if (loading) {
    return <LoadingPage message="Đang tải thông tin nghệ sĩ..." />;
  }

  if (!artist) {
    return (
      <EmptyStatePage 
        title="Không tìm thấy nghệ sĩ"
        buttonText="Quay lại danh sách nghệ sĩ"
        onButtonClick={() => navigate('/artist')}
        buttonClassName="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors mt-4"
      />
    );
  }

  const totalViews = artistSongs.reduce((sum, song) => sum + (song.viewCount || 0), 0);

  return (
    <>
      <TopBar />
      <div className="content" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
          <div className="bluebox">
              {/* Artist Header */}
              <div className="TopPart bg-gradient-to-r from-blue-400 to-gray-600 rounded-lg">
                <div className="top2">
                  <div className="BannerPart">
                    <img 
                      src={artist.img || "https://via.placeholder.com/268x268?text=Artist"}
                      alt={artist.name} 
                      className="w-[268px] h-[268px] object-cover p-5 rounded-lg" 
                    />
                    <div className="BannerText">
                      <SectionTitle title1={artist.name} title2="Artist" />
                      <p className="btext">{artistSongs.length} bài hát • {formatViews(totalViews)} lượt nghe</p>
                      <div className="flex gap-4 mt-4">
                        <button 
                          className="px-6 py-3 rounded-full font-semibold text-white transition-colors"
                          style={{ background: 'linear-gradient(135deg, #EE10B0, #EE10B0)' }}
                          onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #d60e9e, #d60e9e)'}
                          onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #EE10B0, #EE10B0)'}
                          onClick={() => playArtistSongs(artistSongs)}
                          disabled={artistSongs.length === 0}
                        >
                          <PlayCircleOutlined /> Phát tất cả
                        </button>
                        
                        <button 
                          className="px-6 py-3 rounded-full font-semibold text-white transition-colors"
                          style={{ background: 'linear-gradient(135deg, #EE10B0, #EE10B0)' }}
                          onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #d60e9e, #d60e9e)'}
                          onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #EE10B0, #EE10B0)'}
                          onClick={() => toast.info('Chức năng theo dõi sẽ được cập nhật!')}
                        >
                          <HeartOutlined /> Theo dõi
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
                <h3 className="text-white text-xl font-semibold mb-4">Tất cả bài hát</h3>
                
                {artistSongs.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'white', padding: '50px' }}>
                    <h3>Nghệ sĩ này chưa có bài hát nào</h3>
                    <p>Hãy quay lại sau để cập nhật nhạc mới!</p>
                  </div>
                ) : (
                  <div className="bg-gray-800/20 rounded-lg overflow-hidden">
                    <table className="table-auto w-full text-left text-white">
                      <thead className="bg-gray-700/30">
                        <tr className="text-gray-300/80">
                          <th className="pl-4 py-3">#</th>
                          <th className="py-3">Bài hát</th>
                          <th className="py-3">Album</th>
                          <th className="py-3">Ngày phát hành</th>
                          <th className="py-3">Thời lượng</th>
                          <th className="py-3">Lượt nghe</th>
                          <th className="py-3 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/30">
                        {artistSongs.map((song, index) => {
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
                                    src={song.img || song.cover_url || song.cover || "https://via.placeholder.com/48?text=Song"} 
                                    alt={song.title} 
                                    className="w-12 h-12 rounded object-cover" 
                                  />
                                  <div>
                                    <div className="font-semibold text-white hover:underline cursor-pointer">
                                      {song.title}
                                    </div>
                                    <div className="text-sm text-gray-400">{artist.name}</div>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="py-3 text-gray-300">
                                {song.album || '-'}
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
                                  >
                                    <PlusOutlined style={{ fontSize: '1.25rem' }} />
                                  </button>
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

              {/* Artist Stats */}
              <div className="mt-8 px-6 pb-6">
                <h3 className="text-white text-xl font-semibold mb-4">Thống kê nghệ sĩ</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <h4 className="text-2xl font-bold text-green-500">{artistSongs.length}</h4>
                    <p className="text-gray-400 text-sm">Bài hát</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <h4 className="text-2xl font-bold text-green-500">{formatViews(totalViews)}</h4>
                    <p className="text-gray-400 text-sm">Lượt nghe</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <h4 className="text-2xl font-bold text-green-500">
                      {artistSongs.length > 0 ? formatViews(Math.round(totalViews / artistSongs.length)) : '0'}
                    </h4>
                    <p className="text-gray-400 text-sm">TB/bài hát</p>
                  </div>
                  
                  <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                    <h4 className="text-2xl font-bold text-green-500">
                      {artistSongs.length > 0 ? new Date(Math.max(...artistSongs.map(s => new Date(s.release_date || '2024')))).getFullYear() : '-'}
                    </h4>
                    <p className="text-gray-400 text-sm">Năm mới nhất</p>
                  </div>
                </div>
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

export default ArtistDetailPage;