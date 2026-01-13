// import React, { useEffect, useState } from "react";
// import { useNavigate } from 'react-router-dom';
// import '../style/VA.css';
// import '../style/Layout.css' 
// import { UserOutlined, LeftOutlined, PlayCircleOutlined } from '@ant-design/icons';
// import { Avatar } from "antd";

// import SectionTitle from "../components/common/SectionTitle";
// import data from "../routes/db.json";

// const List = ({ source }) => {
//     const navigate = useNavigate()
//     const [data, setData] = useState(null);

//     const [artists, setArtists] = React.useState([]);
//     const [error, setError] = React.useState(null);

// useEffect(() => {
//     setData(dataSource);
// }, [dataSource]);

// return (
//     <div className="bg-[#1171E2] rounded-lg bg-gradient-to-r from-blue-600 to-gray-700 p-0 content">
//         <div className="bluebox ">
//             <div className="TopPart bg-gradient-to-r from-blue-400 to-gray-600 rounded-lg p-5">
//                 <div className="top1">
//                     <LeftOutlined className="iconback" onClick={() => navigate(-1)} />
//                     <div className="Tag">
//                         <p>Share</p>
//                         <p>About</p>
//                         <p>Premium</p>
//                         <Avatar style={{ backgroundColor: '#adadad' }} icon={<UserOutlined />} />
//                     </div>
//                 </div>
//                 <div className="top2">
//                     <div className="BannerPart">
//                         <img src={require("../assets/banner.jpg")} alt="Banner" className="w-[268px] h-[268px]" />
//                         <div className="BannerText">
//                             <SectionTitle title1={"Trending Song"} title2={"mix"} />
//                             <p className="btext">Discover the latest hits and timeless classics.</p>
//                             <p className="bts">20 songs : 1h 36m</p>
//                         </div>
//                         <div className="playbutton">
//                             <p className="playall"> Play All</p>
//                             <PlayCircleOutlined className="playicon" />
//                         </div>
//                     </div>
//                 </div>
//             </div> 
            
//             <div className="SongList mt-5">
//                 <table className="table-auto w-full text-left text-white">
//                     <thead>
//                         <tr className="text-gray-300/80">
//                             <th className="pl-2">#</th>
//                             <th>Song</th>
//                             <th>Release</th>
//                             <th>Album</th>
//                             <th>Time</th>
//                             <th></th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-700/50 gap-2">
//                         {(() => {
//                             const songs = data.songsList || [];
//                             const artists = data.artists || [];
//                             const albums = data.albums || [];
//                             const artistMap = React.useMemo(
//                                 () => Object.fromEntries(artists.map(a => [a._id, a.name])),
//                                 [artists]
//                             );

//                             return songs.map((s, i) => {
//                                 // find album title if an album contains this song id
//                                 const albumObj = albums.find(al => Array.isArray(al.songs) && al.songs.includes(s._id));
//                                 const albumTitle = albumObj ? albumObj.title : s.album || "-";
//                                 const artistName = artistMap[s.artistId] || s.artist || "-";

//                                 return (
//                                     <tr key={s._id} className={"hover:bg-gray-800/30"}>
//                                         <td className="pl-2 align-middle py-3 text-gray-300">{i + 1}</td>
//                                         <td className="py-2 ">
//                                             <div className="flex items-center gap-3">
//                                                 <img src={s.img || s.cover_url || "https://via.placeholder.com/48?text=No+Image"} alt={s.title} className="w-12 h-12 rounded object-cover" />
//                                                 <div>
//                                                     <div className="font-semibold text-white">{s.title}</div>
//                                                     <div className="text-sm text-gray-400">{artistName}</div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="py-2 text-gray-300">{s.release_date || s.releaseYear || "-"}</td>
//                                         <td className="py-2 text-gray-300">{albumTitle}</td>
//                                         <td className="py-2 text-gray-300">{s.duration || "-"}</td>
//                                         <td className="py-2 text-right pr-4">
//                                             <PlayCircleOutlined className="text-2xl text-pink-500 hover:text-pink-400 cursor-pointer" />
//                                         </td>
//                                     </tr>
//                                 );
//                             });
//                         })()}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     </div>
// );
// };
// export default List;