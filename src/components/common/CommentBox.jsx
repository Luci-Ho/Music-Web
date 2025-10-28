import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { isLoggedIn, getUser } from '../../utils/auth';

const CommentBox = ({ songId }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [show, setShow] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      toast.error('Bạn cần đăng nhập để bình luận!');
      return;
    }

    if (!commentText.trim()) return;

    const user = getUser();
    const newComment = {
      user: user.username || user.email,
      text: commentText.trim()
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  return (
    <>
      <button onClick={() => setShow(!show)} className="action-btn">💬 Bình luận</button>

      {show && (
        <div className="comment-section" style={{
          marginTop: '30px',
          background: '#2a2a3a',
          padding: '20px',
          borderRadius: '12px',
          color: 'white'
        }}>
          <h3>Bình luận</h3>
          <form onSubmit={handleSubmit}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              rows={3}
              style={{ width: '100%', borderRadius: '8px', padding: '10px' }}
            />
            <button type="submit" style={{ marginTop: '10px' }}>Gửi</button>
          </form>

          <ul style={{ marginTop: '20px' }}>
            {comments.map((cmt, idx) => (
              <li key={idx} style={{ marginBottom: '10px' }}>
                <strong>{cmt.user}</strong>: {cmt.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default CommentBox;
