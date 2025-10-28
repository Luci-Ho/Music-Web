import React from "react";
import Footer from '../components/layout/Footer';
import TopBar from '../components/layout/TopBar';
import Dashboard from '../components/layout/Dashboard';
import Slider from '../components/common/Slider';
import CardGrid from '../components/common/CardGrid';
import Artist from '../components/common/Artist';
import MusicPlayer from "../components/layout/MusicPlayer";


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
              <CardGrid title1={"Top"} title2={"Trending"} limit={5} filterByYear={2024} />
              <CardGrid title1={"New"} title2={"Released"} limit={5} filterByYear={2025} />
              <CardGrid title1={"Favorite"} title2={"Songs"} limit={5} filterBy={{ genre: "Pop" }} />
              <Artist source={'artists'} />

            </div>
            <MusicPlayer />
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
