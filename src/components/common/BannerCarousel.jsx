import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const BannerCarousel = () => {
  const banners = [
    { id: 1, image: '/banner1.jpg', title: 'Khám phá âm nhạc mới' },
    { id: 2, image: '/banner2.jpg', title: 'Top 100 bài hát hot' },
    { id: 3, image: '/banner3.jpg', title: 'Playlist dành riêng cho bạn' },
  ];

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <Slider {...settings}>
      {banners.map((banner) => (
        <div key={banner.id}>
          <img src={banner.image} alt={banner.title} />
          <h3>{banner.title}</h3>
        </div>
      ))}
    </Slider>
  );
};

export default BannerCarousel;