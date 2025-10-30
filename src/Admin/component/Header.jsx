import React from 'react';
import { Input, Button, Avatar } from 'antd';
import { SearchOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';

const user = JSON.parse(localStorage.getItem('adminuser'));


export default function Header({ query, setQuery }) {



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
        </div>
        <Avatar size="large" icon={<UserOutlined />} />
    </div>
    </header>
);
}