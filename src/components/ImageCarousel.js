// src/components/ImageCarousel.js
import React, { useState } from "react";

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="carousel">
      <button onClick={prevImage}>←</button>
      <img src={images[currentIndex]} alt="Product" />
      <button onClick={nextImage}>→</button>
    </div>
  );
};

export default ImageCarousel;
