import React, { useEffect, useMemo, useState } from "react";
import { Table } from "antd";
import formatNumber from "../../hooks/formatNumber";
import "./TopSongsChart.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function safeFetchArray(url) {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  if (text.trim().startsWith("<")) return [];

  try {
    const json = JSON.parse(text);
    const arr =
      Array.isArray(json) ? json :
      Array.isArray(json?.data) ? json.data :
      Array.isArray(json?.songs) ? json.songs :
      [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function TopSongsChart({ data }) {
  const [topSongs, setTopSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Normalize input data (nếu Dashboard truyền vào)
  const normalizedFromProps = useMemo(() => {
    if (!Array.isArray(data)) return null;

    // data có thể là:
    // - raw songs (có viewCount)
    // - hoặc đã map dạng {rank,title,duration,listens,...}
    return data.map((s, idx) => ({
      key: s._id || s.key || `${idx}`,
      _id: s._id,
      rank: s.rank ?? (idx + 1),
      title: s.title || "—",
      artist: s.artist || s.artistName || "",
      duration: s.duration || "—",
      viewCount: s.viewCount ?? s.listens ?? 0,
    }));
  }, [data]);

  useEffect(() => {
    // ✅ Nếu có data từ props -> dùng luôn
    if (normalizedFromProps) {
      setTopSongs(normalizedFromProps.slice(0, 10));
      setLoading(false);
      return;
    }

    // ❌ Không có data -> fallback fetch
    (async () => {
      setLoading(true);
      const songs = await safeFetchArray(`${API_BASE}/songs`);

      const top10 = songs
        .slice()
        .sort((a, b) => (Number(b?.viewCount) || 0) - (Number(a?.viewCount) || 0))
        .slice(0, 10)
        .map((s, idx) => ({
          key: s._id || `${idx}`,
          _id: s._id,
          rank: idx + 1,
          title: s.title || "—",
          artist: s.artist || "", // nếu BE không có field artist string thì để rỗng
          duration: s.duration || "—",
          viewCount: Number(s?.viewCount) || 0,
        }));

      setTopSongs(top10);
      setLoading(false);
    })();
  }, [normalizedFromProps]);

  const columns = [
    {
      title: "#",
      dataIndex: "rank",
      key: "rank",
      width: 50,
      render: (rank) => (
        <span
          className={`font-medium text-sm ${
            rank === 1
              ? "text-yellow-500"
              : rank === 2
              ? "text-gray-400"
              : rank === 3
              ? "text-orange-400"
              : "text-gray-600"
          }`}
        >
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
        </span>
      ),
    },
    {
      title: "Bài hát",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <div className="font-medium text-gray-900 truncate max-w-[200px] text-sm" title={title}>
            {title}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-[200px]" title={record.artist}>
            {record.artist || "—"}
          </div>
        </div>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      align: "center",
      render: (duration) => <span className="text-gray-600 font-mono text-xs">{duration}</span>,
    },
    {
      title: "Lượt nghe",
      dataIndex: "viewCount",
      key: "viewCount",
      width: 120,
      align: "center",
      render: (viewCount) => (
        <div className="text-center">
          <span className="font-medium text-blue-600 text-sm">{formatNumber(viewCount || 0)}</span>
          <div className="text-xs text-gray-400">lượt nghe</div>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full">
      <Table
        columns={columns}
        dataSource={topSongs}
        loading={loading}
        pagination={false}
        size="small"
        scroll={{ y: 300 }}
        className="top-songs-table"
      />
    </div>
  );
}
