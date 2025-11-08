import React, { useState, useEffect, useMemo } from 'react';
import '../../style/Layout.css';
import { Flex, Input, Avatar } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import use10Clicks from '../../hooks/use10Clicks';

const TopBar = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);

  const onTenClick = use10Clicks(() => {
    navigate('/login', { state: { openAdmin: true } });
  }, { threshold: 10, resetMs: 800 });

  const removeVietnameseTones = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");

  // Fetch songs and artists once
  useEffect(() => {
    const fetchData = async () => {
      const [songsRes, artistsRes] = await Promise.all([
        fetch('http://localhost:4000/songsList'),
        fetch('http://localhost:4000/artists')
      ]);
      setSongs(await songsRes.json());
      setArtists(await artistsRes.json());
    };
    fetchData();
  }, []);

  // Join artist name into songs
  const songsWithArtistName = useMemo(() => {
    return songs.map(song => {
      const artist = artists.find(a => a.id === song.artistId);
      return {
        ...song,
        artist: artist?.name || ''
      };
    });
  }, [songs, artists]);

  // Normalize keyword
  const normalizedKeyword = useMemo(() => {
    return removeVietnameseTones(keyword.toLowerCase());
  }, [keyword]);

  // Filter suggestions
  const suggestions = useMemo(() => {
    if (!normalizedKeyword || songsWithArtistName.length === 0) return [];

    return songsWithArtistName
      .filter(song =>
        removeVietnameseTones(song.title.toLowerCase()).includes(normalizedKeyword) ||
        removeVietnameseTones(song.artist.toLowerCase()).includes(normalizedKeyword)
      )
      .map(song => {
        const isTitleMatch = removeVietnameseTones(song.title.toLowerCase()).includes(normalizedKeyword);
        const isArtistMatch = removeVietnameseTones(song.artist.toLowerCase()).includes(normalizedKeyword);
        return {
          id: song.id,
          display: isTitleMatch ? song.title : song.artist
        };
      });
  }, [normalizedKeyword, songsWithArtistName]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <div className="TopBar">
      {/* Phần Search */}
      <div className="TopBar-Search">
        <SearchOutlined className="search-icon" />
        <input
          type="text"
          aria-label="Search songs or artists"
          placeholder="Search..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {suggestions.length > 0 && (
          <div className="Search-Suggestions">
            {suggestions.map(item => (
              <div key={item.id} onClick={() => navigate(`/song/${item.id}`)}>
                {item.display}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phần Menu */}
      {/* <div className="TopBar-Menu">
        <p>About</p>
        <p>Contact</p>
        <p>Premium</p>
      </div> */}
      <div className="text-4xl font-bold bg-gradient-to-r from-[#ff6b6b] to-[#45b7d1] bg-clip-text text-transparent flex items-center">
          <small>{user ? `Hi, ${user.username}! 🎶` : 'Melodies – Where music connects emotions'}</small>
      </div>

      <div className="TopBar-Menu">
        {!isLoggedIn ? (
          <>
            <button onClick={() => { onTenClick(); navigate('/login'); }}>Login</button>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
          </>
        ) : (
          <div className="user-info">
            <Avatar size="large" src={user?.avatar} icon={!user?.avatar && <UserOutlined />} />
            <span className="username">{user?.username || user?.name || 'User'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
