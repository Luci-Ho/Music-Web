import React, { useEffect, useMemo, useState } from "react";
import { Card } from "antd";
import StartCard from "../component/StartCard";
import ChartBar from "../component/ChartBar";
import ChartPie from "../component/ChartPie";
import ChartLine from "../component/ChartLine";
import formatTimes from "../../hooks/formatTimes";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// --- safe fetch: luôn trả về array ---
async function safeFetchArray(url) {
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  // backend trả HTML (Cannot GET...) => []
  if (text.trim().startsWith("<")) return [];

  try {
    const json = JSON.parse(text);
    const arr =
      Array.isArray(json) ? json :
      Array.isArray(json?.data) ? json.data :
      Array.isArray(json?.songs) ? json.songs :
      Array.isArray(json?.users) ? json.users :
      Array.isArray(json?.artists) ? json.artists :
      [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function DashboardView() {
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    (async () => {
      const [songsArr, usersArr, artistsArr] = await Promise.all([
        safeFetchArray(`${API_BASE}/songs`),
        safeFetchArray(`${API_BASE}/users`),
        safeFetchArray(`${API_BASE}/artists`),
      ]);

      setSongs(songsArr);
      setUsers(usersArr);
      setArtists(artistsArr);
    })();
  }, []);

  // --- derived values ---
  const songsCount = songs.length;
  const usersCount = users.length;
  const artistsCount = artists.length;

  // streamingCount: tạm tính theo tổng viewCount (hoặc đổi theo logic bạn muốn)
  const totalStreamings = useMemo(() => {
    return songs.reduce((sum, s) => sum + (Number(s?.viewCount) || 0), 0);
  }, [songs]);

  // Top 10 songs by viewCount
  const top10Songs = useMemo(() => {
    return [...songs]
      .sort((a, b) => (Number(b?.viewCount) || 0) - (Number(a?.viewCount) || 0))
      .slice(0, 10)
      .map((s, idx) => ({
        key: s._id || `${idx}`,
        rank: idx + 1,
        title: s.title || "—",
        duration: s.duration || "—",
        listens: Number(s?.viewCount) || 0,
      }));
  }, [songs]);

  // Stats cards
  const stats = useMemo(() => ([
    { id: 1, title: "Total Songs", value: songsCount },
    { id: 2, title: "Total Users", value: usersCount },
    // Nếu bạn muốn hiển thị “time listened” thì phải có data duration * viewCount.
    // Hiện tại mình giữ “Total Streaming” = tổng viewCount, formatTimes theo seconds sẽ không hợp.
    // Nên mình để trực tiếp số:
    { id: 3, title: "Total Streaming", value: totalStreamings },
    { id: 4, title: "Total Artists", value: artistsCount },
  ]), [songsCount, usersCount, totalStreamings, artistsCount]);

  // Mock chart data (bạn có thể thay bằng data thật sau)
  const listensByDay = useMemo(() => ([
    { day: "Mon", listens: 1200 },
    { day: "Tue", listens: 2500 },
    { day: "Wed", listens: 2000 },
    { day: "Thu", listens: 3000 },
    { day: "Fri", listens: 4500 },
    { day: "Sat", listens: 6000 },
    { day: "Sun", listens: 5200 },
  ]), []);

  const userActivity = useMemo(() => ([
    { date: "2025-10-23", users: 1200 },
    { date: "2025-10-24", users: 1350 },
    { date: "2025-10-25", users: 1600 },
    { date: "2025-10-26", users: 1500 },
    { date: "2025-10-27", users: 1800 },
    { date: "2025-10-28", users: 2200 },
    { date: "2025-10-29", users: 2100 },
  ]), []);

  return (
    <section>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <StartCard key={s.id} title={s.title} value={s.value} />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card className="col-span-2">
          <h3>Listens by day</h3>
          <ChartBar data={listensByDay} />
        </Card>

        <Card>
          <h3>Top 10 Bài Hát Được Nghe Nhiều Nhất</h3>

          {/* Nếu ChartPie của bạn hiện đang là Table/Chart riêng thì truyền props vào */}
          {/* Option A: nếu ChartPie hỗ trợ data */}
          <ChartPie data={top10Songs} />

          {/* Option B: nếu ChartPie chưa nhận data -> bạn đổi ChartPie thành Table (mình viết giúp nếu bạn dán ChartPie.jsx) */}
        </Card>
      </div>

      <Card>
        <h3>User activity (weekly)</h3>
        <ChartLine data={userActivity} />
      </Card>
    </section>
  );
}
