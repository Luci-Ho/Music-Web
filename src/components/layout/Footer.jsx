import React from 'react';
import '../../style/Layout.css';
import {
    FacebookOutlined,
    InstagramOutlined,
    TwitterOutlined,
    PhoneOutlined,
} from '@ant-design/icons';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-grid">
                    {/* ABOUT */}
                    <div className="footer-about">
                    <h3 className="footer-about-heading">About</h3>
                    <p>
                            Melodies is a website that has been created for over <span>5 year's</span> now and it is
                            one of the most famous music player websites in the world. You can listen and download songs for free.
                            Want no limitation? Buy our <a href="#">premium pass's</a>.
                        </p>
                    </div>

                    {/* LINKS */}
                    <div className="footer-links">
                        <div>
                            <h4>Melody</h4>
                            <div className="line" ></div>
                            <ul>
                                <li><a href="#">Songs</a></li>
                                <li><a href="#">Radio</a></li>
                                <li><a href="#">Podcast</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4>Access</h4>
                            <div className="line" > </div>                      
                            <ul>
                                <li><a href="#">Explore</a></li>
                                <li><a href="#">Artists</a></li>
                                <li><a href="#">Playlists</a></li>
                                <li><a href="#">Albums</a></li>
                                <li><a href="#">Trending</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4>Contact</h4>
                            <div className="line" > </div>                         
                            <ul>
                                <li><a href="#">About</a></li>
                                <li><a href="#">Policy</a></li>
                                <li><a href="#">Social Media</a></li>
                                <li><a href="#">Support</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* SOCIAL */}
                    <div className="footer-social">
                        <p className="Logo">Melodies</p>
                        <div className="link">
                            <FacebookOutlined style={{ fontSize: '35px' }} />
                            <InstagramOutlined style={{ fontSize: '35px' }} />
                            <TwitterOutlined style={{ fontSize: '35px' }} />
                            <PhoneOutlined style={{ fontSize: '35px' }} />

                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
