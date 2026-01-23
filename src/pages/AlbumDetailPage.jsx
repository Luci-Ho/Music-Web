import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, SoundOutlined } from "@ant-design/icons";

import TopBar from "../components/layout/TopBar";
import Footer from "../components/layout/Footer";
import SectionTitle from "../components/common/SectionTitle";
import FilteredSongsTable from "../components/common/FilteredSongsTable";

import "../App.css";
import "../style/Layout.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const pickImage = (obj) => {
  if (!obj) return "";
  const img = obj.img || obj.image || obj.cover_url || obj.coverUrl;
  return typeof img === "string" ? img : "";
};

export default function AlbumDetailPage() {
  const { _id, id } = useParams(); // route đang dùng :_id (App.jsx)
  const albumId = _id || id;

  const location = useLocation();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(location.state?.album || null);
  const [artistName, setArtistName] = useState(location.state?.artistName || "");
  const [loading, setLoading] = useState(!location.state?.album);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (!albumId) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/albums/${albumId}`);
        const json = await safeJson(res);
        if (!alive) return;

        if (res.ok && json) {
          setAlbum(json);
          const an =
            (json.artistId && typeof json.artistId === "object" ? json.artistId.name : "") ||
            json.artist ||
            "";
          setArtistName(an);
        } else {
          setAlbum(null);
        }
      } catch (e) {
        console.error("AlbumDetail load error:", e);
        if (!alive) return;
        setAlbum(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    if (!album) load();
    return () => {
      alive = false;
    };
  }, [albumId, album]);

  const title = useMemo(() => album?.title || "Album", [album]);
  const img = useMemo(() => pickImage(album), [album]);

  return (
    <>
      <TopBar />
      <div
        className="content"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          minHeight: "100vh",
        }}
      >
        <div className="bluebox">
          <div className="px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="text-white/90 hover:text-white mb-4 flex items-center gap-2"
            >
              <ArrowLeftOutlined /> Quay lại
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div
                className="rounded-xl overflow-hidden flex items-center justify-center"
                style={{ width: 120, height: 120, background: "rgba(0,0,0,0.2)" }}
              >
                {img ? (
                  <img
                    src={img}
                    alt={title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <SoundOutlined style={{ fontSize: 44, color: "white" }} />
                )}
              </div>

              <div>
                <SectionTitle title1={title} title2="Album" />
                <div className="text-white/70 text-sm mt-1">
                  {loading ? "Đang tải..." : artistName ? `by ${artistName}` : "Danh sách bài hát"}
                </div>
              </div>
            </div>

            {/* Nếu FilteredSongsTable support filterType="album" thì chạy đúng */}
            <FilteredSongsTable filterType="album" filterId={String(albumId)} title={title} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
