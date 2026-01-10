import React from 'react';
import '../../style/Loading.css';

// Reusable presentational loading component.
// Use for local loading states; navigation/time-based loading is handled by the page-level `pages/Loading.jsx`.
const Loading = ({ label = 'Loading' }) => {
    return (
        <div className="loading-wrapper">
            <img
                className="loading-logo"
                src="https://res.cloudinary.com/da4y5zf5k/image/upload/v1751044695/logo-no-background_1_z7njh8.png"
                alt="Melodies Logo"
            />
            <div className="loading-text-block">
                <span className="loading-label">{label}</span>
                <div className="spinner"></div>
            </div>
        </div>
    );
};

export default Loading;
