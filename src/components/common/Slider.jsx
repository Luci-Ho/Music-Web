import React, { useEffect, useState, useContext  } from "react";
import "./Slider.css";

import { AppContext } from "./AppContext";


export default function Slider() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([]);
  const { setCurrentSong } = useContext(AppContext);


  useEffect(() => {
    fetch("http://localhost:4000/songs")
      .then((res) => res.json())
      .then((data) => setSlides(data.slice(0, 5))) 
      .catch((err) => console.error("Lỗi khi gọi API:", err));
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) return <div>Đang tải dữ liệu...</div>;

  const song = slides[current];

  const handleListen = () => {
    setCurrentSong(song);
  }

  return (
    <div className="slider">
      <button className="nav left" onClick={prevSlide}>❮</button>

      <div className="slide active">
        <div className="image-wrapper">
          <img src={song.cover_url} alt={song.title} />

          <div className="gradient-overlay"></div> {/* lớp phủ gradient */}
          <div className="info">
            <h2>{song.title}</h2>
            <p>{song.artist}</p>
            <div className="actions">
              <button className="listen"onClick={handleListen} >Listen Now</button>
              <button className="follow">Follow</button>
            </div>
          </div>
        </div>
      </div>

      <button className="nav right" onClick={nextSlide}>❯</button>
    </div>


  );
}