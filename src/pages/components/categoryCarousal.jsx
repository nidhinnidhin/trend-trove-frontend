import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Box, Typography, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const carouselContainerStyles = {
  position: "relative",
  height: "60px",
  width: "100%",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f5f5f5", 
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
};

const categoryItemStyles = (isSelected) => ({
  flex: "1 1 auto",
  textAlign: "center",
  cursor: "pointer",
  transition: "color 0.3s",
  padding: "10px",
  borderRadius: "4px",
  backgroundColor: isSelected ? "#ff6f61" : "white", 
  color: isSelected ? "white" : "black", 
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  margin: "0 5px", 
});

const categoryHighlightStyles = {
  height: "2px",
  width: "60%",
  margin: "auto",
  backgroundColor: "transparent",
  transition: "background-color 0.3s",
};

const CategoryCarousel = ({ categories, onCategoryClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const itemsPerSlide = 5;
  // const totalCategories = categories.length;

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

  const handleCategoryClick = (category) => {
    setSelectedCategory(category); 
    onCategoryClick(category); 
  };

  return (
    <Box sx={carouselContainerStyles}>
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
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => handleCategoryClick(category)}
                style={categoryItemStyles(selectedCategory === category)} 
              >
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {category}
                </Typography>
                <Box sx={categoryHighlightStyles} />
              </motion.div>
            ))}
        </AnimatePresence>
      </Box>
      <IconButton
        onClick={prevSlide}
        sx={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "gray",
          backdropFilter: "blur(5px)",
          "&:hover": {
            color: "#ff6f61",
          },
        }}
      >
        <ChevronLeft size={28} />
      </IconButton>
      <IconButton
        onClick={nextSlide}
        sx={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "gray",
          backdropFilter: "blur(5px)",
          "&:hover": {
            color: "#ff6f61",
          },
        }}
      >
        <ChevronRight size={28} />
      </IconButton>
    </Box>
  );
};

export default CategoryCarousel;
