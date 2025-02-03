import React, { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import banner1 from "../../media/banner1.png";
import banner2 from "../../media/banner2.jpg";
import Image from "next/image";

const slides = [
  {
    id: 1,
    image: banner2,
    alt: "Slide 1",
  },
  {
    id: 2,
    image: banner1,
    alt: "Slide 2",
  },
];

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleDotClick = (index) => {
    setCurrentSlide(index); // Set the current slide to the clicked dot's index
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: {
          xs: "50vh", // Smaller height for extra-small devices
          sm: "60vh", // Slightly larger for small devices
          md: "75vh", // Medium height for tablets
          lg: "92vh", // Full height for desktops
        },
        overflow: "hidden",
      }}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: `${(index - currentSlide) * 100}%`,
            width: "100%",
            height: "100%",
            transition: "left 0.5s ease-in-out",
          }}
        >
          <Image key={slide.id} src={slide.image} layout="fill"/>
        </Box>
      ))}

      {/* Shop Button */}
      <Button
        variant="contained"
        sx={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "black",
          color: "white",
          padding: {
            xs: "8px 16px", // Smaller padding for small devices
            sm: "10px 20px",
            md: "12px 24px", // Larger padding for bigger devices
          },
          borderRadius: "20px",
          fontSize: {
            xs: "12px", // Smaller font size for extra-small devices
            sm: "14px",
            md: "16px",
          },
          "&:hover": {
            backgroundColor: "gray",
          },
        }}
      >
        Shop
      </Button>

      {/* Pagination Dots */}
      <Box
        sx={{
          position: "absolute",
          bottom: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
        }}
      >
        {slides.map((_, index) => (
          <Box
            key={index}
            onClick={() => handleDotClick(index)} // Update currentSlide on dot click
            sx={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: currentSlide === index ? "black" : "white",
              border: "1px solid black",
              transition: "background-color 0.3s ease",
              cursor: "pointer",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Slider;
