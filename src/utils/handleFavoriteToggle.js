import { toast } from 'react-toastify';

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

  if (!user || !user.id) {
    navigate('/login', { state: { from: location } });
    return;
  }

  const updated = isFav
    ? favorites.filter(id => id !== songId)
    : [...favorites, songId];
  const prev = favorites;
  setFavorites(updated);

  const updatedUser = { ...user, favorites: updated };
  login(updatedUser);
  try {
    window.dispatchEvent(new Event('userUpdated'));
  } catch (err) {}

  const API_USERS = 'http://localhost:5000/users';
  try {
    const res = await fetch(`${API_USERS}/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorites: updated }),
    });

    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
  } catch (err) {
    setFavorites(prev);
    const rollbackUser = { ...user, favorites: prev };
    login(rollbackUser);
    try {
      window.dispatchEvent(new Event('userUpdated'));
    } catch (e) {}
    toast.error('Không thể cập nhật yêu thích. Vui lòng thử lại.');
  }
};
