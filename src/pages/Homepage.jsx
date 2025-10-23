import React from "react";
import Footer from '../components/layout/Footer';
import TopBar from '../components/layout/TopBar';
import Dashboard from '../components/layout/Dashboard';
import Slider from '../components/common/Slider';
import CardGrid from '../components/common/CardGrid';

import "../style/Layout.css";
import "../App.css";

const HomePage = () => {
  return (
    <div className="body">
      <div style={{ display: 'flex', width: '100%' }}>
        <Dashboard />

        <div className="container">
          <TopBar />

          <div className="content">
            <div>
              <Slider />
            </div>

            <div>
              <CardGrid />
              <CardGrid title="Top 5 bài hát yêu thích" limit={5} />
              <CardGrid title="Nhạc mới phát hành" limit={5} />
              <CardGrid title="Gợi ý cho bạn" limit={5} />
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
