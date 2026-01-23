import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircleOutlined, UserOutlined } from "@ant-design/icons";

import TopBar from "../components/layout/TopBar";
import Footer from "../components/layout/Footer";
import SectionTitle from "../components/common/SectionTitle";
import LoadingPage from "../components/common/LoadingPage";

import useDataLoader from "../hooks/useDataLoader";

import "../style/Layout.css";
import "../style/VA.css";
import "../style/ArtistsPage.css";

const toId = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return v._id || v.id || v.legacyId || "";
  return String(v);
};

const toLower = (v) => (v || "").toString().trim().toLowerCase();

const getSongArtistName = (song) => {
  // ưu tiên populated
  if (song?.artistId && typeof song.artistId === "object") return song.artistId?.name || "";
  if (song?.artist && typeof song.artist === "object") return song.artist?.name || "";
  // legacy string
  return song?.artistName || song?.artist || "";
};

const ArtistsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name | songCount | popularity

  const { artists = [], allSongs = [], loading } = useDataLoader();

  const artistsWithStats = useMemo(() => {
    return (artists || []).map((artist) => {
      const aid = toId(artist?._id);
      const artistName = toLower(artist?.name);

      const artistSongs = (allSongs || []).filter((song) => {
        const songArtistId = toId(song?.artistId);
        const songArtistName = toLower(getSongArtistName(song));
        return (aid && songArtistId && songArtistId === aid) || (artistName && songArtistName === artistName);
      });

      const totalViews = artistSongs.reduce((sum, s) => sum + (Number(s?.viewCount) || 0), 0);

      return {
        ...artist,
        songCount: artistSongs.length,
        totalViews,
        songs: artistSongs,
      };
    });
    // ❌ KHÔNG lọc songCount > 0 nữa
  }, [artists, allSongs]);

  const filteredArtists = useMemo(() => {
    let list = [...artistsWithStats];

    if (searchTerm.trim()) {
      const q = toLower(searchTerm);
      list = list.filter((a) => toLower(a.name).includes(q));
    }

    list.sort((a, b) => {
      if (sortBy === "songCount") return (b.songCount || 0) - (a.songCount || 0);
      if (sortBy === "popularity") return (b.totalViews || 0) - (a.totalViews || 0);
      return (a.name || "").localeCompare(b.name || "");
    });

    return list;
  }, [artistsWithStats, searchTerm, sortBy]);

  const formatViews = (views) => {
    const v = Number(views) || 0;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return `${v}`;
  };

  const getArtistImage = (artist) => {
    if (artist?.img && typeof artist.img === "string" && artist.img.trim()) return artist.img;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(artist?.name || "Artist")}&size=200&background=22d3ee&color=ffffff&bold=true`;
  };

  const handleArtistClick = (artist) => {
    navigate(`/artist/${artist._id}`, {
      state: { artist, songs: artist.songs || [] },
    });
  };

  if (loading) return <LoadingPage message="Đang tải danh sách nghệ sĩ..." />;

  return (
    <>
      <TopBar />
      <div
        className="content"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" }}
      >
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

          {/* Search + Sort */}
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

          {/* Grid */}
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
                  <div key={artist._id} className="artist-card" onClick={() => handleArtistClick(artist)}>
                    <div className="artist-image-container">
                      <div className="artist-image-wrapper">
                        <img
                          src={getArtistImage(artist)}
                          alt={artist.name}
                          className="artist-image"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist?.name || "Artist")}&size=200&background=ef4444&color=ffffff&bold=true`;
                          }}
                        />
                      </div>
                      <div className="artist-overlay">
                        <PlayCircleOutlined className="artist-play-icon" />
                      </div>
                    </div>

                    <h3 className="artist-name">{artist.name}</h3>

                    <div className="artist-stats">
                      <span>{artist.songCount || 0} bài hát</span>
                      <span>{formatViews(artist.totalViews || 0)} lượt nghe</span>
                    </div>

                    <div className="artist-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArtistClick(artist);
                        }}
                        className="w-full px-4 py-2 rounded-lg font-semibold text-white transition-colors text-sm"
                        style={{ background: "linear-gradient(135deg, #EE10B0, #EE10B0)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #d60e9e, #d60e9e)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "linear-gradient(135deg, #EE10B0, #EE10B0)")}
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
