import React from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const AddToPlaylistButton = ({ songId, isLoggedIn, onClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }
    onClick(songId);
  };

  return (
    <button
      onClick={handleClick}
      className="text-gray-400 hover:text-white transition-colors p-1"
      title="Thêm vào playlist"
      data-song-id={songId}
    >
      <PlusOutlined style={{ fontSize: '1.25rem' }} />
    </button>
  );
};

export default AddToPlaylistButton;
