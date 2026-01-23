import React, { useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SoundOutlined } from "@ant-design/icons";

import TopBar from "../components/layout/TopBar";
import Footer from "../components/layout/Footer";
import LoadingPage from "../components/common/LoadingPage";

import useDataLoader from "../hooks/useDataLoader";
import useFormatViews from "../hooks/useFormatViews";

import "../style/Layout.css";
import "../style/VA.css";

const toId = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return v._id || v.id || v.legacyId || "";
  return String(v);
};

const AlbumDetailPage = () => {
  const params = useParams();
  const albumId = params._id || params.id; // ✅ nhận cả :_id và :id
  const location = useLocation();
  const navigate = useNavigate();

  const { albums = [], artists = [], allSongs = [], loading } = useDataLoader();
  const { formatViews } = useFormatViews();

  const { album, albumSongs, artist } = useMemo(() => {
    // 1) Ưu tiên lấy từ state khi navigate qua
    const stateAlbum = location.state?.album || null;
    const stateSongs = Array.isArray(location.state?.songs) ? location.state.songs : null;

    const foundAlbum =
      stateAlbum ||
      (albums || []).find((a) => toId(a) === albumId) ||
      null;

    // album chưa load kịp
    if (!foundAlbum) {
      return { album: null, albumSongs: [], artist: null };
    }

    const foundArtist =
      (artists || []).find((ar) => toId(ar) === toId(foundAlbum.artistId)) || null;

    // 2) Lấy songs: ưu tiên state.songs, nếu không có thì filter từ allSongs
    let songs = [];
    if (stateSongs) {
      songs = stateSongs;
    } else {
      const songIdsInAlbum = Array.isArray(foundAlbum.songs) ? foundAlbum.songs.map(toId) : [];
      songs = (allSongs || []).filter((s) => {
        const sid = toId(s);
        const sAlbumId = toId(s.albumId);
        return (albumId && sAlbumId === albumId) || (songIdsInAlbum.length && songIdsInAlbum.includes(sid));
      });
    }

    return { album: foundAlbum, albumSongs: songs, artist: foundArtist };
  }, [albumId, location.state, albums, artists, allSongs]);

  const totalViews = useMemo(
    () => albumSongs.reduce((sum, s) => sum + (Number(s?.viewCount) || 0), 0),
    [albumSongs]
  );

  if (loading) return <LoadingPage message="Đang tải thông tin album..." />;

  if (!albumId) {
    return (
      <>
        <TopBar />
        <div className="content" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" }}>
          <div className="bluebox">
            <div style={{ padding: 24, color: "white" }}>
              <h2>Thiếu tham số albumId</h2>
              <button onClick={() => navigate("/album")} style={{ marginTop: 12 }}>
                Quay lại Albums
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!album) {
    return (
      <>
        <TopBar />
        <div className="content" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" }}>
          <div className="bluebox">
            <div style={{ padding: 24, color: "white" }}>
              <h2>Không tìm thấy album</h2>
              <button onClick={() => navigate("/album")} style={{ marginTop: 12 }}>
                Quay lại Albums
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const albumTitle = album?.title || "(Unknown Album)";
  const albumImg =
    album?.img ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(albumTitle)}&size=300&background=111827&color=ffffff&bold=true`;

  const artistName =
    artist?.name ||
    (typeof album?.artistId === "object" ? album.artistId?.name : "") ||
    "Unknown Artist";

  return (
    <>
      <TopBar />
      <div className="content" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)", minHeight: "100vh" }}>
        <div className="bluebox" style={{ padding: 20 }}>
          {/* Back */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "white", cursor: "pointer", marginBottom: 16 }} onClick={() => navigate(-1)}>
            <ArrowLeftOutlined />
            <span>Quay lại</span>
          </div>

          {/* Header */}
          <div
            style={{
              display: "flex",
              gap: 18,
              alignItems: "center",
              padding: 18,
              borderRadius: 18,
              background: "rgba(0,0,0,0.25)",
            }}
          >
            <img
              src={albumImg}
              alt={albumTitle}
              style={{ width: 120, height: 120, borderRadius: 16, objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(albumTitle)}&size=300&background=ef4444&color=ffffff&bold=true`;
              }}
            />

            <div style={{ flex: 1, color: "white" }}>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{albumTitle}</h2>
              <div style={{ opacity: 0.9, marginTop: 6 }}>
                <span style={{ fontWeight: 600 }}>Artist:</span>{" "}
                <span
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                  onClick={() => {
                    const aid = toId(album?.artistId);
                    if (aid) navigate(`/artist/${aid}`);
                  }}
                >
                  {artistName}
                </span>
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 10, opacity: 0.95 }}>
                <span><SoundOutlined /> {albumSongs.length} songs</span>
                <span>{formatViews(totalViews)} lượt nghe</span>
              </div>
            </div>
          </div>

          {/* Songs */}
          <div style={{ marginTop: 18, padding: 16, borderRadius: 18, background: "rgba(0,0,0,0.18)", color: "white" }}>
            <h3 style={{ marginTop: 0 }}>Danh sách bài hát</h3>

            {albumSongs.length === 0 ? (
              <div style={{ opacity: 0.85 }}>Album này chưa có bài hát (hoặc chưa match được albumId).</div>
            ) : (
              <div style={{ width: "100%", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", opacity: 0.85 }}>
                      <th style={{ padding: "10px 8px" }}>#</th>
                      <th style={{ padding: "10px 8px" }}>Title</th>
                      <th style={{ padding: "10px 8px" }}>Artist</th>
                      <th style={{ padding: "10px 8px" }}>Views</th>
                      <th style={{ padding: "10px 8px" }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {albumSongs.map((s, idx) => {
                      const sArtist =
                        (typeof s.artistId === "object" ? s.artistId?.name : "") ||
                        s.artistName ||
                        s.artist ||
                        artistName;

                      return (
                        <tr key={toId(s) || idx} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                          <td style={{ padding: "10px 8px", opacity: 0.9 }}>{idx + 1}</td>
                          <td style={{ padding: "10px 8px", fontWeight: 700 }}>{s?.title || "(no title)"}</td>
                          <td style={{ padding: "10px 8px", opacity: 0.9 }}>{sArtist}</td>
                          <td style={{ padding: "10px 8px", opacity: 0.9 }}>{formatViews(s?.viewCount || 0)}</td>
                          <td style={{ padding: "10px 8px", opacity: 0.9 }}>{s?.duration || "--"}</td>
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

export default AlbumDetailPage;
