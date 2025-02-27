import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Button } from "@mui/material";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import axios from "axios";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get("http://localhost:9090/api/banners");
        // Filter only active banners
        const activeBanners = response.data.filter(banner => banner.isActive);
        setBanners(activeBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleNavigation = (direction) => {
    if (banners.length === 0) return;

    if (direction === 'prev') {
      setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    } else {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }
  };

  if (banners.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "60vh", sm: "70vh", md: "85vh" },
        width: "100%",
        backgroundColor: "#000",
        overflow: "hidden",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {banners.map((banner, index) => (
        <AnimatePresence key={banner._id}>
          {currentSlide === index && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              {/* Background Image with Overlay */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)",
                  },
                }}
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  layout="fill"
                  objectFit="cover"
                  priority
                  quality={100}
                />
              </Box>

              {/* Content */}
              <Box
                sx={{
                  position: "relative",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  px: { xs: 3, sm: 6, md: 10 },
                  maxWidth: "1400px",
                  margin: "0 auto",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <Box sx={{ maxWidth: { xs: "100%", md: "60%" } }}>
                    <Typography
                      variant="overline"
                      sx={{
                        color: "#FFA726",
                        fontSize: { xs: "0.8rem", md: "1rem" },
                        letterSpacing: "4px",
                        mb: 2,
                        display: "block",
                      }}
                    >
                      SPECIAL OFFER
                    </Typography>

                    <Typography
                      variant="h1"
                      sx={{
                        color: "white",
                        fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
                        fontWeight: 700,
                        lineHeight: 1.2,
                        mb: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      {banner.title}
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{
                        color: "#FFA726",
                        fontWeight: 600,
                        mb: 3,
                      }}
                    >
                      UP TO {banner.discount}% OFF
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: { xs: "1rem", md: "1.2rem" },
                        mb: 4,
                        maxWidth: "600px",
                      }}
                    >
                      {banner.description}
                    </Typography>

                    <Link href="/productListing/explore">
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#FFA726",
                          color: "black",
                          padding: "15px 40px",
                          fontSize: { xs: "1rem", md: "1.1rem" },
                          fontWeight: 600,
                          borderRadius: "4px",
                          textTransform: "uppercase",
                          "&:hover": {
                            backgroundColor: "#FF9800",
                          },
                        }}
                      >
                        Shop Now
                      </Button>
                    </Link>
                  </Box>
                </motion.div>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* Navigation Arrows */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: "20px", md: "40px" },
          right: { xs: "20px", md: "40px" },
          display: "flex",
          gap: 2,
        }}
      >
        <IconButton
          onClick={() => handleNavigation('prev')}
          sx={{
            backgroundColor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            color: "white",
            "&:hover": {
              backgroundColor: "#FFA726",
            },
          }}
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          onClick={() => handleNavigation('next')}
          sx={{
            backgroundColor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            color: "white",
            "&:hover": {
              backgroundColor: "#FFA726",
            },
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Slide Indicators */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: "20px", md: "40px" },
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
        }}
      >
        {banners.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentSlide(index)}
            sx={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: currentSlide === index ? "#FFA726" : "rgba(255,255,255,0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </Box>

      {/* Progress Bar */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "4px",
          backgroundColor: "rgba(255,255,255,0.1)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, repeat: Infinity }}
          style={{
            height: "100%",
            backgroundColor: "#FFA726",
          }}
        />
      </Box>
    </Box>
  );
};

export default Slider;
