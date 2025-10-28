// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';

// import TopBar from '../components/layout/TopBar';
// import Footer from '../components/layout/Footer';
// import PlaylistDropdown from '../components/common/PlaylistDropdown';
// import LikeButton from '../components/common/LikeButton';
// import CommentBox from '../components/common/CommentBox';

// import '../style/Layout.css';
// import './SongPlayer.css';

// const SongPlayer = () => {
//     const { id } = useParams();
//     const [song, setSong] = useState(null);

//     useEffect(() => {
//         axios.get(`http://localhost:4000/songs/${id}`)
//             .then(res => setSong(res.data))
//             .catch(err => console.error('Lỗi khi lấy bài hát:', err));
//     }, [id]);

//     if (!song) return <p>Đang tải bài hát...</p>;

//     return (
//         <div className="container">
//             <TopBar />

//             <div className="content">
//                 <div className="video-section" style={{ marginBottom: '30px' }}>
//                     <iframe
//                         width="100%"
//                         height="400"
//                         src={song.video_url}
//                         title={`Video của ${song.title}`}
//                         frameBorder="0"
//                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                         allowFullScreen
//                     ></iframe>
//                 </div>

//                 <div className="song-info" style={{
//                     display: 'flex',
//                     gap: '20px',
//                     padding: '30px',
//                     borderRadius: '12px',
//                     background: '#2a2a3a',
//                     color: 'white',
//                     justifyContent: 'center',
//                     alignItems: 'center'
//                 }}>
//                     <img
//                         src={song.cover_url}
//                         alt={song.title}
//                         style={{ width: '100px', height: '100px', borderRadius: '12px' }}
//                     />

//                     <div style={{ flex: 1 }}>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                             <div>
//                                 <h2>{song.title}</h2>
//                                 <p><strong></strong> {song.artist}</p>
//                             </div>

//                             <div style={{ 
//                                 display: 'flex', 
//                                 gap: '12px', 
//                                 alignItems: 'center'
//                                 }}>
//                                 <LikeButton song={song} />
//                                 <PlaylistDropdown songId={song.id} />
//                             </div>
//                         </div>

//                         <p style={{ marginTop: '12px', fontStyle: 'italic' }}>
//                             {/* <strong>Lời bài hát:</strong> {song.lyrics} */}
//                         </p>
//                     </div>
//                 </div>


//                 <div style={{
//                     marginTop: '30px',
//                     background: '#2a2a3a',
//                     padding: '20px',
//                     borderRadius: '12px',
//                     color: 'white'
//                 }}>
//                     <CommentBox songId={song.id} />
//                 </div>



//             </div>

//             <Footer />
//         </div>
//     );
// };

// export default SongPlayer;
