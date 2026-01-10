import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../components/common/AppContext";
import {
  PlayCircleOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import useAuth from "../hooks/useAuth";
import Footer from "../components/layout/Footer";
import TopBar from "../components/layout/TopBar";
import SectionTitle from "../components/common/SectionTitle";

import "../style/Layout.css";
import "../style/VA.css";

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [songsData, setSongsData] = useState([]); // ← Thêm state để lưu thông tin bài hát
  const [artistsData, setArtistsData] = useState([]); // ← Thêm state để lưu thông tin artists
  const [genresData, setGenresData] = useState([]); // ← Thêm state để lưu thông tin genres
  const [loading, setLoading] = useState(true);
  const { playSong } = useContext(AppContext);

  // Helper function to get artist info from artistsData
  const getArtistInfo = (artistId, fallbackName) => {
    if (!artistId) return { name: fallbackName || 'Unknown Artist', img: null };
    
    const artist = artistsData.find(a => a.id === artistId);
    if (artist) {
      return {
        name: artist.name,
        img: artist.img,
        id: artist.id
      };
    }
    
    return { name: fallbackName || 'Unknown Artist', img: null };
  };

  // Helper function to get genre info from genresData
  const getGenreInfo = (genreId, fallbackName) => {
    if (!genreId) return { title: fallbackName || 'Unknown', img: null };
    
    const genre = genresData.find(g => g.id === genreId);
    if (genre) {
      return {
        title: genre.title,
        img: genre.img,
        id: genre.id
      };
    }
    
    return { title: fallbackName || 'Unknown', img: null };
  };

  // Helper function to format view count
  const formatViews = (views) => {
    if (!views || views === 0) return '0';
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  // Helper function to format duration
  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration;
    }
    // If duration is in seconds
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 🎵 Fetch thông tin bài hát từ songsList
  const fetchSongsData = async (songIds) => {
    try {
      const response = await fetch('http://localhost:4000/songsList');
      if (!response.ok) throw new Error('Failed to fetch songs');
      
      const allSongs = await response.json();
      console.log('All songs from API:', allSongs);
      
      // Filter songs based on IDs in playlist
      const playlistSongs = songIds.map(songId => {
        const song = allSongs.find(s => s.id === songId);
        if (!song) {
          console.warn(`Song with ID ${songId} not found in songsList`);
          return {
            id: songId,
            title: `Unknown Song (${songId})`,
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            genre: 'Unknown',
            img: 'https://via.placeholder.com/300?text=Song'
          };
        }
        return song;
      });
      
      console.log('Playlist songs data:', playlistSongs);
      setSongsData(playlistSongs);
    } catch (error) {
      console.error('Error fetching songs data:', error);
      // Fallback: create placeholder objects for song IDs
      const placeholderSongs = songIds.map(songId => ({
        id: songId,
        title: `Song ${songId}`,
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        genre: 'Unknown',
        img: 'https://via.placeholder.com/300?text=Song'
      }));
      setSongsData(placeholderSongs);
    }
  };

  // 🎤 Fetch thông tin artists từ /artists
  const fetchArtistsData = async () => {
    try {
      const response = await fetch('http://localhost:4000/artists');
      if (!response.ok) throw new Error('Failed to fetch artists');
      
      const allArtists = await response.json();
      console.log('All artists from API:', allArtists);
      setArtistsData(allArtists);
    } catch (error) {
      console.error('Error fetching artists data:', error);
      setArtistsData([]);
    }
  };

  // 🎭 Fetch thông tin genres từ /genres
  const fetchGenresData = async () => {
    try {
      const response = await fetch('http://localhost:4000/genres');
      if (!response.ok) throw new Error('Failed to fetch genres');
      
      const allGenres = await response.json();
      console.log('All genres from API:', allGenres);
      setGenresData(allGenres);
    } catch (error) {
      console.error('Error fetching genres data:', error);
      setGenresData([]);
    }
  };

  useEffect(() => {
    const loadPlaylistData = async () => {
      if (user && user.playlists) {
        const userPlaylist = user.playlists.find(p => p.id === id);
        setPlaylist(userPlaylist || null);
        
        // Fetch artists and genres data first
        await Promise.all([
          fetchArtistsData(),
          fetchGenresData()
        ]);
        
        // Then fetch songs data if playlist exists and has songs
        if (userPlaylist && userPlaylist.songs && userPlaylist.songs.length > 0) {
          console.log('Playlist found with songs:', userPlaylist.songs);
          await fetchSongsData(userPlaylist.songs);
        } else {
          setSongsData([]);
        }
      }
      setLoading(false);
    };

    loadPlaylistData();
  }, [id, user]);

  const removeSongFromPlaylist = async (songId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài hát này khỏi playlist?')) return;

    try {
      const updatedSongs = playlist.songs.filter(id => id !== songId);
      const updatedPlaylist = { ...playlist, songs: updatedSongs };
      const updatedPlaylists = user.playlists.map(p =>
        p.id === playlist.id ? updatedPlaylist : p
      );
      const updatedUser = { ...user, playlists: updatedPlaylists };

      await fetch(`http://localhost:4000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlists: updatedPlaylists })
      });

      login(updatedUser);
      setPlaylist(updatedPlaylist);
      
      // Update songs data
      const updatedSongsData = songsData.filter(song => song.id !== songId);
      setSongsData(updatedSongsData);
      
      window.dispatchEvent(new Event('userUpdated'));
      toast.success('Đã xóa bài hát khỏi playlist!');
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      toast.error('Có lỗi xảy ra khi xóa bài hát!');
    }
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="content">
          <div style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>
            <h2>Đang tải playlist và thông tin bài hát...</h2>
            <div className="text-sm text-gray-400 mt-2">
              Đang kết nối đến cơ sở dữ liệu...
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Đang tải thông tin bài hát, nghệ sĩ và thể loại...
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!playlist) {
    return (
      <>
        <TopBar />
        <div className="content">
          <div style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>
            <h2>Không tìm thấy playlist</h2>
            <button
              onClick={() => navigate('/playlist')}
              className="bg-[#1db954] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1ed760] transition-colors mt-4"
            >
              Quay lại danh sách playlist
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopBar />
      <div className="content" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}>
        <div className="bluebox">
          <div className="TopPart bg-gradient-to-r from-blue-400 to-gray-600 rounded-lg">
            <div className="top2">
              <div className="BannerPart">
                <div className="w-[268px] h-[268px] bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-5 flex items-center justify-center relative overflow-hidden">
                  {songsData.length > 0 && songsData[0].img ? (
                    <div className="absolute inset-0">
                      <img 
                        src={songsData[0].img || songsData[0].cover_url}
                        alt="Playlist cover"
                        className="w-full h-full object-cover opacity-30"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : null}
                  <div className="relative z-10 text-center">
                    <PlayCircleOutlined className="text-6xl text-white mb-2" />
                    <div className="text-white text-sm font-medium">
                      {songsData.length} Bài hát
                    </div>
                  </div>
                </div>
                <div className="BannerText">
                  <button
                    onClick={() => navigate('/playlist')}
                    className="text-white hover:text-gray-300 mb-2 flex items-center gap-2"
                  >
                    <ArrowLeftOutlined /> Quay lại
                  </button>
                  <SectionTitle title1={playlist.name} title2="Playlist" />
                  <p className="btext">Playlist cá nhân của bạn</p>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      🎵 {songsData.length} bài hát
                    </span>
                    {songsData.length > 0 && (
                      <>
                        <span className="flex items-center gap-1">
                          🎤 {new Set(songsData.map(song => song.artistId || song.artist).filter(Boolean)).size} nghệ sĩ
                        </span>
                        <span className="flex items-center gap-1">
                          🎭 {new Set(songsData.map(song => song.genreId || song.genre).filter(Boolean)).size} thể loại
                        </span>
                        <span className="flex items-center gap-1">
                          ⏱️ {Math.round(songsData.reduce((total, song) => {
                            const duration = song.duration;
                            if (typeof duration === 'string' && duration.includes(':')) {
                              const [min, sec] = duration.split(':').map(Number);
                              return total + (min * 60 + sec);
                            }
                            return total + (duration || 180); // Default 3 minutes
                          }, 0) / 60)} phút
                        </span>
                        <span className="flex items-center gap-1">
                          👁️ {formatViews(songsData.reduce((total, song) => total + (song.views || song.viewCount || 0), 0))} lượt xem
                        </span>
                      </>
                    )}
                    {playlist.createdAt && (
                      <span className="flex items-center gap-1">
                        📅 {new Date(playlist.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="playbutton">
                  <button
                    className="bg-[#1db954] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1ed760] transition-colors mr-4"
                    onClick={() => {
                      if (songsData.length > 0) {
                        const firstSong = songsData[0];
                        playSong(firstSong, songsData);
                        toast.success(`Đang phát playlist: ${playlist.name}`);
                      } else {
                        toast.info('Playlist này chưa có bài hát nào!');
                      }
                    }}
                    disabled={songsData.length === 0}
                  >
                    <PlayCircleOutlined style={{ marginRight: 6 }} />
                    Phát playlist
                  </button>

                  <button
                    className="bg-gray-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-500 transition-colors"
                    onClick={() => toast.info('Chức năng chỉnh sửa playlist sẽ được cập nhật!')}
                  >
                    <EditOutlined style={{ marginRight: 6 }} />
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 px-6">
            {songsData.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'white', padding: '50px' }}>
                <PlusOutlined className="text-6xl mb-4" />
                <h3>Playlist này chưa có bài hát nào</h3>
                <p>Hãy thêm những bài hát yêu thích vào playlist!</p>
                <button
                  className="bg-[#1db954] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1ed760] transition-colors mt-4"
                  onClick={() => navigate('/discover')}
                >
                  Khám phá nhạc mới
                </button>
              </div>
            ) : (
              <div className="bg-gray-800/20 rounded-lg overflow-hidden">
                <table className="table-auto w-full text-left text-white">
                  <thead className="bg-gray-700/30">
                    <tr className="text-gray-300/80">
                      <th className="pl-4 py-3">#</th>
                      <th className="py-3">Bài hát</th>
                      <th className="py-3">Nghệ sĩ</th>
                      <th className="py-3">Album</th>
                      <th className="py-3">Thể loại</th>
                      <th className="py-3">Thời lượng</th>
                      <th className="py-3">Lượt xem</th>
                      <th className="py-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {songsData.map((song, index) => {
                      const artistInfo = getArtistInfo(song.artistId, song.artist);
                      const genreInfo = getGenreInfo(song.genreId, song.genre);
                      
                      return (
                        <tr key={song.id} className="hover:bg-gray-700/20 transition-colors group">
                          <td className="pl-4 py-3 text-gray-300 font-medium">{index + 1}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={song.img || song.cover_url || 'https://via.placeholder.com/50?text=Song'} 
                                alt={song.title}
                                className="w-12 h-12 rounded object-cover shadow-md"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/50?text=Song';
                                }}
                              />
                              <div>
                                <div className="font-semibold text-white text-sm leading-tight">
                                  {song.title}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {song.release_date ? 
                                    new Date(song.release_date).getFullYear() : 
                                    song.releaseYear || 'Unknown Year'
                                  }
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-gray-300 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="truncate max-w-[100px]" title={artistInfo.name}>
                                {artistInfo.name}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-gray-400 text-sm">
                            <div className="truncate max-w-[100px]" title={song.album || 'Unknown Album'}>
                              {song.album || 'Unknown Album'}
                            </div>
                          </td>
                          <td className="py-3 text-gray-400 text-sm">
                            <div className="flex items-center gap-2">                              
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs text-gray-300">
                                {genreInfo.title}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-gray-400 text-sm font-mono">
                            {formatDuration(song.duration)}
                          </td>
                          <td className="py-3 text-gray-400 text-sm">
                            <div className="flex items-center gap-1">
                              {formatViews(song.views || song.viewCount || 0)}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  playSong(song, songsData);
                                  toast.success(`Đang phát: ${song.title}`);
                                }}
                                className="text-[#1db954] hover:text-[#1ed760] transition-colors p-2 rounded-full hover:bg-gray-700/20"
                                title="Phát bài hát"
                              >
                                <PlayCircleOutlined style={{ fontSize: '1.25rem' }} />
                              </button>
                              <button
                                onClick={() => removeSongFromPlaylist(song.id)}
                                className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-gray-700/20"
                                title="Xóa khỏi playlist"
                              >
                                <DeleteOutlined style={{ fontSize: '1.25rem' }} />
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
          </div>
        </div>
      <Footer />
    </>
  );
};

export default PlaylistDetail;
