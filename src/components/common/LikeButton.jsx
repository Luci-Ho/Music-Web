import React from 'react';
import { HeartFilled, HeartTwoTone } from '@ant-design/icons';

const LikeButton = ({ isFav, onClick }) => {
  return (
    <button
      onClick={onClick}
      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {isFav ? (
        <HeartFilled style={{ color: 'red', fontSize: '1.25rem' }} />
      ) : (
        <HeartTwoTone twoToneColor="#eb2f96" style={{ fontSize: '1.25rem' }} />
      )}
    </button>
  );
};

export default LikeButton;
