import React from "react";
import Footer from '../components/layout/Footer';
import TopBar from '../components/layout/TopBar';

import "../style/Layout.css";

const HomeContent = () => {
    return (
        <div className="container">
            <TopBar />

            <div className="content">
                <p>hello</p>
            </div>

            <Footer />

        </div>
    );
}

export default HomeContent;