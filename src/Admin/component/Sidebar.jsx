import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from 'antd';
import { PlayCircleOutlined, HomeOutlined, TeamOutlined, TagsOutlined, SettingOutlined, LogoutOutlined, AppstoreOutlined, UserOutlined  } from '@ant-design/icons';


export default function Sidebar({ active, setActive }) {

    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const toggleSidebar = () => {
          const dashboard = document.getElementById('dashboard');
          if (window.innerWidth < 440) {
            dashboard?.classList.add('hide');
          } else {
            dashboard?.classList.remove('hide');
          }
        };
    
        window.addEventListener('load', toggleSidebar);
        window.addEventListener('resize', toggleSidebar);
    
        return () => {
          window.removeEventListener('load', toggleSidebar);
          window.removeEventListener('resize', toggleSidebar);
        };
      }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminuser');
        navigate('/');
      }

return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
    <div className="sidebar-header" title={collapsed ? 'Expand' : 'Collapse'}>
      <div className="logo-wrap" onClick={() => setCollapsed(!collapsed)}>
        <Avatar icon={<PlayCircleOutlined />} />
        <div className="brand">Melodies</div>
      </div>
      {/* Collapse toggle hidden in admin */}
    </div>


    <nav className="sidebar-menu">
      <button onClick={() => setActive('dashboard')} className={active === 'dashboard' ? 'active' : ''}>
        <HomeOutlined /> <span className="label">Dashboard</span>
      </button>
      <button onClick={() => setActive('songs')} className={active === 'songs' ? 'active' : ''}>
        <PlayCircleOutlined /> <span className="label">Songs</span>
      </button>
      <button onClick={() => setActive('users')} className={active === 'users' ? 'active' : ''}>
        <TeamOutlined /> <span className="label">Users</span>
      </button>
      <button onClick={() => setActive('tags')} className={active === 'tags' ? 'active' : ''}>
        <TagsOutlined /> <span className="label">Tags</span>
      </button>
      <button onClick={() => setActive('settings')} className={active === 'settings' ? 'active' : ''}>
        <SettingOutlined /> <span className="label">Settings</span>
      </button>
      <div className="mt-auto">
        <button onClick={handleLogout}><LogoutOutlined /> <span className="label">Log out</span></button>
      </div>
    </nav>
    </aside>
    );
}