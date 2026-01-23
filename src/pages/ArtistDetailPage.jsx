import React, { useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";

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

const toLower = (v) => (v || "").toString().trim().toLowerCase();

const getSongArtistName = (song) => {
  if (song?.artistId && typeof song.artistId === "object") return song.artistId?.name || "";
  if (song?.artist && typeof song.artist === "object") return song.artist?.name || "";
  return song?.artistName || song?.artist || "";
};

const ArtistDetailPage = () => {
  const params = useParams();
  const artistId = params._id || params.id; // ✅ nhận cả :_id và :id
  const location = useLocation();
  const navigate = useNavigate();

  const { artists = [], allSongs = [], loading } = useDataLoader();
  const { formatViews } = useFormatViews();

  const { artist, artistSongs } = useMemo(() => {
    const stateArtist = location.state?.artist || null;
    const stateSongs = Array.isArray(location.state?.songs) ? location.state.songs : null;

    const foundArtist =
      stateArtist ||
      (artists || []).find((a) => toId(a) === artistId) ||
      null;

    if (!foundArtist) return { artist: null, artistSongs: [] };

    let songs = [];
    if (stateSongs) {
      songs = stateSongs;
    } else {
      const aName = toLower(foundArtist?.name);
      songs = (allSongs || []).filter((s) => {
        const sArtistId = toId(s?.artistId);
        const sArtistName = toLower(getSongArtistName(s));
        return (artistId && sArtistId === artistId) || (aName && sArtistName === aName);
      });
    }

    return { artist: foundArtist, artistSongs: songs };
  }, [artistId, location.state, artists, allSongs]);

  const totalViews = useMemo(
    () => artistSongs.reduce((sum, s) => sum + (Number(s?.viewCount) || 0), 0),
    [artistSongs]
  );

  if (loading) return <LoadingPage message="Đang tải thông tin nghệ sĩ..." />;

  if (!artistId) {
    return (
      <>
        <TopBar />
        <div className="content" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" }}>
          <div className="bluebox">
            <div style={{ padding: 24, color: "white" }}>
              <h2>Thiếu tham số artistId</h2>
              <button onClick={() => navigate("/artist")} style={{ marginTop: 12 }}>
                Quay lại Artists
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <TopBar />
        <div className="content" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" }}>
          <div className="bluebox">
            <div style={{ padding: 24, color: "white" }}>
              <h2>Không tìm thấy nghệ sĩ</h2>
              <button onClick={() => navigate("/artist")} style={{ marginTop: 12 }}>
                Quay lại Artists
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const artistName = artist?.name || "(Unknown Artist)";
  const artistImg =
    artist?.img ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&size=300&background=111827&color=ffffff&bold=true`;

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
              src={artistImg}
              alt={artistName}
              style={{ width: 120, height: 120, borderRadius: 16, objectFit: "cover" }}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artistName)}&size=300&background=ef4444&color=ffffff&bold=true`;
              }}
            />

            <div style={{ flex: 1, color: "white" }}>
              <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{artistName}</h2>

              <div style={{ display: "flex", gap: 16, marginTop: 10, opacity: 0.95 }}>
                <span><UserOutlined /> {artistSongs.length} songs</span>
                <span>{formatViews(totalViews)} lượt nghe</span>
              </div>
            </div>
          </div>

          {/* Songs */}
          <div style={{ marginTop: 18, padding: 16, borderRadius: 18, background: "rgba(0,0,0,0.18)", color: "white" }}>
            <h3 style={{ marginTop: 0 }}>Danh sách bài hát</h3>

            {artistSongs.length === 0 ? (
              <div style={{ opacity: 0.85 }}>Nghệ sĩ này chưa có bài hát (hoặc chưa match được artistId).</div>
            ) : (
              <div style={{ width: "100%", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", opacity: 0.85 }}>
                      <th style={{ padding: "10px 8px" }}>#</th>
                      <th style={{ padding: "10px 8px" }}>Title</th>
                      <th style={{ padding: "10px 8px" }}>Album</th>
                      <th style={{ padding: "10px 8px" }}>Views</th>
                      <th style={{ padding: "10px 8px" }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artistSongs.map((s, idx) => {
                      const sAlbum =
                        (typeof s.albumId === "object" ? s.albumId?.title : "") ||
                        s.albumTitle ||
                        s.album ||
                        "--";

                      return (
                        <tr key={toId(s) || idx} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                          <td style={{ padding: "10px 8px", opacity: 0.9 }}>{idx + 1}</td>
                          <td style={{ padding: "10px 8px", fontWeight: 700 }}>{s?.title || "(no title)"}</td>
                          <td style={{ padding: "10px 8px", opacity: 0.9 }}>{sAlbum}</td>
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

export default ArtistDetailPage;
