import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';

export default function usePlaylistManager() {
    const { user, login, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // 🎯 State quản lý popup và form
    const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
    const [selectedSongId, setSelectedSongId] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

    // 🧠 Load playlists từ user
    useEffect(() => {
        if (user?.playlists) {
            setUserPlaylists(Array.isArray(user.playlists) ? user.playlists : []);
        }
    }, [user]);

    // 🔓 Mở popup thêm playlist
    const openPopup = (songId) => {
        if (!isLoggedIn) {
            navigate('/login', { state: { from: location } });
            return;
        }
        console.log("🔔 openPopup called with songId:", songId);
        setSelectedSongId(songId);
        setShowPlaylistPopup(true);
    };

    // ❌ Đóng popup
    const closePopup = () => {
        setShowPlaylistPopup(false);
        setShowCreatePlaylist(false);
        setNewPlaylistName('');
    };

    // ➕ Thêm bài hát vào playlist
    const addToPlaylist = async (songId, playlistId) => {
        try {
            const updatedPlaylists = userPlaylists.map((playlist) => {
                if (playlist.id === playlistId && !playlist.songs.includes(songId)) {
                    return { ...playlist, songs: [...playlist.songs, songId] };
                }
                return playlist;
            });

            setUserPlaylists(updatedPlaylists);
            login({ ...user, playlists: updatedPlaylists });

            await fetch(`http://localhost:4000/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlists: updatedPlaylists }),
            });

            const playlistName = updatedPlaylists.find(p => p.id === playlistId)?.name || 'playlist';
            toast.success(`✅ Đã thêm bài hát vào "${playlistName}"`);
            closePopup();
        } catch (err) {
            toast.error('❌ Không thể thêm vào playlist. Vui lòng thử lại.');
        }
    };

    // 🆕 Tạo playlist mới và thêm bài hát
    const createNewPlaylist = async (songId) => {
        if (!newPlaylistName.trim()) {
            toast.error('⚠️ Vui lòng nhập tên playlist');
            return;
        }

        try {
            const newPlaylist = {
                id: `pl_${Date.now()}`,
                name: newPlaylistName.trim(),
                songs: [songId],
                createdAt: new Date().toISOString()
            };

            const updatedPlaylists = [...userPlaylists, newPlaylist];
            setUserPlaylists(updatedPlaylists);
            login({ ...user, playlists: updatedPlaylists });

            await fetch(`http://localhost:4000/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlists: updatedPlaylists }),
            });

            toast.success(`🎉 Đã tạo playlist "${newPlaylistName}" và thêm bài hát`);
            closePopup();
        } catch (err) {
            toast.error('❌ Không thể tạo playlist. Vui lòng thử lại.');
        }
    };

    return {
        showPlaylistPopup,
        selectedSongId,
        userPlaylists,
        newPlaylistName,
        showCreatePlaylist,
        setNewPlaylistName,
        setShowCreatePlaylist,
        openPopup,
        closePopup,
        addToPlaylist,
        createNewPlaylist
    };
}
