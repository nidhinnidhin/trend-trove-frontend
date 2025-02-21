import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

const NewArrival = () => {
  const products = [
    {
      id: 1,
      name: "Product 1",
      image:
        "https://images.pexels.com/photos/2491123/pexels-photo-2491123.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 2,
      name: "Product 2",
      image:
        "https://images.pexels.com/photos/2491123/pexels-photo-2491123.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 3,
      name: "Product 3",
      image:
        "https://images.pexels.com/photos/2491123/pexels-photo-2491123.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 4,
      name: "Product 4",
      image:
        "https://images.pexels.com/photos/2068349/pexels-photo-2068349.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 5,
      name: "Product 5",
      image:
        "https://images.pexels.com/photos/2491123/pexels-photo-2491123.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
      id: 6,
      name: "Product 6",
      image:
        "https://images.pexels.com/photos/2491123/pexels-photo-2491123.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  ];

  const isMobile = useMediaQuery("(max-width:600px)"); // For mobile view
  const itemsToShow = isMobile ? 1 : 5; // Show 1 item on mobile, 5 items otherwise

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide logic
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000); // 3-second interval

    return () => clearInterval(interval); // Clear interval on unmount
  }, [currentIndex, itemsToShow]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + itemsToShow >= products.length ? 0 : prevIndex + itemsToShow
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - itemsToShow < 0
        ? products.length - itemsToShow
        : prevIndex - itemsToShow
    );
  };

  return (
    <Box sx={{ width: "100%", padding: 2, margin: "20px 0px" }}>
      {/* New Arrivals Header */}
      <Typography variant="h4" align="center" gutterBottom>
        New Arrivals
      </Typography>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Previous Button */}
        <Button
          onClick={handlePrev}
          sx={{
            backgroundColor: "orange",
            height: "100%",
            width: "80px",
            position: "absolute",
            left: 0,
            zIndex: 1,
            color: "white",
            "&:hover": { backgroundColor: "darkorange" },
          }}
        >
          <ArrowBack />
        </Button>

        {/* Carousel */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
            transition: "transform 0.5s ease-in-out",
            width: "calc(100% - 100px)", // Adjust for button width
            margin: "0 auto",
          }}
        >
          {products.map((product) => (
            <Card
            key={product.id}
            sx={{
              flex: `0 0 calc(100% / ${itemsToShow} - 16px)`, // Responsive layout
              boxShadow: 1,
              overflow: "hidden",
              border: "0.5px solid lightgray",
              cursor: "pointer",
              transition: "box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 16px rgba(0,0,0,0.2)", // Slightly elevated shadow
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                overflow: "hidden", // Clip the image on hover
                height: "200px", // Fixed height for the image container
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image}
                alt={product.name}
                sx={{
                  transition: "transform 0.3s ease", // Smooth transition for zoom
                  "&:hover": {
                    transform: "scale(1.1)", // Slight zoom effect
                  },
                }}
              />
            </Box>
            <CardContent>
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, textAlign: "center" }}
              >
                {product.name}
              </Typography>
            </CardContent>
          </Card>
          
          ))}
        </Box>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          sx={{
            backgroundColor: "orange",
            height: "100%",
            width: "80px",
            position: "absolute",
            right: 0,
            zIndex: 1,
            color: "white",
            "&:hover": { backgroundColor: "darkorange" },
          }}
        >
          <ArrowForward />
        </Button>
      </Box>

      {/* Show More Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 3,
        }}
      >
        <Button variant="contained" color="primary">
          Show More
        </Button>
      </Box>
    </Box>
  );
};

export default NewArrival;
