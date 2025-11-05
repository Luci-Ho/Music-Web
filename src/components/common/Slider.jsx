import React, { useEffect, useState, useContext  } from "react";
import "./Slider.css";

import { AppContext } from "./AppContext";


export default function Slider() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const { setCurrentSong } = useContext(AppContext);


  useEffect(() => {
    fetch("http://localhost:4000/songs")
      .then((res) => res.json())
      .then((data) => setSlides(data.slice(0, 5))) 
      .catch((err) => console.error("Lỗi khi gọi API:", err));
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (slides.length === 0 || isPaused) return;

    const autoSlideInterval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(autoSlideInterval);
  }, [slides.length, isPaused]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000); // Resume auto-slide after 5 seconds
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000); // Resume auto-slide after 5 seconds
  };

  if (slides.length === 0) return <div>Đang tải dữ liệu...</div>;

  const song = slides[current];

  const handleListen = () => {
    setCurrentSong(song);
  }

  const getPrevIndex = () => (current - 1 + slides.length) % slides.length;
  const getNextIndex = () => (current + 1) % slides.length;

  const handleDotClick = (index) => {
    setCurrent(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000); // Resume auto-slide after 5 seconds
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  return (
    <div 
      className="slider"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="nav left" onClick={prevSlide}>❮</button>

      <div className="slides-container">
        {/* Slide trước (mờ) */}
        <div className="slide prev" onClick={prevSlide}>
          <div className="image-wrapper">
            <img src={slides[getPrevIndex()]?.cover_url} alt={slides[getPrevIndex()]?.title} />
            <div className="preview-overlay"></div>
          </div>
        </div>

        {/* Slide hiện tại */}
        <div className="slide active">
          <div className="image-wrapper">
            <img src={song.cover_url} alt={song.title} />
            <div className="gradient-overlay"></div>
            <div className="info">
              <h2>{song.title}</h2>
              <p>{song.artist}</p>
              <div className="actions">
                <button className="listen" onClick={handleListen}>Listen Now</button>
                <button className="follow">Follow</button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide kế tiếp (mờ) */}
        <div className="slide next" onClick={nextSlide}>
          <div className="image-wrapper">
            <img src={slides[getNextIndex()]?.cover_url} alt={slides[getNextIndex()]?.title} />
            <div className="preview-overlay"></div>
          </div>
        </div>
      </div>

      <button className="nav right" onClick={nextSlide}>❯</button>

      {/* Dots indicator */}
      <div className="dots-container">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === current ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
          ></button>
        ))}
      </div>
    </div>
  );
}