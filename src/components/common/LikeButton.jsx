import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { isLoggedIn } from '../../utils/auth';

const LikeButton = ({ song }) => {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    setLiked(likedSongs.includes(song.id));
  }, [song.id]);

  const handleLike = () => {
    if (!isLoggedIn()) {
      toast.error('Bạn cần đăng nhập để thích bài hát!');
      return;
    }

    const likedSongs = JSON.parse(localStorage.getItem('likedSongs') || '[]');
    let updated;

    if (liked) {
      updated = likedSongs.filter(id => id !== song.id);
      toast.info('Đã bỏ thích bài hát');
    } else {
      updated = [...likedSongs, song.id];
      toast.success('Đã thích bài hát!');
    }

    localStorage.setItem('likedSongs', JSON.stringify(updated));
    setLiked(!liked);
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
  onMouseEnter={(e) => {
    e.target.style.boxShadow = '0 0 8px #ff00cc, 0 0 12px #ff00cc';
  }}
  onMouseLeave={(e) => {
    e.target.style.boxShadow = 'none';
  }}
>
  {liked ? '💖 Đã thích' : '🤍 Thích'}
</button>

  );
};

export default LikeButton;
