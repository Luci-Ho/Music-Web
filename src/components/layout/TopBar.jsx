import React from 'react';
import '../../style/Layout.css';
import { Flex, Input } from 'antd';
import {
  SearchOutlined, UserOutlined
} from '@ant-design/icons';
import { Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import use10Clicks from '../../hooks/use10Clicks';


const TopBar = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const onTenClick = use10Clicks(() => {
    // when threshold reached, navigate to login and open admin modal
    navigate('/login', { state: { openAdmin: true } });
  }, { threshold: 10, resetMs: 800 });

  return (
    <div className="TopBar">
      {/* Phần Search */}
      <div className="TopBar-Search">
        <SearchOutlined className="search-icon" />
        <input type="text" placeholder="Search..." />
      </div>


      {/* Phần Menu */}
      <div className="TopBar-Menu">
        <p>About</p>
        <p>Contact</p>
        <p>Premium</p>
      </div>

      <div className="TopBar-Menu">
        {/* Show Login/Sign Up when not logged in */}
        {!isLoggedIn && (
            <>
            <button onClick={() => { onTenClick(); navigate('/login'); }}>Login</button>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
          </>
        )}

        {/* Show avatar when logged in (hide buttons) */}
        {isLoggedIn && (
          <Avatar size="large" src={user?.avatar} icon={!user?.avatar && <UserOutlined />} />
        )}
      </div>

    </div>
  );
};

export default TopBar;
