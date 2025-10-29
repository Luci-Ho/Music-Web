import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const LikeButton = ({ song }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, login } = useAuth();

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const favs = user && Array.isArray(user.favorites) ? user.favorites : [];
    setLiked(favs.includes(song.id));
  }, [song.id, user]);

  const handleLike = async (e) => {
    e && e.preventDefault();
    e && e.stopPropagation();

    if (!isLoggedIn) {
      toast.info('Bạn cần đăng nhập để thích bài hát!');
      navigate('/login', { state: { from: location } });
      return;
    }

    const favs = user && Array.isArray(user.favorites) ? user.favorites : [];
    const isFav = favs.includes(song.id);

    // optimistic
    const updated = isFav ? favs.filter(id => id !== song.id) : [...favs, song.id];
    const prev = favs;
    setLiked(!isFav);

    // update local user and persist to localStorage via login()
    const updatedUser = { ...(user || {}), favorites: updated };
    login(updatedUser);
    try { window.dispatchEvent(new Event('userUpdated')); } catch (err) { /* ignore */ }

    // persist to backend
    const API_USERS = 'http://localhost:4000/users';
    try {
      const res = await fetch(`${API_USERS}/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorites: updated }),
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      toast.success(isFav ? 'Đã bỏ thích bài hát' : 'Đã thích bài hát!');
    } catch (err) {
      // rollback
      setLiked(isFav);
      const rollbackUser = { ...(user || {}), favorites: prev };
      login(rollbackUser);
      try { window.dispatchEvent(new Event('userUpdated')); } catch (e) { /* ignore */ }
      console.error('Failed to persist favorite', err);
      toast.error('Không thể cập nhật yêu thích. Vui lòng thử lại.');
    }
  };

  return (
    <button
      onClick={handleLike}
      style={{
        background: 'none',
        border: 'none',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => { e.target.style.boxShadow = '0 0 8px #ff00cc, 0 0 12px #ff00cc'; }}
      onMouseLeave={(e) => { e.target.style.boxShadow = 'none'; }}
    >
      {liked ? '💖 Đã thích' : '🤍 Thích'}
    </button>
  );
};

export default LikeButton;
