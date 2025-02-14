import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Box, Typography, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const CategoryCarousel = ({ categories, onCategoryClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerSlide = 5;
  const totalCategories = categories.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalCategories);
  }, [totalCategories]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalCategories - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <Box
      sx={{
        position: "relative",
        height: "50px",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ display: "flex", width: "100%", overflow: "hidden" }}>
        <AnimatePresence mode="popLayout">
          {categories
            .slice(currentIndex, currentIndex + itemsPerSlide)
            .concat(
              categories.slice(
                0,
                Math.max(0, currentIndex + itemsPerSlide - totalCategories)
              )
            )
            .map((category) => (
              <motion.div
                key={category}
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ type: "tween", duration: 0.5 }}
                style={{
                  flex: "1 1 auto",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "color 0.3s",
                }}
                onClick={() => onCategoryClick(category)}
              >
                <Typography
                  variant="body1"
                  sx={{ color: "gray", fontWeight: 500 }}
                >
                  {category}
                </Typography>
                <Box
                  sx={{
                    mt: 1,
                    height: "2px",
                    width: "60%",
                    margin: "auto",
                    backgroundColor: "transparent",
                    transition: "background-color 0.3s",
                    "&:hover": { backgroundColor: "#333" },
                  }}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </Box>
      <IconButton
        onClick={prevSlide}
        sx={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          color: "gray",
          backdropFilter: "blur(5px)",
        }}
      >
        <ChevronLeft size={28} />
      </IconButton>
      <IconButton
        onClick={nextSlide}
        sx={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          color: "gray",
          backdropFilter: "blur(5px)",
        }}
      >
        <ChevronRight size={28} />
      </IconButton>
    </Box>
  );
};

export default CategoryCarousel;
