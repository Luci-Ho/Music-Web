import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  PlayCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';

import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';
import SectionTitle from '../components/common/SectionTitle';
import { AppContext } from '../components/common/AppContext';

import '../style/Layout.css';
import '../style/VA.css';

const PlaylistsPage = () => {
  const { user, login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { playAll, playSong } = useContext(AppContext);


  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Load playlists from user
    if (user && user.playlists) {
      setPlaylists(user.playlists);
    }
    setLoading(false);
  }, [user, isLoggedIn, navigate]);

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error('Vui lòng nhập tên playlist!');
      return;
    }

    try {
      const newPlaylistId = `${user.id}_${Date.now()}`;
      const newPlaylist = {
        id: newPlaylistId,
        name: newPlaylistName.trim(),
        songs: [],
        createdAt: new Date().toISOString()
      };

      const updatedPlaylists = [...playlists, newPlaylist];
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
      setPlaylists(updatedPlaylists);
      setNewPlaylistName('');
      setShowCreateModal(false);

      try {
        window.dispatchEvent(new Event('userUpdated'));
      } catch (err) {
        /* ignore */
      }

      toast.success('Tạo playlist thành công!');
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Có lỗi xảy ra khi tạo playlist!');
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa playlist này?')) {
      return;
    }

    try {
      const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
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
      setPlaylists(updatedPlaylists);

      try {
        window.dispatchEvent(new Event('userUpdated'));
      } catch (err) {
        /* ignore */
      }

      toast.success('Xóa playlist thành công!');
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('Có lỗi xảy ra khi xóa playlist!');
    }
  };

  const playPlaylist = (playlist) => {
    if (playlist.songs.length === 0) {
      toast.info('Playlist này chưa có bài hát nào!');
      return;
    }
    // Here you could implement playing the first song of the playlist
    toast.info('Chức năng phát playlist sẽ được cập nhật!');
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="content">
          <div style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>
            <h2>Đang tải playlists...</h2>
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
                <img
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
                  alt="Playlists"
                  className="w-[268px] h-[268px] object-cover p-5 rounded-lg"
                />
                <div className="BannerText">
                  <SectionTitle title1="Your Playlists" title2="Music Collection" />
                  <p className="btext">Quản lý và nghe các playlist yêu thích của bạn.</p>
                  <p className="bts">{playlists.length} playlists</p>
                </div>
                <div className="playbutton">
                  <button
                    className="px-6 py-3 rounded-full font-semibold text-white transition-colors"
                    style={{ background: 'linear-gradient(135deg, #EE10B0, #EE10B0)' }}
                    onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #d60e9e, #d60e9e)'}
                    onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #EE10B0, #EE10B0)'}
                    onClick={() => setShowCreateModal(true)}
                  >
                    <PlusOutlined /> Tạo Playlist Mới
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 px-6">
            {playlists.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'white', padding: '50px' }}>
                <h3>Bạn chưa có playlist nào</h3>
                <p>Hãy tạo playlist đầu tiên để bắt đầu!</p>
                <button
                  className="px-6 py-3 rounded-full font-semibold text-white transition-colors mt-4"
                  style={{ background: 'linear-gradient(135deg, #EE10B0, #EE10B0)' }}
                  onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #d60e9e, #d60e9e)'}
                  onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #EE10B0, #EE10B0)'}
                  onClick={() => setShowCreateModal(true)}
                >
                  <PlusOutlined /> Tạo Playlist Đầu Tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="bg-gray-800/30 rounded-lg p-4 hover:bg-gray-700/40 transition-colors cursor-pointer group"
                  >
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-4 flex items-center justify-center">
                        <PlayCircleOutlined className="text-6xl text-white" />
                      </div>

                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePlaylist(playlist.id);
                          }}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          title="Xóa playlist"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-white font-semibold text-lg mb-2 truncate">
                      {playlist.name}
                    </h3>

                    <p className="text-gray-400 text-sm mb-4">
                      {playlist.songs?.length || 0} bài hát
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => playAll(playlist.songs)}

                        className="flex-1 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                        style={{ background: 'linear-gradient(135deg, #EE10B0, #EE10B0)' }}
                        onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #d60e9e, #d60e9e)'}
                        onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #EE10B0, #EE10B0)'}
                      >
                        <PlayCircleOutlined /> Phát
                      </button>

                      <button
                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors text-sm"
                      >
                        <EditOutlined /> Xem
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-400/50 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-white text-xl font-semibold mb-4">Tạo Playlist Mới</h3>

            <input
              type="text"
              placeholder="Nhập tên playlist..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#1db954]"
              onKeyPress={(e) => e.key === 'Enter' && createPlaylist()}
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName('');
                }}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Hủy
              </button>

              <button
                onClick={createPlaylist}
                className="flex-1 text-white py-2 px-4 rounded-lg transition-colors"
                style={{ background: 'linear-gradient(135deg, #EE10B0, #EE10B0)' }}
                onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #d60e9e, #d60e9e)'}
                onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #EE10B0, #EE10B0)'}
              >
                Tạo Playlist
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlaylistsPage;