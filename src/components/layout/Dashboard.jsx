import React, { useEffect } from 'react';
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

import HomeContent from '../../pages/HomeContent';
import Discover from '../../pages/Discover';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

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
      <p>{label}</p>
    </div>
  );

  return (
    <div className="dashboard" id="dashboard">
      <div className="logo">
        <p>Melodies</p>
        {/* <small>{user ? `Xin chào ${user.username}! 🎶` : 'Cùng nghe nhạc vui nhé'}</small> */}
      </div>

      <div className="DashBoard-menu">
        <p className="Menu">Menu</p>
        <div className="Menu-part">
          <MenuItem icon={<HomeFilled />} label="Home" to="/home" />
          <MenuItem icon={<GlobalOutlined />} label="Discover" to="/discover" />
          <MenuItem icon={<CompassOutlined />} label="Albums" to="/album" />
          <MenuItem icon={<UserOutlined />} label="Artists" to="/artist"  />
        </div>
      </div>

      <div className="DashBoard-menu">
        <p className="Menu">Library</p>
        <div className="Menu-part">
          <MenuItem icon={<AppstoreAddOutlined />} label="Recently Added" to="/recent" />
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