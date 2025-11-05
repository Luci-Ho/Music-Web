import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircleOutlined, 
  SoundOutlined
} from '@ant-design/icons';
import useDataLoader from '../hooks/useDataLoader';
import useFormatViews from '../hooks/useFormatViews';
import useImageFallback from '../hooks/useImageFallback';

import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';
import SectionTitle from '../components/common/SectionTitle';
import LoadingPage from '../components/common/LoadingPage';

import '../style/Layout.css';
import '../style/VA.css';
import '../style/AlbumsPage.css';

const AlbumsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title'); // 'title', 'artist', 'songCount', 'year'

  // Custom hooks
  const { albums, artists, allSongs, artistMap, loading } = useDataLoader();
  const { formatViews } = useFormatViews();
  const { getImageWithFallback, handleImageError } = useImageFallback();

  // Calculate album statistics
  const albumsWithStats = useMemo(() => {
    return albums.map(album => {
      const artistName = artistMap[album.artistId] || 'Unknown Artist';
      
      // Get songs in this album
      const albumSongs = allSongs.filter(song => 
        album.songs.includes(song.id) || song.albumId === album.id
      );

      // Calculate total views/plays
      const totalViews = albumSongs.reduce((sum, song) => sum + (song.viewCount || 0), 0);

      // Get release year from songs
      const releaseYear = albumSongs.length > 0 ? 
        Math.min(...albumSongs.map(song => new Date(song.release_date || '2024').getFullYear())) :
        null;

      return {
        ...album,
        artistName: artistName,
        songCount: albumSongs.length,
        totalViews: totalViews,
        releaseYear: releaseYear,
        songs: albumSongs
      };
    }).filter(album => album.songCount > 0); // Only show albums with songs
  }, [albums, artistMap, allSongs]);

  // Filter and sort albums
  const filteredAlbums = useMemo(() => {
    let filtered = albumsWithStats;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(album =>
        album.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.artistName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'artist':
          return a.artistName?.localeCompare(b.artistName) || 0;
        case 'songCount':
          return b.songCount - a.songCount;
        case 'year':
          return (b.releaseYear || 0) - (a.releaseYear || 0);
        case 'title':
        default:
          return a.title?.localeCompare(b.title) || 0;
      }
    });

    return filtered;
  }, [albumsWithStats, searchTerm, sortBy]);

  const handleAlbumClick = (album) => {
    // Navigate to album detail page with filtered songs
    navigate(`/album/${album.id}`, { 
      state: { 
        album: album,
        songs: album.songs 
      } 
    });
  };

  if (loading) {
    return <LoadingPage message="Đang tải danh sách albums..." />;
  }

  return (
    <>
      <TopBar />
      <div className="content albums-content">
        <div className="bluebox">
          <div className="TopPart albums-header">
            <div className="top2">
              <div className="BannerPart">
                <img 
                  src="https://img.freepik.com/free-vector/realistic-music-record-label-disk-mockup_1017-33906.jpg?semt=ais_hybrid&w=740&q=80" 
                  alt="Albums" 
                  className="albums-banner-image" 
                    />
                    <div className="BannerText">
                      <SectionTitle title1="All Albums" title2="" />
                      <p className="btext">Khám phá các albums yêu thích của bạn.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter Section */}
              <div className="albums-search-section">
                <div className="albums-search-container">
                  <div className="albums-search-input-wrapper">
                    <input
                      type="text"
                      placeholder="Tìm kiếm album hoặc nghệ sĩ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="albums-search-input"
                    />
                  </div>
                  
                  <div className="albums-filter-container">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="albums-sort-select"
                    >
                      <option value="title">Tên album A-Z</option>
                      <option value="artist">Nghệ sĩ A-Z</option>
                      <option value="songCount">Số bài hát</option>
                      <option value="year">Năm phát hành</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Albums Grid */}
              <div className="albums-grid-section">
                {filteredAlbums.length === 0 ? (
                  <div className="albums-empty-state">
                    <SoundOutlined className="albums-empty-icon" />
                    <h3>Không tìm thấy album nào</h3>
                    <p>Thử thay đổi từ khóa tìm kiếm</p>
                  </div>
                ) : (
                  <div className="albums-grid">
                    {filteredAlbums.map((album) => (
                      <div 
                        key={album.id}
                        className="album-card"
                        onClick={() => handleAlbumClick(album)}
                      >
                        <div className="album-image-container">
                          <div className="album-image-wrapper">
                            <img
                              src={getImageWithFallback(album, 'album')}
                              alt={album.title}
                              className="album-image"
                              onError={(e) => handleImageError(e, album.title, 'album')}
                            />
                          </div>
                          
                          <div className="album-overlay">
                            <PlayCircleOutlined className="album-play-icon" />
                          </div>
                        </div>

                        <h3 className="album-title">
                          {album.title}
                        </h3>
                        
                        <p className="album-artist">
                          {album.artistName}
                        </p>

                        <div className="album-stats">
                          <span>{album.songCount} bài hát</span>
                          <span>{formatViews(album.totalViews)} lượt nghe</span>
                        </div>

                        <div className="album-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlbumClick(album);
                            }}
                            className="album-view-button"
                          >
                            <PlayCircleOutlined /> Xem tất cả
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
    </>
  );
};

export default AlbumsPage;