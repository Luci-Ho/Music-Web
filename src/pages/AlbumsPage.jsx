import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircleOutlined, SoundOutlined } from "@ant-design/icons";

import useDataLoader from "../hooks/useDataLoader";
import useFormatViews from "../hooks/useFormatViews";
import useImageFallback from "../hooks/useImageFallback";

import TopBar from "../components/layout/TopBar";
import Footer from "../components/layout/Footer";
import SectionTitle from "../components/common/SectionTitle";
import LoadingPage from "../components/common/LoadingPage";

import "../style/Layout.css";
import "../style/VA.css";
import "../style/AlbumsPage.css";

const AlbumsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title"); // title | artist | songCount | year

  const { albums = [], allSongs = [], artistMap = {}, loading } = useDataLoader();
  const { formatViews } = useFormatViews();
  const { getImageWithFallback, handleImageError } = useImageFallback();

  const albumsWithStats = useMemo(() => {
    return (albums || []).map((album) => {
      const albumId = toId(album?._id);

      const albumSongIds = Array.isArray(album?.songs) ? album.songs.map(toId) : [];
      const artistName = artistMap[toId(album?.artistId)] || album?.artist?.name || "Unknown Artist";

      const albumSongs = (allSongs || []).filter((song) => {
        const sid = toId(song?._id);
        const songAlbumId = toId(song?.albumId);
        // match theo albumId hoặc theo album.songs[]
        return (albumId && songAlbumId === albumId) || (albumSongIds.length && albumSongIds.includes(sid));
      });

      const totalViews = albumSongs.reduce((sum, s) => sum + (Number(s?.viewCount) || 0), 0);

      const songCount = albumSongs.length || albumSongIds.length || 0;

      const releaseYear =
        albumSongs.length > 0
          ? Math.min(
              ...albumSongs.map((song) =>
                new Date(song.release_date || song.releaseDate || "2024").getFullYear()
              )
            )
          : null;

      return {
        ...album,
        artistName,
        songCount,
        totalViews,
        releaseYear,
        songs: albumSongs, // để detail page dùng luôn
      };
    });
    // ❌ KHÔNG lọc songCount > 0 nữa (vì dễ lọc bay hết)
  }, [albums, allSongs, artistMap]);

  const filteredAlbums = useMemo(() => {
    let filtered = [...albumsWithStats];

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.title || "").toLowerCase().includes(q) ||
          (a.artistName || "").toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "artist":
          return (a.artistName || "").localeCompare(b.artistName || "");
        case "songCount":
          return (b.songCount || 0) - (a.songCount || 0);
        case "year":
          return (b.releaseYear || 0) - (a.releaseYear || 0);
        case "title":
        default:
          return (a.title || "").localeCompare(b.title || "");
      }
    });

    return filtered;
  }, [albumsWithStats, searchTerm, sortBy]);

  function toId(v) {
    if (!v) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") return v._id || v.id || v.legacyId || "";
    return String(v);
  }


  const handleAlbumClick = (album) => {
    const albumId = toId(album);
    if (!albumId) return;
    navigate(`/album/${albumId}`, {
      state: { album, songs: album.songs || [] },
    });
  };


  if (loading) return <LoadingPage message="Đang tải danh sách albums..." />;

  return (
    <>
      <TopBar />
      <div
        className="content albums-content"
        style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" }}
      >
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

          {/* Search + Sort */}
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

          {/* Grid */}
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
                  <div key={album._id} className="album-card" onClick={() => handleAlbumClick(album)}>
                    <div className="album-image-container">
                      <div className="album-image-wrapper">
                        <img
                          src={getImageWithFallback(album, "album")}
                          alt={album.title}
                          className="album-image"
                          onError={(e) => handleImageError(e, album.title, "album")}
                        />
                      </div>

                      <div className="album-overlay">
                        <PlayCircleOutlined className="album-play-icon" />
                      </div>
                    </div>

                    <h3 className="album-title">{album.title}</h3>
                    <p className="album-artist">{album.artistName}</p>

                    <div className="album-stats">
                      <span>{album.songCount || 0} bài hát</span>
                      <span>{formatViews(album.totalViews || 0)} lượt nghe</span>
                    </div>

                    <div className="album-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlbumClick(album);
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

export default AlbumsPage;
