import React from 'react';
import { Input, Button, Avatar, Select } from 'antd';
import { SearchOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const user = JSON.parse(localStorage.getItem('adminuser'));

export default function Header({ query, setQuery }) {
    const { userLevel, setUserLevel, setCurrentUser } = useAuth();

    const handleLevelChange = (newLevel) => {
        setUserLevel(newLevel);
        setCurrentUser(prev => ({ ...prev, level: newLevel }));
    };

    const getLevelName = (level) => {
        switch (level) {
            case 'l1': return 'Admin';
            case 'l2': return 'Moderator';
            case 'l3': return 'User';
            default: return 'Unknown';
        }
    };

    return (
        <header className="admin-header">
            <div className="left">
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Search songs, artists, albums..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ width: 420 }}
                />
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
                            <Select.Option value="l3">User</Select.Option>
                        </Select>
                    </div>
                </div>
                <Avatar size="large" icon={<UserOutlined />} />
            </div>
        </header>
    );
}