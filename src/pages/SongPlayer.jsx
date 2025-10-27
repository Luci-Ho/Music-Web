import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import TopBar from '../components/layout/TopBar';
import Footer from '../components/layout/Footer';
import PlaylistDropdown from '../components/common/PlaylistDropdown';

import '../style/Layout.css';
import '../style/SongPlayer.css';

const SongPlayer = () => {
    const { id } = useParams();
    const [song, setSong] = useState(null);

    // State cho tương tác
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        axios.get(`http://localhost:4000/songs/${id}`)
            .then(res => setSong(res.data))
            .catch(err => console.error('Lỗi khi lấy bài hát:', err));
    }, [id]);

    // Xử lý like
    const handleLike = () => {
        console.log("Đã thích bài hát:", song.title);
    };

    // Xử lý thêm vào playlist
    const handleAddToPlaylist = () => {
        navigate(`/playlist/add/${song.id}`);
        console.log("Thêm vào playlist:", song.title);

    };

    // Toggle hiển thị bình luận
    const handleCommentToggle = () => {
        setShowComments(!showComments);
    };

    // Gửi bình luận
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const newComment = {
            user: "Bạn",
            text: commentText.trim()
        };

        setComments([...comments, newComment]);
        setCommentText('');
    };

    if (!song) return <p>Đang tải bài hát...</p>;

    return (
        <div className="container">
            <TopBar />

            <div className="content">

                <div className="video-section" style={{ marginBottom: '30px' }}>
                    <iframe
                        width="100%"
                        height="400"
                        src={song.video_url}
                        title={`Video của ${song.title}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                <div className="song-info" style={{
                    display: 'flex',
                    gap: '20px',
                    background: '#1e1e2f',
                    padding: '30px',
                    borderRadius: '12px',
                    color: 'white'
                }}>
                    <img
                        src={song.cover_url}
                        alt={song.title}
                        style={{ width: '200px', borderRadius: '12px' }}
                    />
                    <div>
                        <h2>{song.title}</h2>
                        <p><strong>Ca sĩ:</strong> {song.artist}</p>
                        <p><strong>Album:</strong> {song.album}</p>
                        <p><strong>Thể loại:</strong> {song.genre}</p>
                        <p><strong>Thời lượng:</strong> {song.duration}</p>
                        <p><strong>Phát hành:</strong> {song.release_date}</p>
                        <p style={{ marginTop: '12px', fontStyle: 'italic' }}>
                            <strong>Lời bài hát:</strong> {song.lyrics}
                        </p>

                        {/* Các nút tương tác */}
                        <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                            <button onClick={handleLike} className="action-btn">❤️ Thích</button>
                            <PlaylistDropdown songId={song.id} />
                            <button onClick={handleCommentToggle} className="action-btn">💬 Bình luận</button>
                        </div>
                    </div>
                </div>

                {showComments && (
                    <div className="comment-section" style={{
                        marginTop: '30px',
                        background: '#2a2a3a',
                        padding: '20px',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <h3>Bình luận</h3>
                        <form onSubmit={handleCommentSubmit}>
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
            </div>

            <Footer />
        </div>
    );
};

export default SongPlayer;
