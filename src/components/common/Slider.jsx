import React, { useEffect, useState } from "react";
import "./Slider.css";
import useMusicPlayer from "../../hooks/useMusicPlayer";

export default function Slider({ source = "songs", limit = 5 }) {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { playSong } = useMusicPlayer();

  // 🔥 FETCH THEO SOURCE
  useEffect(() => {
    fetch(`http://localhost:4000/${source}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể lấy dữ liệu slider");
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data.slice(0, limit) : [];
        setSlides(list);
      })
      .catch((err) => console.error("Lỗi khi gọi API slider:", err));
  }, [source, limit]);

  // Auto-slide
  useEffect(() => {
    if (slides.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((prev) => (prev + 1) % slides.length);
    setIsPaused(true);

    setTimeout(() => {
      setIsTransitioning(false);
      setIsPaused(false);
    }, 800);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    setIsPaused(true);

    setTimeout(() => {
      setIsTransitioning(false);
      setIsPaused(false);
    }, 800);
  };

  if (slides.length === 0) return <div>Đang tải dữ liệu...</div>;

  const song = slides[current];

  const handleListen = () => {
    playSong(song, slides); // 🔥 set playlist luôn
  };

  const getPrevIndex = () => (current - 1 + slides.length) % slides.length;
  const getNextIndex = () => (current + 1) % slides.length;

  const handleDotClick = (index) => {
    if (isTransitioning || index === current) return;
    setIsTransitioning(true);
    setCurrent(index);
    setIsPaused(true);

    setTimeout(() => {
      setIsTransitioning(false);
      setIsPaused(false);
    }, 800);
  };

  return (
    <div
      className={`slider ${isTransitioning ? "transitioning" : ""}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <button
        className={`nav left ${isTransitioning ? "disabled" : ""}`}
        onClick={prevSlide}
        disabled={isTransitioning}
      >
        ❮
      </button>

      <div className="slides-container">
        {/* Prev */}
        <div className="slide prev" onClick={prevSlide}>
          <div className="image-wrapper">
            <img
              src={slides[getPrevIndex()]?.cover_url}
              alt={slides[getPrevIndex()]?.title}
            />
            <div className="preview-overlay"></div>
          </div>
        </div>

        {/* Active */}
        <div className="slide active">
          <div className="image-wrapper">
            <img src={song.cover_url} alt={song.title} />
            <div className="gradient-overlay"></div>

            <div className="info">
              <h2>{song.title}</h2>
              <p>{song.artist}</p>

              <div className="actions">
                <button className="listen" onClick={handleListen}>
                  Listen Now
                </button>
                <button className="follow">Follow</button>
              </div>
            </div>
          </div>
        </div>

        {/* Next */}
        <div className="slide next" onClick={nextSlide}>
          <div className="image-wrapper">
            <img
              src={slides[getNextIndex()]?.cover_url}
              alt={slides[getNextIndex()]?.title}
            />
            <div className="preview-overlay"></div>
          </div>
        </div>
      </div>

      <button
        className={`nav right ${isTransitioning ? "disabled" : ""}`}
        onClick={nextSlide}
        disabled={isTransitioning}
      >
        ❯
      </button>

      {/* Dots */}
      <div className="dots-container">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === current ? "active" : ""}`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
    </div>
  );
}
