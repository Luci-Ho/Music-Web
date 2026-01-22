import { toast } from 'react-toastify';
import favoriteService from '../services/favorite.service';

export const handleFavoriteToggle = async ({
  e,
  songId,
  isFav,
  favorites,
  setFavorites,
  user,
  login,
  navigate,
  location,
}) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // 🚪 Nếu chưa login → chuyển qua trang login
  if (!user || !user.id) {
    navigate('/login', { state: { from: location } });
    return;
  }

  // 🧠 Lưu trạng thái cũ (để rollback nếu lỗi)
  const prev = favorites;

  // ⚡ Optimistic update UI
  const updated = isFav
    ? favorites.filter(id => id !== songId)
    : [...favorites, songId];

  setFavorites(updated);
  login({ ...user, favorites: updated });
  console.log("SongId:", songId);

  try {
    // 🚚 Gọi API toggle favorite
    const res = await favoriteService.toggleFavorite(songId);

    // 🔁 Backend trả về danh sách favorites mới
    const newFavorites = res.data.favorites;

    setFavorites(newFavorites);
    login({ ...user, favorites: newFavorites });

    toast.success(
      res.data.action === 'added'
        ? '💖 Đã thêm vào yêu thích'
        : '💔 Đã bỏ khỏi yêu thích'
    );
  } catch (err) {
    // 🔙 Rollback nếu lỗi
    setFavorites(prev);
    login({ ...user, favorites: prev });

    console.error("❌ Toggle favorite failed:", err.response?.data || err.message);
    toast.error('Không thể cập nhật yêu thích 😭');
  }
};
