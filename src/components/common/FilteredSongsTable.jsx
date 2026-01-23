// src/components/common/FilteredSongsTable.jsx
import React, { useEffect, useMemo, useState, useContext } from 'react';
import '../../style/VA.css';
import '../../style/Layout.css';
import {
  PlayCircleOutlined,
  HeartFilled,
  HeartTwoTone,
  PlusOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import TopBar from '../layout/TopBar';
import SectionTitle from './SectionTitle';
import { removeVietnameseTones } from '../../utils/StringUtils';
import formatNumber from '../../hooks/formatNumber';
import useAuth from '../../hooks/useAuth';
import useFavorites, { normalizeId } from '../../hooks/useFavorites';
import { AppContext } from '../common/AppContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// helper: lấy display name/title từ populated object hoặc fallback field
const getArtistName = (song) =>
  song?.artistId?.name || song?.artistName || song?.artist || '-';

const getAlbumTitle = (song) =>
  song?.albumId?.title || song?.albumTitle || song?.album || '-';

const getSongImg = (song) =>
  song?.img || song?.cover_url || song?.cover || 'https://via.placeholder.com/48?text=No+Image';

const getSongId = (song) => {
  // ưu tiên _id (mongo), nếu buffer => normalizeId sẽ biến thành hex string
  const id = normalizeId(song?._id) || normalizeId(song?.id) || normalizeId(song?.legacyId);
  return id;
};

const getAnyId = (v) => normalizeId(v?._id) || normalizeId(v?.id) || normalizeId(v);

const FilteredSongsTable = ({ filterType = 'genre', filterId, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, login } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { playAll, playSong } = useContext(AppContext);

  // songs from server
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  // playlist states (giữ logic dropdown như file cũ)
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(null); // songId
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  useEffect(() => {
    setUserPlaylists(Array.isArray(user?.playlists) ? user.playlists : []);
  }, [user]);

  // Fetch ALL songs từ /api/songs (loop paging)
  useEffect(() => {
    let mounted = true;

    const fetchAllSongs = async () => {
      setLoading(true);
      try {
        const collected = [];
        let page = 1;
        const perPage = 50;

        while (true) {
          const res = await fetch(`${API_BASE}/songs?page=${page}&perPage=${perPage}`);
          if (!res.ok) throw new Error(`GET /songs failed: ${res.status}`);
          const json = await res.json();

          const pageData = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
          collected.push(...pageData);

          if (pageData.length < perPage) break;
          page += 1;
          if (page > 100) break; // safety
        }

        if (mounted) setSongs(collected);
      } catch (e) {
        console.error(e);
        toast.error('Không thể tải danh sách bài hát từ server');
        if (mounted) setSongs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAllSongs();
    return () => {
      mounted = false;
    };
  }, []);

  // FILTER LOGIC
  const filtered = useMemo(() => {
    let result = [];

    if (filterType === 'all') {
      result = [...songs];
    } else if (filterType === 'favorites') {
      // favorites dựa theo API favorites (useFavorites) -> isFavorite(songId)
      result = songs.filter((s) => isFavorite(getSongId(s)));
    } else if (filterType === 'search') {
      const keyword = removeVietnameseTones(String(filterId || '').toLowerCase());
      result = songs.filter((s) => {
        const t = removeVietnameseTones(String(s?.title || '').toLowerCase());
        const a = removeVietnameseTones(String(getArtistName(s) || '').toLowerCase());
        return t.includes(keyword) || a.includes(keyword);
      });
    } else {
      if (!filterId) return [];
      const fid = String(filterId);

      if (filterType === 'artist') {
        result = songs.filter((s) => {
          const sid = getAnyId(s?.artistId);
          return sid === fid || String(getArtistName(s)).toLowerCase() === fid.toLowerCase();
        });
      }

      if (filterType === 'album') {
        result = songs.filter((s) => getAnyId(s?.albumId) === fid);
      }

      if (filterType === 'genre') {
        result = songs.filter((s) => {
          const gid = getAnyId(s?.genreId);
          return gid === fid || String(s?.genre || '').toLowerCase() === fid.toLowerCase();
        });
      }

      if (filterType === 'mood') {
        result = songs.filter((s) => getAnyId(s?.moodId) === fid);
      }
    }

    // sort views desc for all
    if (filterType === 'all') {
      result.sort((a, b) => (Number(b?.viewCount || b?.views || 0) - Number(a?.viewCount || a?.views || 0)));
    }

    return result;
  }, [songs, filterType, filterId, isFavorite]);

  // PLAYLIST HELPERS (giữ cơ chế update user local + PATCH user như code cũ)
  // NOTE: Bạn đang dùng patch user theo endpoint cũ "/users". Nếu backend user update đã đổi sang /api/users
  // thì đổi API_USERS = `${API_BASE}/users`.
  const API_USERS = 'http://localhost:5000/users';

  const playlistIdOf = (pl) => String(pl?._id || pl?.id || '');
  const playlistNameOf = (pl) => pl?.name || pl?.title || 'playlist';

  const addToPlaylist = async (songId, playlistId) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      const updatedPlaylists = (userPlaylists || []).map((pl) => {
        const pid = playlistIdOf(pl);
        if (pid !== String(playlistId)) return pl;

        const currentSongs = Array.isArray(pl.songs) ? pl.songs : [];
        const currentIds = currentSongs.map((x) => normalizeId(x?._id || x?.id || x)).filter(Boolean);

        if (currentIds.includes(songId)) return pl;

        // lưu dạng string id cho gọn
        return { ...pl, songs: [...currentSongs, songId] };
      });

      setUserPlaylists(updatedPlaylists);
      login({ ...(user || {}), playlists: updatedPlaylists });

      const res = await fetch(`${API_USERS}/${user?._id || user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlists: updatedPlaylists }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      const plName = playlistNameOf(updatedPlaylists.find((p) => playlistIdOf(p) === String(playlistId)));
      toast.success(`Đã thêm bài hát vào ${plName}`);
    } catch (err) {
      console.error(err);
      toast.error('Không thể thêm vào playlist. Vui lòng thử lại.');
    }
  };

  const createNewPlaylist = async (songId) => {
    if (!newPlaylistName.trim()) {
      toast.error('Vui lòng nhập tên playlist');
      return;
    }

    try {
      const newPlaylist = {
        id: String(Date.now()), // theo schema bạn đang dùng (id: "1","2"...)
        name: newPlaylistName.trim(),
        songs: [songId],
      };

      const updatedPlaylists = [...(userPlaylists || []), newPlaylist];
      setUserPlaylists(updatedPlaylists);
      login({ ...(user || {}), playlists: updatedPlaylists });

      const res = await fetch(`${API_USERS}/${user?._id || user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlists: updatedPlaylists }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      toast.success(`Đã tạo playlist "${newPlaylistName}" và thêm bài hát`);
      setNewPlaylistName('');
      setShowCreatePlaylist(false);
      setShowPlaylistDropdown(null);
    } catch (err) {
      console.error(err);
      toast.error('Không thể tạo playlist. Vui lòng thử lại.');
    }
  };

  const bannerImg = null; // nếu bạn muốn banner theo genre/artist thì cần API genres/artists riêng

  return (
    <div
      className="content"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}
    >
      <div className="bluebox ">
        <div className="TopPart bg-gradient-to-r from-blue-400 to-gray-600 rounded-lg">
          <TopBar />
          <div className="top2">
            <div className="BannerPart">
              {bannerImg ? (
                <img
                  src={bannerImg}
                  alt="Banner"
                  className="w-[268px] h-[268px] object-cover p-0"
                  style={{
                    borderRadius: '8px',
                    boxShadow: '1px 2px 3px rgba(30, 30, 30, 1)',
                  }}
                />
              ) : (
                <img
                  src="https://media.istockphoto.com/id/1827161900/vector/black-man-with-headphones-guy-profile-avatar-african-man-listen-to-music-on-headphones.jpg?s=612x612&w=0&k=20&c=_t2-yhOSi4yt6IrFo1SYriRjiBqjYkk_YyYpZogmW50="
                  alt="Default Banner"
                  className="w-[268px] h-[268px] object-contain p-0 rounded-[8px] square-img"
                />
              )}

              <div className="BannerText">
                {typeof title === 'string' ? <SectionTitle title1={title} title2={filterType} /> : title}
                <p className="btext">Discover the latest hits and timeless classics.</p>

                {loading ? (
                  <p className="bts">Loading...</p>
                ) : (
                  <p className="bts">{filtered.length} songs</p>
                )}
              </div>

              <div
                className="playbutton"
                onClick={() => playAll(filtered)}
                style={{
                  cursor: 'pointer',
                  padding: '12px 24px',
                  borderRadius: '50px',
                  color: 'white',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '2px solid white',
                }}
              >
                <p className="playall" style={{ margin: 0 }}>
                  Play All
                </p>
                <PlayCircleOutlined className="playicon" />
              </div>
            </div>
          </div>
        </div>

        <div className="SongList mt-5">
          <table className="table-auto w-full text-left text-white">
            <thead>
              <tr className="text-gray-300/80">
                <th className="pl-2">#</th>
                <th>Song</th>
                <th>Release</th>
                <th>Album</th>
                {filterType === 'all' && <th>Views</th>}
                <th>Time</th>
                <th>Like</th>
                <th>Playlist</th>
                <th></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700/50 gap-2">
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-200/80">
                    Không có bài hát nào.
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => {
                  const songId = getSongId(s);
                  const artistName = getArtistName(s);
                  const albumTitle = getAlbumTitle(s);
                  const isFav = isFavorite(songId);

                  return (
                    <tr key={songId || `row-${i}`} className="hover:bg-gray-800/30">
                      <td className="pl-2 align-middle py-3 text-gray-300">{i + 1}</td>

                      <td className="py-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={getSongImg(s)}
                            alt={s?.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <div className="font-semibold text-white">{s?.title || '-'}</div>
                            <div className="text-sm text-gray-400">{artistName}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-2 text-gray-300">
                        {s?.release_date || s?.releaseDate || s?.releaseYear || '-'}
                      </td>

                      <td className="py-2 text-gray-300">{albumTitle}</td>

                      {filterType === 'all' && (
                        <td className="py-2 text-gray-300">
                          {formatNumber(s?.viewCount || s?.views || 0)}
                        </td>
                      )}

                      <td className="py-2 text-gray-300">{s?.duration || '-'}</td>

                      {/* FAVORITE */}
                      <td className="py-2 text-gray-300">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (!isLoggedIn) {
                              navigate('/login', { state: { from: location } });
                              return;
                            }

                            if (!songId) {
                              toast.error('Thiếu ID bài hát hợp lệ');
                              return;
                            }

                            toggleFavorite(songId);
                          }}
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          {isFav ? (
                            <HeartFilled style={{ color: 'red', fontSize: '1.25rem' }} />
                          ) : (
                            <HeartTwoTone twoToneColor="#eb2f96" style={{ fontSize: '1.25rem' }} />
                          )}
                        </button>
                      </td>

                      {/* ADD TO PLAYLIST */}
                      <td className="py-2 text-gray-300 relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLoggedIn) {
                              navigate('/login', { state: { from: location } });
                              return;
                            }
                            if (!songId) {
                              toast.error('Thiếu ID bài hát hợp lệ');
                              return;
                            }
                            setShowPlaylistDropdown(showPlaylistDropdown === songId ? null : songId);
                            setShowCreatePlaylist(false);
                          }}
                          title="Add to playlist"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <PlusOutlined style={{ fontSize: '1.25rem' }} />
                        </button>

                        {showPlaylistDropdown === songId && (
                          <>
                            <div
                              style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 998,
                              }}
                              onClick={() => {
                                setShowPlaylistDropdown(null);
                                setShowCreatePlaylist(false);
                                setNewPlaylistName('');
                              }}
                            />

                            <div
                              style={{
                                position: 'absolute',
                                top: '100%',
                                right: '0',
                                marginTop: '8px',
                                background:
                                  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                                border: '1px solid rgba(238, 16, 176, 0.3)',
                                borderRadius: '8px',
                                minWidth: '220px',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                zIndex: 999,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: 700 }}>Playlists</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowCreatePlaylist((v) => !v);
                                    }}
                                    style={{
                                      background: '#EE10B0',
                                      border: 'none',
                                      color: 'white',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: 12,
                                    }}
                                  >
                                    + New
                                  </button>
                                </div>

                                {showCreatePlaylist && (
                                  <div style={{ marginTop: 10 }}>
                                    <input
                                      type="text"
                                      placeholder="Tên playlist..."
                                      value={newPlaylistName}
                                      onChange={(e) => setNewPlaylistName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') createNewPlaylist(songId);
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(238, 16, 176, 0.3)',
                                        borderRadius: '6px',
                                        color: 'white',
                                        fontSize: 12,
                                        outline: 'none',
                                      }}
                                      autoFocus
                                    />

                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                      <button
                                        onClick={() => createNewPlaylist(songId)}
                                        style={{
                                          flex: 1,
                                          padding: '6px 10px',
                                          background: '#EE10B0',
                                          border: 'none',
                                          borderRadius: '6px',
                                          color: 'white',
                                          fontSize: 12,
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Tạo
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowCreatePlaylist(false);
                                          setNewPlaylistName('');
                                        }}
                                        style={{
                                          flex: 1,
                                          padding: '6px 10px',
                                          background: '#666',
                                          border: 'none',
                                          borderRadius: '6px',
                                          color: 'white',
                                          fontSize: 12,
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Hủy
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {userPlaylists.length === 0 ? (
                                <div style={{ padding: 14, textAlign: 'center', color: '#aaa', fontSize: 12 }}>
                                  Chưa có playlist nào
                                </div>
                              ) : (
                                userPlaylists.map((pl) => {
                                  const pid = playlistIdOf(pl);
                                  const songsArr = Array.isArray(pl?.songs) ? pl.songs : [];
                                  const ids = songsArr.map((x) => normalizeId(x?._id || x?.id || x)).filter(Boolean);
                                  const isIn = ids.includes(songId);

                                  return (
                                    <div
                                      key={pid}
                                      onClick={() => {
                                        if (isIn) return;
                                        addToPlaylist(songId, pid);
                                        setShowPlaylistDropdown(null);
                                      }}
                                      style={{
                                        padding: '10px 12px',
                                        cursor: isIn ? 'default' : 'pointer',
                                        color: isIn ? '#999' : 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        fontSize: 13,
                                        opacity: isIn ? 0.6 : 1,
                                      }}
                                    >
                                      <span>{playlistNameOf(pl)}</span>
                                      {isIn && <CheckOutlined style={{ color: '#EE10B0' }} />}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </>
                        )}
                      </td>

                      <td className="py-2 text-right pr-4">
                        <button
                          onClick={() => playSong(s, filtered)}
                          title="Play song"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '4px',
                            color: 'white',
                          }}
                        >
                          <PlayCircleOutlined style={{ fontSize: '1.25rem' }} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FilteredSongsTable;
