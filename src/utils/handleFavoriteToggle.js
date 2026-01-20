import { toast } from 'react-toastify';
import { favoriteService } from '../services/favorite.service';

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

  // 🚪 Chưa login → đá qua login
  if (!user || !user.id) {
    navigate('/login', { state: { from: location } });
    return;
  }

  // 🧠 Lưu trạng thái cũ (để rollback)
  const prev = favorites;

  // ⚡ Update UI trước cho mượt
  const updated = isFav
    ? favorites.filter(id => id !== songId)
    : [...favorites, songId];

  setFavorites(updated);
  login({ ...user, favorites: updated });

  try {
    // 🚚 GỌI SERVICE 
    const res = await favoriteService.toggle(songId);

    // 🔁 Backend trả favorites mới (chuẩn nhất)
    const newFavorites = res.data.favorites;

    setFavorites(newFavorites);
    login({ ...user, favorites: newFavorites });

    toast.success(
      isFav ? 'Đã bỏ khỏi yêu thích' : 'Đã thêm vào yêu thích'
    );
  } catch (err) {
    // 🔙 Nếu lỗi → quay về như cũ
    setFavorites(prev);
    login({ ...user, favorites: prev });

    toast.error('Không thể cập nhật yêu thích 😭');
  }
};
