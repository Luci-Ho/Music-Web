import React from "react";
import { useEffect, useState } from "react";
import Footer from '../components/layout/Footer';
import TopBar from '../components/layout/TopBar';
import Slider from '../components/common/Slider';
import CardGrid from '../components/common/CardGrid';
import Artist from '../components/common/Artist';
import VideoGrid from '../components/common/Video';
import { getHomeData } from "../services/home.service";


import "../style/Layout.css";
import "../App.css";

const HomePage = () => {

  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomeData()
      .then((data) => {
        const parsed = data.data || data;
        setHomeData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("HomePage error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return null; // hoặc spinner

  return (
    <>
      <TopBar />
      <div className="content">
        <div>
          <Slider />
        </div>

        <div>
          <CardGrid
            title1="Top"
            title2="Trending"
            limit={5}
            data={homeData?.topTrending || []}
          />

          <CardGrid
            title1="New"
            title2="Released"
            limit={5}
            data={homeData?.newReleased}
          />

          <CardGrid
            title1="Favorite"
            title2="Songs"
            limit={5}
            data={homeData?.recommended}
          />

          {/* <VideoGrid
            title1="Music"
            title2="Videos"
            limit={8}
            data={homeData?.videos}
          /> */}

          <Artist data={homeData?.artists} limit={6} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HomePage;
