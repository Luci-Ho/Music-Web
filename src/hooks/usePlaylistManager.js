import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';

// import các hàm từ playlist.service
import {
    getUserPlaylists,
    createPlaylist,
    updatePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
} from '../services/playlist.service.js';

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
            await addSongToPlaylist(playlistId, songId);

            const updatedPlaylists = userPlaylists.map((playlist) => {
                if (playlist._id === playlistId && !playlist.songs.includes(songId)) {
                    return { ...playlist, songs: [...playlist.songs, songId] };
                }
                return playlist;
            });

            setUserPlaylists(updatedPlaylists);
            login({ ...user, playlists: updatedPlaylists });

            const playlistName = updatedPlaylists.find(p => p._id === playlistId)?.name || 'playlist';
            toast.success(`✅ Đã thêm bài hát vào "${playlistName}"`);
            closePopup();
        } catch (err) {
            console.log("Song object:", song);

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
                name: newPlaylistName.trim(),
                songs: [songId],
            };

            const res = await createPlaylist(newPlaylist);

            const updatedPlaylists = [...userPlaylists, res.data];
            setUserPlaylists(updatedPlaylists);
            login({ ...user, playlists: updatedPlaylists });

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
