import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlayCircleOutlined,
  HeartOutlined,
  HeartFilled,
  ArrowLeftOutlined,
} from "@ant-design/icons";

import useDataLoader from "../hooks/useDataLoader";
import useFavorites from "../hooks/useFavorites";
import useFormatViews from "../hooks/useFormatViews";
import useFormatDuration from "../hooks/useFormatDuration";
import useMusicPlayer from "../hooks/useMusicPlayer";

import TopBar from "../components/layout/TopBar";
import Footer from "../components/layout/Footer";
import SectionTitle from "../components/common/SectionTitle";
import LoadingPage from "../components/common/LoadingPage";
import EmptyStatePage from "../components/common/EmptyStatePage";

import "../style/Layout.css";
import "../style/VA.css";

const normId = (v) => {
  if (!v) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object") return String(v._id || v.id || v.legacyId || "");
  return String(v);
};

const ListPage = ({ pageType }) => {
  const params = useParams();
  const id = params._id || params.id;
  const navigate = useNavigate();

  const { allSongs = [], genres = [], moods = [], loading } = useDataLoader();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { formatViews } = useFormatViews();
  const { formatDuration } = useFormatDuration();
  const { playSong } = useMusicPlayer();

  const config = useMemo(() => {
    if (pageType === "genre") {
      const genre = (genres || []).find(
        (g) => normId(g?._id) === normId(id) || normId(g?.id) === normId(id)
      );
      return { title: genre?.title || "Genre", img: genre?.img, obj: genre };
    }
    if (pageType === "mood") {
      const mood = (moods || []).find(
        (m) => normId(m?._id) === normId(id) || normId(m?.id) === normId(id)
      );
      return { title: mood?.title || "Mood", img: mood?.img, obj: mood };
    }
    return { title: "Browse", img: null, obj: null };
  }, [pageType, id, genres, moods]);

  const filteredSongs = useMemo(() => {
    const targetId = normId(id);
    const targetTitle = (config?.title || "").toLowerCase().trim();

    return (allSongs || []).filter((song) => {
      if (pageType === "genre") {
        if (normId(song?.genreId) === targetId) return true;
        const genreText = (
          song?.genre ||
          song?.genreName ||
          song?.genreId?.title ||
          ""
        )
          .toLowerCase()
          .trim();
        return genreText && targetTitle && genreText === targetTitle;
      }

      if (pageType === "mood") {
        if (normId(song?.moodId) === targetId) return true;
        const moodText = (
          song?.mood ||
          song?.moodName ||
          song?.moodId?.title ||
          ""
        )
          .toLowerCase()
          .trim();
        return moodText && targetTitle && moodText === targetTitle;
      }

      return false;
    });
  }, [allSongs, id, pageType, config?.title]);

  if (loading) return <LoadingPage message="Đang tải danh sách..." />;

  if (!id) {
    return (
      <EmptyStatePage
        title="Thiếu ID"
        buttonText="Quay lại"
        onButtonClick={() => navigate(-1)}
        buttonClassName="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors mt-4"
      />
    );
  }

  return (
    <>
      <TopBar />
      <div
        className="content"
        style={{
          background:
            "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        }}
      >
        <div className="bluebox">
          <div className="TopPart bg-gradient-to-r from-blue-400 to-gray-600 rounded-lg">
            <div className="top2">
              <div className="BannerPart">
                <img
                  src={config.img || "https://via.placeholder.com/300?text=Browse"}
                  alt={config.title}
                  className="w-[268px] h-[268px] object-cover p-5 rounded-[2rem]"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/300?text=Browse";
                  }}
                />

                <div className="BannerText">
                  <button
                    onClick={() => navigate(-1)}
                    className="text-white hover:text-gray-300 mb-2 flex items-center gap-2"
                  >
                    <ArrowLeftOutlined /> Quay lại
                  </button>

                  <SectionTitle
                    title1={config.title}
                    title2={pageType === "genre" ? "Genre" : "Mood"}
                  />
                  <p className="btext">{filteredSongs.length} bài hát</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredSongs.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#ddd" }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.7 }}>🎵</div>
                <p>Không có bài hát nào thuộc mục này</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSongs.map((song, index) => {
                  const primaryId = normId(song?._id) || normId(song?.id) || String(index);

                  return (
                    <div
                      key={primaryId}
                      className="bg-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/15 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-white/70 w-6">{index + 1}</div>

                        <img
                          src={
                            song.img ||
                            song.cover_url ||
                            "https://via.placeholder.com/60?text=Song"
                          }
                          alt={song.title}
                          className="w-14 h-14 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/60?text=Song";
                          }}
                        />

                        <div>
                          <div className="text-white font-semibold">
                            {song.title || "(no title)"}
                          </div>
                          <div className="text-white/60 text-sm">
                            {song.artist || song.artistId?.name || "Unknown"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-white/70 text-sm">
                          {formatDuration(song.duration)}
                        </div>
                        <div className="text-white/70 text-sm">
                          {formatViews(song.viewCount || 0)}
                        </div>

                        <button
                          onClick={() => playSong(song, filteredSongs)} // pass list luôn cho chắc
                          className="bg-[#1db954] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#1ed760] transition-colors flex items-center gap-2"
                        >
                          <PlayCircleOutlined /> Play
                        </button>

                        <button
                          onClick={() => toggleFavorite(primaryId)}
                          className="text-white px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                          {isFavorite(primaryId) ? (
                            <HeartFilled style={{ color: "#ff4d4f" }} />
                          ) : (
                            <HeartOutlined />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ListPage;
