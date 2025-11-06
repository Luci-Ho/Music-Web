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
  
  const [artist, setArtist] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);

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
          <Footer />
    </>
  );
};

export default ArtistDetailPage;