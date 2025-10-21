import React from 'react';
import '../../style/Layout.css';
import { Flex, Input } from 'antd';
import {
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';


const TopBar = () => {
  const navigate = useNavigate();

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
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/signup')}>Sign Up</button>
      </div>

    </div>
  );
};

export default TopBar;
