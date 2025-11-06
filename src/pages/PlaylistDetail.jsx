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
  const { setCurrentSong } = useContext(AppContext);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find playlist in user's playlists instead of fetching from separate endpoint
    if (user && user.playlists) {
      const userPlaylist = user.playlists.find(p => p.id === id);
      setPlaylist(userPlaylist || null);
    }
    setLoading(false);
  }, [id, user]);

  const playSong = (song) => {
    setCurrentSong(song);
    toast.success(`Đang phát: ${song.title}`);
  };

  const removeSongFromPlaylist = async (songId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài hát này khỏi playlist?')) {
      return;
    }

    try {
      const updatedSongs = playlist.songs.filter(song => 
        (typeof song === 'string' ? song : song.id) !== songId
      );

      const updatedPlaylist = { ...playlist, songs: updatedSongs };
      
      // Update user's playlists
      const updatedPlaylists = user.playlists.map(p => 
        p.id === playlist.id ? updatedPlaylist : p
      );

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

      // Update local state
      login(updatedUser);
      setPlaylist(updatedPlaylist);
      
      try { 
        window.dispatchEvent(new Event('userUpdated')); 
      } catch (err) { 
        /* ignore */ 
      }

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
            <h2>Đang tải playlist...</h2>
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
                    <div className="w-[268px] h-[268px] bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-5 flex items-center justify-center">
                      <PlayCircleOutlined className="text-8xl text-white" />
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
                      <p className="bts">{playlist.songs?.length || 0} bài hát</p>
                    </div>
                    <div className="playbutton">
                      <button 
                        className="bg-[#1db954] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1ed760] transition-colors mr-4"
                        onClick={() => {
                          if (playlist.songs.length > 0) {
                            const firstSong = playlist.songs[0];
                            playSong(firstSong);
                          } else {
                            toast.info('Playlist này chưa có bài hát nào!');
                          }
                        }}
                        disabled={playlist.songs.length === 0}
                      >
                        <PlayCircleOutlined /> Phát tất cả
                      </button>
                      
                      <button 
                        className="bg-gray-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-500 transition-colors"
                        onClick={() => toast.info('Chức năng chỉnh sửa playlist sẽ được cập nhật!')}
                      >
                        <EditOutlined /> Chỉnh sửa
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 px-6">
                {playlist.songs.length === 0 ? (
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
                          <th className="py-3 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/30">
                        {playlist.songs.map((song, index) => {
                          const songId = typeof song === 'string' ? song : song.id;
                          const songTitle = typeof song === 'string' ? song : song.title;
                          const songArtist = typeof song === 'string' ? 'Unknown' : song.artist;
                          
                          return (
                            <tr 
                              key={songId || index} 
                              className="hover:bg-gray-700/20 transition-colors group"
                            >
                              <td className="pl-4 py-3 text-gray-300">{index + 1}</td>
                              
                              <td className="py-3">
                                <div className="font-semibold text-white">
                                  {songTitle}
                                </div>
                              </td>
                              
                              <td className="py-3 text-gray-300">
                                {songArtist}
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
                                    onClick={() => removeSongFromPlaylist(songId)}
                                    className="text-red-500 hover:text-red-400 transition-colors p-1"
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
