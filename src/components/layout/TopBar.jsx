import React from 'react';
import '../../style/Layout.css';
import { Flex, Input } from 'antd';
import {
  SearchOutlined, UserOutlined
} from '@ant-design/icons';
import { Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';


const TopBar = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

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
            <button onClick={() => navigate('/login')}>Login</button>
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
