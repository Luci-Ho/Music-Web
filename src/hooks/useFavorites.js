import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useAuth from './useAuth';
import favoriteService from '../services/favorite.service';

/**
 * Custom hook for managing user favorites
 * @returns {object} { favorites, toggleFavorite, isFavorite }
 */
const useFavorites = () => {
  const { user, login, isLoggedIn } = useAuth();
  const [favorites, setFavorites] = useState([]);

  // Load favorites từ backend khi user thay đổi
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await favoriteService.getFavorites();
        setFavorites(res.data); // backend trả về mảng favorites
        login({ ...user, favorites: res.data });
      } catch (err) {
        toast.error('❌ Không thể tải danh sách yêu thích');
      }
    };
    fetchFavorites();
  }, [isLoggedIn, user, login]);

  const toggleFavorite = async (songId) => {
    if (!isLoggedIn) {
      toast.error('Bạn cần đăng nhập để thêm vào yêu thích!');
      return;
    }

    const isFav = favorites.some(fav => fav._id === songId || fav === songId);
    const updated = isFav
      ? favorites.filter(fav => (fav._id || fav) !== songId)
      : [...favorites, songId];
    const prev = favorites;

    // Optimistic update
    setFavorites(updated);
    login({ ...user, favorites: updated });

    try {
      const res = await favoriteService.toggleFavorite(songId);

      const serverFavorites = res.data.favorites; // backend trả về { action, favorites }
      setFavorites(serverFavorites);
      login({ ...user, favorites: serverFavorites });

      toast.success(res.data.action === 'added'
        ? ' Đã thêm vào yêu thích'
        : ' Đã xóa khỏi yêu thích'
      );
    } catch (err) {
      console.error("Toggle favorite failed:", err);

      // Rollback
      setFavorites(prev);
      const rollbackUser = { ...user, favorites: prev };
      login(rollbackUser);

      try {
        window.dispatchEvent(new Event('userUpdated'));
      } catch (e) {
        console.error("Dispatch userUpdated failed:", e);
      }

      toast.error('Không thể cập nhật yêu thích. Vui lòng thử lại.');
    }

  };

  const isFavorite = (songId) =>
    favorites.some(fav => fav._id === songId || fav === songId);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  };
};

export default useFavorites;
