import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Đừng quên import
import '../../style/Layout.css';
import {
  HomeFilled,
  CompassOutlined,
  UserOutlined,
  GlobalOutlined,
  AppstoreAddOutlined,
  PlayCircleOutlined,
  HeartOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';

// import HomeContent from '../../pages/HomeContent';
// import Discover from '../../pages/Discover';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [collapsed, setCollapsed] = useState(false);

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
    localStorage.removeItem('user');
    console.log('Đăng xuất thành công!');
    navigate('/login');
  };

  const MenuItem = ({ icon, label, to }) => (
    <div className="dashboard-menu-item-hover" onClick={() => navigate(to)}>
      {icon}
      <p className="dashboard-menu-label">{label}</p>
    </div>
  );

  return (
    <div className={`dashboard ${collapsed ? 'collapsed' : ''}`} id="dashboard">
      <div className="collapse-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
      <div className="logo">
        <img src="/Ảnh/eac87d338a32800109b78daee1589299b8812535.png" alt="" className="logoimg" />
        <p className="logo">Melodies</p>
        <div className="welcome">
          <small>{user ? `Hi, ${user.username}! 🎶` : 'Cùng nghe nhạc vui nhé!'}</small>
        </div>
      </div>

      <div className="DashBoard-menu">
        <p className="Menu">Menu</p>
        <div className="Menu-part">
          <MenuItem icon={<HomeFilled />} label="Home" to="/home" />
          <MenuItem icon={<GlobalOutlined />} label="Discover" to="/discover" />
          <MenuItem icon={<CompassOutlined />} label="Albums" to="/album" />
          <MenuItem icon={<UserOutlined />} label="Artists" to="/artist" />
        </div>
      </div>

      <div className="DashBoard-menu">
        <p className="Menu">Library</p>
        <div className="Menu-part">
          <MenuItem icon={<AppstoreAddOutlined />} label="Recently" to="/recent" />
          <MenuItem icon={<PlayCircleOutlined />} label="Most Played" to="/most-played" />
        </div>
      </div>

      <div className="DashBoard-menu">
        <p className="Menu">Playlist and Favorite</p>
        <div className="Menu-part">
          <MenuItem icon={<HeartOutlined />} label="Your Favorites" to="/favorites" />
          <MenuItem icon={<PlayCircleOutlined />} label="Your Playlist" to="/playlist" />
          <MenuItem icon={<PlusCircleOutlined />} label="Add Playlist" to="/playlist/add" />
        </div>
      </div>

      <div className="DashBoard-menu">
        <p className="Menu">General</p>
        <div className="Menu-part">
          <MenuItem icon={<SettingOutlined />} label="Setting" to="/settings" />
          <div className="dashboard-menu-item-hover" onClick={handleLogout}>
            <LogoutOutlined />
            <p className="Logout">Log Out</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;