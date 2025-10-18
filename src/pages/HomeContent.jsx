import React from "react";
import Footer from '../components/layout/Footer';
import TopBar from '../components/layout/TopBar';
import Slider from '../components/common/Slider';
import CardGrid from '../components/common/CardGrid';

import "../style/Layout.css";

const HomeContent = () => {
    return (
        <div className="container">
            <TopBar />

            <div className="content">
                <div className="">
                    <Slider />
                </div>

                <div className="">
                    <CardGrid />
                </div>
                <div className="">

                </div>
            </div>

            <Footer />

        </div>
    );
}

export default HomeContent;