import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../components/common/AppContext';
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
  ArrowLeftOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';

import Dashboard from '../components/layout/Dashboard';
import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';
import SectionTitle from '../components/common/SectionTitle';
import data from '../routes/db.json';

import '../style/Layout.css';
import '../style/VA.css';

const AlbumDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setCurrentSong } = useContext(AppContext);
  const { user, login, isLoggedIn } = useAuth();
  
  const [album, setAlbum] = useState(null);
  const [albumSongs, setAlbumSongs] = useState([]);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Get favorites from user
    if (user && Array.isArray(user.favorites)) {
      setFavorites(user.favorites);
    }
  }, [user]);

  useEffect(() => {
    // If album data is passed through navigation state
    if (location.state?.album && location.state?.songs) {
      setAlbum(location.state.album);
      setAlbumSongs(location.state.songs);
      
      // Find artist info
      const artists = data.artists || [];
      const foundArtist = artists.find(a => a.id === location.state.album.artistId);
      setArtist(foundArtist);
      
      setLoading(false);
      return;
    }

    // Otherwise, find album and songs from data
    const albums = data.albums || [];
    const artists = data.artists || [];
    const songs = data.songs || [];
    const songsList = data.songsList || [];
    const allSongs = [...songs, ...songsList];

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

    setLoading(false);
  }, [id, location.state, navigate]);

  const playSong = (song) => {
    setCurrentSong(song);
    toast.success(`Đang phát: ${song.title}`);
  };

  const playAlbum = () => {
    if (albumSongs.length > 0) {
      playSong(albumSongs[0]);
    }
  };

  const toggleFavorite = async (songId) => {
    if (!isLoggedIn) {
      toast.error('Bạn cần đăng nhập để thêm vào yêu thích!');
      return;
    }

    const isFav = favorites.includes(songId);
    const updated = isFav ? favorites.filter(id => id !== songId) : [...favorites, songId];
    const prev = favorites;
    
    // Optimistic update
    setFavorites(updated);

    // Update user
    const updatedUser = { ...user, favorites: updated };
    login(updatedUser);

    try {
      window.dispatchEvent(new Event('userUpdated'));
    } catch (err) {
      /* ignore */
    }

    // Update backend
    try {
      const res = await fetch(`http://localhost:4000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites: updated }),
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      toast.success(isFav ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
    } catch (err) {
      // Rollback
      setFavorites(prev);
      const rollbackUser = { ...user, favorites: prev };
      login(rollbackUser);
      
      try {
        window.dispatchEvent(new Event('userUpdated'));
      } catch (e) {
        /* ignore */
      }
      
      toast.error('Không thể cập nhật yêu thích. Vui lòng thử lại.');
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || '0';
  };

  const formatDuration = (duration) => {
    if (!duration) return '--:--';
    if (duration.includes(':')) return duration;
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="body">
        <div style={{ display: 'flex', width: '100%' }}>
          <Dashboard />
          <div className="container">
            <TopBar />
            <div className="content">
              <div style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>
                <h2>Đang tải thông tin album...</h2>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="body">
        <div style={{ display: 'flex', width: '100%' }}>
          <Dashboard />
          <div className="container">
            <TopBar />
            <div className="content">
              <div style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>
                <h2>Không tìm thấy album</h2>
                <button 
                  onClick={() => navigate('/album')}
                  className="bg-[#1db954] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1ed760] transition-colors mt-4"
                >
                  Quay lại danh sách albums
                </button>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  const totalViews = albumSongs.reduce((sum, song) => sum + (song.viewCount || 0), 0);
  const totalDuration = albumSongs.reduce((sum, song) => {
    if (!song.duration) return sum;
    if (typeof song.duration === 'string' && song.duration.includes(':')) {
      const [min, sec] = song.duration.split(':').map(Number);
      return sum + (min * 60) + sec;
    }
    return sum + (parseInt(song.duration) || 0);
  }, 0);

  const formatTotalDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="body">
      <div style={{ display: 'flex', width: '100%' }}>
        <Dashboard />
        <div className="container">
          <TopBar />
          <div className="content bg-[#1171E2] rounded-lg bg-gradient-to-r from-blue-600 to-gray-700 p-0">
            <div className="bluebox">
              {/* Album Header */}
              <div className="TopPart bg-gradient-to-r from-blue-400 to-gray-600 rounded-lg">
                <div className="top2">
                  <div className="BannerPart">
                    <img 
                      src={album.img || "https://via.placeholder.com/268x268?text=Album"}
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
                          className="bg-[#1db954] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1ed760] transition-colors"
                          onClick={playAlbum}
                          disabled={albumSongs.length === 0}
                        >
                          <PlayCircleOutlined /> Phát album
                        </button>
                        
                        <button 
                          className="bg-gray-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-500 transition-colors"
                          onClick={() => toast.info('Chức năng thêm album vào yêu thích sẽ được cập nhật!')}
                        >
                          <HeartOutlined /> Thích
                        </button>
                        
                        <button 
                          className="bg-gray-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-500 transition-colors"
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
                          const isFav = favorites.includes(song.id);
                          
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
                                    className="text-[#1db954] hover:text-[#1ed760] transition-colors p-1"
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
                                    onClick={() => toast.info('Chức năng thêm vào playlist sẽ được cập nhật!')}
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
                          className="mt-2 bg-[#1db954] text-white px-4 py-2 rounded-lg hover:bg-[#1ed760] transition-colors text-sm"
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
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AlbumDetailPage;