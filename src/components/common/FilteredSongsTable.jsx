import React, { useState, useEffect, useMemo } from 'react';
import data from '../../routes/db.json';
import '../../style/VA.css';
import '../../style/Layout.css'
import { PlayCircleOutlined, HeartFilled, HeartTwoTone } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import SectionTitle from './SectionTitle';
import TopBar from '../layout/TopBar';
import { removeVietnameseTones } from '../../utils/StringUtils';
import { useContext } from 'react';
import { AppContext } from '../common/AppContext'; // đường dẫn đúng tới AppContext
import formatNumber from '../../hooks/formatNumber';


/**
 * FilteredSongsTable
 * props:
 *  - filterType: 'genre' | 'mood' | 'artist'
 *  - filterId: id string to filter by (e.g. 'g101', 'm201', 'a301')
 *  - title: optional title to show above the table
 */
const FilteredSongsTable = ({ filterType = 'genre', filterId, title }) => {
    const songs = data.songsList || [];
    const artists = data.artists || [];
    const albums = data.albums || [];
    const navigate = useNavigate();
    const { selectSong, playAll, playSong } = useContext(AppContext);

    // banner image depends on the selected filter entry
    let bannerImg = null;
    if (filterType === 'genre') {
        bannerImg = (data.genres || []).find(g => g.id === filterId)?.img;
    } else if (filterType === 'mood') {
        bannerImg = (data.moods || []).find(m => m.id === filterId)?.img;
    } else if (filterType === 'artist') {
        bannerImg = (data.artists || []).find(a => a.id === filterId)?.img;
    }

    // build maps for quick lookup
    const artistMap = useMemo(() => Object.fromEntries((artists || []).map(a => [a.id, a.name])), [artists]);
    const albumMap = useMemo(() => Object.fromEntries(albums.map(a => [a.id, a.title])), [albums]);


    // auth
    const { user, isLoggedIn, login } = useAuth();
    const location = useLocation();
    const [favorites, setFavorites] = useState(() => (user && Array.isArray(user.favorites) ? user.favorites : []));


    useEffect(() => {
        setFavorites(user && Array.isArray(user.favorites) ? user.favorites : []);
    }, [user]);

    const filtered = React.useMemo(() => {
        let result = [];
        
        // favorites doesn't require a filterId — it uses the current user's favorites
        if (filterType === 'favorites') {
            result = songs.filter(s => Array.isArray(user?.favorites) && user.favorites.includes(s.id));
        } else if (filterType === 'all') {
            // Show all songs
            result = songs;
        } else {
            if (!filterId) return [];

            switch (filterType) {
                case 'genre':
                    result = songs.filter(s => s.genreId === filterId || String(s.genre).toLowerCase() === String(filterId).toLowerCase());
                    break;
                case 'mood':
                    result = songs.filter(s => s.moodId === filterId);
                    break;
                case 'artist':
                    result = songs.filter(s => s.artistId === filterId || String(s.artist).toLowerCase() === String(filterId).toLowerCase());
                    break;
                case 'search':
                    const normalizedKeyword = removeVietnameseTones(String(filterId).toLowerCase());
                    result = songs.filter(s => {
                        const title = removeVietnameseTones(String(s.title || '').toLowerCase());
                        const artistName = removeVietnameseTones(String(artistMap[s.artistId] || '').toLowerCase());
                        return title.includes(normalizedKeyword) || artistName.includes(normalizedKeyword);
                    });
                    break;
                default:
                    result = [];
            }
        }

        // Sort by views (highest first) if filterType is 'all'
        if (filterType === 'all') {
            result = result.sort((a, b) => (parseInt(b.views) || 0) - (parseInt(a.views) || 0));
        }

        return result;
    }, [songs, filterType, filterId, user, artistMap]);

    return (
        <div className="bg-[#2576d2]  bg-gradient-to-r from-blue-900 to-gray-700 p-0 content">
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
                                        boxShadow: "1px 2px 3px rgba(30, 30, 30, 1)"
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
                                {typeof title === 'string'
                                    ? <SectionTitle title1={title} title2={filterType} />
                                    : title}

                                <p className="btext">Discover the latest hits and timeless classics.</p>
                                <p className="bts">{filtered.length} songs</p>
                            </div>
                            <div className="playbutton" onClick={() => playAll(filtered)}>
                                <p className="playall">Play All</p>
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
                                <th></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50 gap-2">
                            {filtered.map((s, i) => {
                                const albumTitle = s.album || albumMap[s.albumId] || '-';
                                const artistName = artistMap[s.artistId] || s.artist || '-';
                                const isFav = favorites.includes(s.id);

                                const toggleFavorite = async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    if (!isLoggedIn) {
                                        // require login; send user to login page and preserve return location
                                        navigate('/login', { state: { from: location } });
                                        return;
                                    }

                                    // optimistic update
                                    const updated = isFav ? favorites.filter(id => id !== s.id) : [...favorites, s.id];
                                    const prev = favorites;
                                    setFavorites(updated);

                                    // update local user copy and persist locally
                                    const updatedUser = { ...(user || {}), favorites: updated };
                                    login(updatedUser);
                                    try { window.dispatchEvent(new Event('userUpdated')); } catch (err) { /* ignore */ }

                                    // persist to backend (json-server style)
                                    const API_USERS = 'http://localhost:4000/users';
                                    try {
                                        const res = await fetch(`${API_USERS}/${user.id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ favorites: updated }),
                                        });

                                        if (!res.ok) throw new Error(`Server responded ${res.status}`);

                                        toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
                                    } catch (err) {
                                        // rollback
                                        setFavorites(prev);
                                        const rollbackUser = { ...(user || {}), favorites: prev, favorite: prev };
                                        login(rollbackUser);
                                        try { window.dispatchEvent(new Event('userUpdated')); } catch (e) { /* ignore */ }
                                        toast.error('Không thể cập nhật yêu thích. Vui lòng thử lại.');
                                    }
                                };

                                return (
                                    <tr key={s.id || i} className={"hover:bg-gray-800/30"}>
                                        <td className="pl-2 align-middle py-3 text-gray-300">{i + 1}</td>
                                        <td className="py-2 ">
                                            <div className="flex items-center gap-3">
                                                <img src={s.img || s.cover_url || s.cover || "https://via.placeholder.com/48?text=No+Image"} alt={s.title} className="w-12 h-12 rounded object-cover" />
                                                <div>
                                                    <div className="font-semibold text-white">{s.title}</div>
                                                    <div className="text-sm text-gray-400">{artistName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2 text-gray-300 ">{s.release_date || s.releaseYear || '-'}</td>
                                        <td className="py-2 text-gray-300">{albumTitle}</td>
                                        {filterType === 'all' && <td className="py-2 text-gray-300">{formatNumber(s.views || 0)}</td>}
                                        <td className="py-2 text-gray-300 ">{s.duration || '-'}</td>
                                        <td className="py-2 text-gray-300">
                                            <button
                                                onClick={toggleFavorite}
                                                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                                {isFav ? <HeartFilled style={{ color: 'red', fontSize: '1.25rem' }} /> : <HeartTwoTone twoToneColor="#eb2f96" style={{ fontSize: '1.25rem' }} />}
                                            </button>
                                        </td>

                                        <td className="py-2 text-right pr-4">
                                            <button
                                                onClick={() => playSong(s, filtered)}
                                                title="Play song"
                                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                                            >
                                                <PlayCircleOutlined style={{ fontSize: '1.25rem', color: '#f63391' }} />
                                            </button>
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FilteredSongsTable;
