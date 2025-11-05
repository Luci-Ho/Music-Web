import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircleOutlined, 
  SoundOutlined
} from '@ant-design/icons';

import Dashboard from '../components/layout/Dashboard';
import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';
import SectionTitle from '../components/common/SectionTitle';
import data from '../routes/db.json';

import '../style/Layout.css';
import '../style/VA.css';
import '../style/AlbumsPage.css';

const AlbumsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title'); // 'title', 'artist', 'songCount', 'year'

  // Get all albums, artists and songs from data
  const albums = data.albums || [];
  const artists = data.artists || [];
  const songs = data.songs || [];
  const songsList = data.songsList || [];

  // Combine songs from both arrays
  const allSongs = [...songs, ...songsList];

  // Create artist name map for quick lookup
  const artistMap = useMemo(() => {
    return Object.fromEntries(artists.map(artist => [artist.id, artist.name]));
  }, [artists]);

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

  useEffect(() => {
    setLoading(false);
  }, []);

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const getAlbumImage = (album) => {
    // Check if album has a valid image
    if (album.img && typeof album.img === 'string' && album.img.trim() !== '') {
      // Filter out problematic domains
      const problematicDomains = [
        'via.placeholder.com',
        'placeholder.com',
        'example.com',
        'test.com',
        'dummy.com'
      ];
      
      const hasProblematicDomain = problematicDomains.some(domain => 
        album.img.includes(domain)
      );
      
      if (!hasProblematicDomain) {
        return album.img;
      }
    }
    
    // Fallback to UI Avatars service with album name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(album.title || 'Album')}&size=200&background=ef4444&color=ffffff&bold=true`;
  };

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
    return (
      <div className="body">
        <div style={{ display: 'flex', width: '100%' }}>
          <Dashboard />
          <div className="container">
            <TopBar />
            <div className="content">
              <div style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>
                <h2>Đang tải danh sách albums...</h2>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="body">
      <div style={{ display: 'flex', width: '100%' }}>
        <Dashboard />
        <div className="container">
          <TopBar />
          <div className="content albums-content">
            <div className="bluebox">
              <div className="TopPart albums-header">
                <div className="top2">
                  <div className="BannerPart">
                    <img 
                      src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop" 
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
                              src={getAlbumImage(album)}
                              alt={album.title}
                              className="album-image"
                              onError={(e) => {
                                // First fallback - try UI Avatars with different color
                                if (!e.target.src.includes('ui-avatars.com')) {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(album.title)}&size=200&background=10b981&color=ffffff&bold=true`;
                                } else {
                                  // Second fallback - simple colored placeholder
                                  e.target.src = `data:image/svg+xml;base64,${btoa(`
                                    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                                      <rect width="200" height="200" fill="#1f2937"/>
                                      <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dy=".3em">${album.title}</text>
                                    </svg>
                                  `)}`;
                                }
                              }}
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
        </div>
      </div>
    </div>
  );
};

export default AlbumsPage;