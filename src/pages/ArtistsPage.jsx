import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircleOutlined, 
  UserOutlined
} from '@ant-design/icons';

import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';
import SectionTitle from '../components/common/SectionTitle';
import data from '../routes/db.json';

import '../style/Layout.css';
import '../style/VA.css';
import '../style/ArtistsPage.css';

const ArtistsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'songCount', 'popularity'

  // Get all artists and songs from data
  const artists = data.artists || [];
  const songs = data.songs || [];
  const songsList = data.songsList || [];

  // Combine songs from both arrays
  const allSongs = [...songs, ...songsList];

  // Calculate artist statistics
  const artistsWithStats = useMemo(() => {
    return artists.map(artist => {
      // Count songs by this artist (check both artist field and artistId)
      const artistSongs = allSongs.filter(song => 
        song.artist === artist.name || 
        song.artistId === artist.id ||
        song.artist?.toLowerCase() === artist.name?.toLowerCase()
      );

      // Calculate total views/plays
      const totalViews = artistSongs.reduce((sum, song) => sum + (song.viewCount || 0), 0);

      return {
        ...artist,
        songCount: artistSongs.length,
        totalViews: totalViews,
        songs: artistSongs
      };
    }).filter(artist => artist.songCount > 0); // Only show artists with songs
  }, [artists, allSongs]);

  // Filter and sort artists
  const filteredArtists = useMemo(() => {
    let filtered = artistsWithStats;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(artist =>
        artist.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'songCount':
          return b.songCount - a.songCount;
        case 'popularity':
          return b.totalViews - a.totalViews;
        case 'name':
        default:
          return a.name?.localeCompare(b.name) || 0;
      }
    });

    return filtered;
  }, [artistsWithStats, searchTerm, sortBy]);

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

  const getArtistImage = (artist) => {
    // Check if artist has a valid image
    if (artist.img && typeof artist.img === 'string' && artist.img.trim() !== '') {
      // Filter out problematic domains
      const problematicDomains = [
        'via.placeholder.com',
        'placeholder.com',
        'example.com',
        'test.com',
        'dummy.com'
      ];
      
      const hasProblematicDomain = problematicDomains.some(domain => 
        artist.img.includes(domain)
      );
      
      if (!hasProblematicDomain) {
        return artist.img;
      }
    }
    
    // Fallback to UI Avatars service
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name || 'Artist')}&size=200&background=22d3ee&color=ffffff&bold=true`;
  };

  const handleArtistClick = (artist) => {
    // Navigate to artist detail page with filtered songs
    navigate(`/artist/${artist.id}`, { 
      state: { 
        artist: artist,
        songs: artist.songs 
      } 
    });
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="content">
          <div style={{ textAlign: 'center', color: 'white', marginTop: '50px' }}>
            <h2>Đang tải danh sách nghệ sĩ...</h2>
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
                      src="https://img.freepik.com/premium-photo/caucasian-female-singer-portrait-isolated-purple-studio-background-neon-light_489646-14844.jpg?semt=ais_hybrid&w=740&q=80" 
                      alt="Artists" 
                      className="w-[268px] h-[268px] object-cover p-5 rounded-[2rem]" 
                    />
                    <div className="BannerText">
                      <SectionTitle title1="All Artists" title2="" />
                      <p className="btext">Khám phá các nghệ sĩ yêu thích của bạn.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter Section */}
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 w-full md:w-auto">
                    <input
                      type="text"
                      placeholder="Tìm kiếm nghệ sĩ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border-none"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border-none"
                    >
                      <option value="name">Tên A-Z</option>
                      <option value="songCount">Số bài hát</option>
                      <option value="popularity">Lượt nghe</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Artists Grid */}
              <div className="artists-grid-section">
                {filteredArtists.length === 0 ? (
                  <div className="artists-empty-state">
                    <UserOutlined className="artists-empty-icon" />
                    <h3>Không tìm thấy nghệ sĩ nào</h3>
                    <p>Thử thay đổi từ khóa tìm kiếm</p>
                  </div>
                ) : (
                  <div className="artists-grid">
                    {filteredArtists.map((artist) => (
                      <div 
                        key={artist.id}
                        className="artist-card"
                        onClick={() => handleArtistClick(artist)}
                      >
                        <div className="artist-image-container">
                          <div className="artist-image-wrapper">
                            <img
                              src={getArtistImage(artist)}
                              alt={artist.name}
                              className="artist-image"
                              onError={(e) => {
                                // First fallback - try UI Avatars with different color
                                if (!e.target.src.includes('ui-avatars.com')) {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&size=200&background=ef4444&color=ffffff&bold=true`;
                                } else {
                                  // Second fallback - simple colored placeholder
                                  e.target.src = `data:image/svg+xml;base64,${btoa(`
                                    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                                      <rect width="200" height="200" fill="#374151"/>
                                      <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">${artist.name}</text>
                                    </svg>
                                  `)}`;
                                }
                              }}
                            />
                          </div>
                          
                          <div className="artist-overlay">
                            <PlayCircleOutlined className="artist-play-icon" />
                          </div>
                        </div>

                        <h3 className="artist-name">
                          {artist.name}
                        </h3>
                        
                        <div className="artist-stats">
                          <span>{artist.songCount} bài hát</span>
                          <span>{formatViews(artist.totalViews)} lượt nghe</span>
                        </div>

                        <div className="artist-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArtistClick(artist);
                            }}
                            className="w-full px-4 py-2 rounded-lg font-semibold text-white transition-colors text-sm"
                            style={{ background: 'linear-gradient(135deg, #EE10B0, #EE10B0)' }}
                            onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #d60e9e, #d60e9e)'}
                            onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #EE10B0, #EE10B0)'}
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

export default ArtistsPage;