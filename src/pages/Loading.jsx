import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../style/Loading.css';

function Loading() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    console.log('🌀 Loading page mounted!');

    return () => clearTimeout(timer); // tránh memory leak
  }, [navigate]);

  return (
    <div className="loading-wrapper">
      <img
        className="loading-logo"
        src="https://res.cloudinary.com/da4y5zf5k/image/upload/v1751044695/logo-no-background_1_z7njh8.png"
        alt="Melodies Logo"
      />
      <div className="loading-text-block">
        <span className="loading-label">Loading</span>
        <div className="spinner"></div>
      </div>
    </div>
  );
}


export default Loading;
