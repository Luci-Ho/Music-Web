import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useAuth from './useAuth';

/**
 * Custom hook for managing user favorites
 * @returns {object} { favorites, toggleFavorite, isFavorite }
 */
const useFavorites = () => {
  const { user, login, isLoggedIn } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user && Array.isArray(user.favorites)) {
      setFavorites(user.favorites);
    }
  }, [user]);

  const toggleFavorite = async (songId) => {
    if (!isLoggedIn) {
      toast.error('Bạn cần đăng nhập để thêm vào yêu thích!');
      return;
    }

    const isFav = favorites.includes(songId);
    const updated = isFav ? favorites.filter(id => id !== songId) : [...favorites, songId];
    const prev = favorites;
    
    // Optimistic update
    setFavorites(updated);

    // Update user
    const updatedUser = { ...user, favorites: updated };
    login(updatedUser);

    try {
      window.dispatchEvent(new Event('userUpdated'));
    } catch (err) {
      /* ignore */
    }

    // Update backend
    try {
      const res = await fetch(`http://localhost:4000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites: updated }),
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      toast.success(isFav ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
    } catch (err) {
      // Rollback
      setFavorites(prev);
      const rollbackUser = { ...user, favorites: prev };
      login(rollbackUser);
      
      try {
        window.dispatchEvent(new Event('userUpdated'));
      } catch (e) {
        /* ignore */
      }
      
      toast.error('Không thể cập nhật yêu thích. Vui lòng thử lại.');
    }
  };

  const isFavorite = (songId) => favorites.includes(songId);

  return {
    favorites,
    toggleFavorite,
    isFavorite
  };
};

export default useFavorites;