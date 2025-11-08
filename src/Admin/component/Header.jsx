import React, { useState, useEffect, useMemo } from 'react';
import { Input, Button, Avatar, Select, AutoComplete } from 'antd';
import { SearchOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const user = JSON.parse(localStorage.getItem('adminuser'));

export default function Header({ query, setQuery }) {
    const { userLevel, setUserLevel, setCurrentUser } = useAuth("l1");
    const [searchResults, setSearchResults] = useState([]);
    const [allData, setAllData] = useState({
        songs: [],
        artists: [],
        albums: [],
        users: []
    });
    const [loading, setLoading] = useState(false);

    // Load all data for search
    useEffect(() => {
        const loadSearchData = async () => {
            try {
                const [songsRes, artistsRes, albumsRes, usersRes] = await Promise.all([
                    fetch('http://localhost:4000/songsList'),
                    fetch('http://localhost:4000/artists'),
                    fetch('http://localhost:4000/albums'),
                    fetch('http://localhost:4000/users')
                ]);

                setAllData({
                    songs: await songsRes.json(),
                    artists: await artistsRes.json(),
                    albums: await albumsRes.json(),
                    users: await usersRes.json()
                });
            } catch (error) {
                console.error('Failed to load search data:', error);
            }
        };

        loadSearchData();
    }, []);

    // Search functionality
    const searchOptions = useMemo(() => {
        if (!query || query.length < 2) return [];

        const normalizeText = (text) => 
            text.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/Đ/g, "D");

        const normalizedQuery = normalizeText(query);
        const results = [];

        // Search songs
        allData.songs.forEach(song => {
            if (normalizeText(song.title || '').includes(normalizedQuery) ||
                normalizeText(song.artist || '').includes(normalizedQuery)) {
                results.push({
                    value: `song-${song.id}`,
                    label: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#EE10B0', fontSize: '12px' }}>♪</span>
                            <span>{song.title}</span>
                            <span style={{ color: '#666', fontSize: '12px' }}>- {song.artist}</span>
                        </div>
                    ),
                    type: 'song',
                    data: song
                });
            }
        });

        // Search artists
        allData.artists.forEach(artist => {
            if (normalizeText(artist.name || '').includes(normalizedQuery)) {
                results.push({
                    value: `artist-${artist.id}`,
                    label: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#EE10B0', fontSize: '12px' }}>👤</span>
                            <span>{artist.name}</span>
                            <span style={{ color: '#666', fontSize: '12px' }}>Artist</span>
                        </div>
                    ),
                    type: 'artist',
                    data: artist
                });
            }
        });

        // Search albums
        allData.albums.forEach(album => {
            if (normalizeText(album.title || '').includes(normalizedQuery)) {
                results.push({
                    value: `album-${album.id}`,
                    label: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#EE10B0', fontSize: '12px' }}>💿</span>
                            <span>{album.title}</span>
                            <span style={{ color: '#666', fontSize: '12px' }}>Album</span>
                        </div>
                    ),
                    type: 'album',
                    data: album
                });
            }
        });

        // Search users
        allData.users.forEach(user => {
            if (normalizeText(user.username || '').includes(normalizedQuery) ||
                normalizeText(user.email || '').includes(normalizedQuery)) {
                results.push({
                    value: `user-${user.id}`,
                    label: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#EE10B0', fontSize: '12px' }}>👥</span>
                            <span>{user.username}</span>
                            <span style={{ color: '#666', fontSize: '12px' }}>- {user.email}</span>
                        </div>
                    ),
                    type: 'user',
                    data: user
                });
            }
        });

        return results.slice(0, 10); // Limit to 10 results
    }, [query, allData]);

    const handleSearch = (value) => {
        setQuery(value);
    };

    const handleSelect = (value, option) => {
        console.log('Selected:', option.type, option.data);
        // Here you can implement navigation or filtering based on selection
        // For example, filter the current view based on selected item
        setQuery(option.data.title || option.data.name || option.data.username || '');
    };

    const handleLevelChange = (newLevel) => {
        setUserLevel(newLevel);
        setCurrentUser(prev => ({ ...prev, level: newLevel }));
    };

    const getLevelName = (level) => {
        switch (level) {
            case 'l1': return 'Admin';
            case 'l2': return 'Moderator';
        }
    };

    return (
        <header className="admin-header">
            <div className="left">
                <AutoComplete
                    options={searchOptions}
                    onSearch={handleSearch}
                    onSelect={handleSelect}
                    value={query}
                    style={{ width: 420 }}
                    placeholder="Search songs, artists, albums, users..."
                    allowClear
                    filterOption={false}
                    notFoundContent={query && query.length >= 2 ? "No results found" : null}
                >
                    <Input
                        prefix={<SearchOutlined style={{ color: '#EE10B0' }} />}
                        style={{
                            borderColor: '#EE10B0',
                            boxShadow: '0 0 0 2px rgba(238, 16, 176, 0.1)'
                        }}
                    />
                </AutoComplete>
            </div>
            <div className="right">
                <div className="admin-info">
                    <div className="name">{user?.username || 'Admin'}</div>
                    <div className="email">{user?.email || 'minhquang@melodies'}</div>
                    <div className="role-switcher" style={{ marginTop: 4 }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Test Role: </span>
                        <Select 
                            value={userLevel} 
                            onChange={handleLevelChange}
                            size="small"
                            style={{ width: 90 }}
                        >
                            <Select.Option value="l1">Admin</Select.Option>
                            <Select.Option value="l2">Moderator</Select.Option>
                        </Select>
                    </div>
                </div>
                <Avatar size="large" icon={<UserOutlined />} />
            </div>
        </header>
    );
}