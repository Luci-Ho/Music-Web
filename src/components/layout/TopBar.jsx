import React, { useState, useEffect } from 'react';
import '../../style/Layout.css';
import { Avatar } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import use10Clicks from '../../hooks/use10Clicks';
import SearchService from '../../services/search.service';

const TopBar = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const onTenClick = use10Clicks(() => {
    navigate('/login', { state: { openAdmin: true } });
  }, { threshold: 10, resetMs: 800 });

  // 🔍 Search debounce
  useEffect(() => {
    if (!keyword.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await SearchService.searchSongs(keyword);

        const mapped = data.map(song => ({
          id: song._id,
          title: song.title,
          artist: song.artistId?.name
        }));

        setSuggestions(mapped);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
      setSuggestions([]);
    }
  };

  return (
    <div className="TopBar">
      {/* Search */}
      <div className="TopBar-Search">
        <SearchOutlined className="search-icon" />
        <input
          type="text"
          placeholder="Search songs or artists..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {suggestions.length > 0 && (
          <div className="Search-Suggestions">
            {suggestions.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(`/song/${item.id}`)}
              >
                <strong>{item.title}</strong>
                {item.artist && <span> – {item.artist}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="text-4xl font-bold bg-gradient-to-r from-[#ff6b6b] to-[#45b7d1] bg-clip-text text-transparent flex items-center">
        <small>
          {user ? `Hi, ${user.username}! 🎶` : 'Melodies – Where music connects emotions'}
        </small>
      </div>

      {/* User */}
      <div className="TopBar-Menu">
        {!isLoggedIn ? (
          <>
            <button onClick={() => { onTenClick(); navigate('/login'); }}>Login</button>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
          </>
        ) : (
          <div className="user-info">
            <Avatar size="large" src={user?.avatar} icon={!user?.avatar && <UserOutlined />} />
            <span className="username">{user?.username || 'User'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
