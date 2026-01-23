import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";

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

const normId = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return String(v._id || v.id || "");
  return String(v);
};

const pickImage = (obj) => {
  if (!obj) return "";
  const img = obj.img || obj.image || obj.avatar || obj.cover_url || obj.coverUrl;
  return typeof img === "string" ? img : "";
};

export default function ArtistDetailPage() {
  const { _id, id } = useParams(); // route đang dùng :_id (App.jsx)
  const artistId = _id || id;

  const location = useLocation();
  const navigate = useNavigate();

  const [artist, setArtist] = useState(location.state?.artist || null);
  const [loading, setLoading] = useState(!location.state?.artist);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (!artistId) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/artists/${artistId}`);
        const json = await safeJson(res);
        if (!alive) return;
        if (res.ok && json) setArtist(json);
        else setArtist(null);
      } catch (e) {
        console.error("ArtistDetail load error:", e);
        if (!alive) return;
        setArtist(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    if (!artist) load();
    return () => {
      alive = false;
    };
  }, [artistId, artist]);

  const name = useMemo(() => artist?.name || "Artist", [artist]);
  const img = useMemo(() => pickImage(artist), [artist]);

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
                    alt={name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <UserOutlined style={{ fontSize: 44, color: "white" }} />
                )}
              </div>

              <div>
                <SectionTitle title1={name} title2="Artist" />
                <div className="text-white/70 text-sm mt-1">{loading ? "Đang tải..." : "Danh sách bài hát"}</div>
              </div>
            </div>

            {/* Nếu FilteredSongsTable của bạn đã support filterType="artist" thì sẽ chạy đúng */}
            <FilteredSongsTable filterType="artist" filterId={String(normId(artistId))} title={name} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
