import React from 'react';
import '../../style/Layout.css';
import { Flex, Input } from 'antd';
import {
  SearchOutlined,
} from '@ant-design/icons';


const TopBar = () => {
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
        <button className=''>Login</button>
        <button>Sign Up</button>
      </div>
    </div>
  );
};

export default TopBar;
