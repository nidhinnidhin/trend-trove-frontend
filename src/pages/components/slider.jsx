import React, { useState, useEffect } from "react";
import { Box, Button, IconButton } from "@mui/material";
import banner1 from "../../media/banner3.png";
import banner2 from "../../media/banner2.jpg";
import banner3 from "../../media/banner1.png";
import banner4 from "../../media/banner4.png";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const slides = [
  {
    id: 1,
    image: banner1,
    alt: "Slide 1",
  },
  {
    id: 2,
    image: banner4,
    alt: "Slide 2",
  },
  // {
  //   id: 3,
  //   image: banner2,
  //   alt: "Slide 3",
  // },
  // {
  //   id: 4,
  //   image: banner3,
  //   alt: "Slide 4",
  // },
];

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  const handlePrevClick = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? slides.length - 1 : prevSlide - 1
    );
  };

  const handleNextClick = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  return (
    <Box
      sx={{
        position: "relative",
        // width: "100%",
        height: {
          xs: "50vh",
          sm: "60vh",
          md: "75vh",
          lg: "92vh",
        },
        overflow: "hidden",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {slides.map((slide, index) => (
        <Box
          key={slide.id}
          sx={{
            position: "absolute",
            top: 0,
            left: `${(index - currentSlide) * 100}%`,
            width: "100%",
            height: "100%",
            transition: "left 0.5s ease-in-out",
          }}
        >
          <motion.div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
            // animate={{
            //   filter: hovered ? "blur(4px)" : "blur(0px)",
            // }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              layout="fill"
              objectFit="cover"
              quality={100}
            />
          </motion.div>
        </Box>
      ))}

      {/* Navigation Arrows */}
      <IconButton
        onClick={handlePrevClick}
        sx={{
          position: "absolute",
          top: "50%",
          left: "16px",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          },
        }}
      >
        <ChevronLeft />
      </IconButton>
      <IconButton
        onClick={handleNextClick}
        sx={{
          position: "absolute",
          top: "50%",
          right: "16px",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          },
        }}
      >
        <ChevronRight />
      </IconButton>

      <AnimatePresence>
        {hovered && (
          <motion.div
            style={{
              position: "absolute",
              top: "50%",
              left: "40%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/productListing/explore">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "16px 32px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  borderRadius: "30px",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                  },
                }}
              >
                Explore More Products
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

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
            onClick={() => handleDotClick(index)}
            sx={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: currentSlide === index ? "black" : "white",
              border: "1px solid black",
              transition: "background-color 0.3s ease",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: currentSlide === index ? "black" : "gray",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Slider;
