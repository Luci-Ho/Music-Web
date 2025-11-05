import React from "react";
import Footer from '../components/layout/Footer';
import TopBar from '../components/layout/TopBar';
import Slider from '../components/common/Slider';
import CardGrid from '../components/common/CardGrid';
import Artist from '../components/common/Artist';


import "../style/Layout.css";
import "../App.css";

const HomePage = () => {
  return (
    <>
      <TopBar />
      <div className="content">
        <div>
          <Slider />
        </div>

        <div>
          <CardGrid title1={"Top"} title2={"Trending"} limit={6} filterByYear={2024} />
          <CardGrid title1={"New"} title2={"Released"} limit={6} filterByYear={2025} />
          <CardGrid title1={"Favorite"} title2={"Songs"} limit={6} filterBy={{ genre: "Pop" }} />
          <Artist source={'artists'} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
