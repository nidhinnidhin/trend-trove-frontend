import React, { useState } from "react";
import {
  Box,
  IconButton,
  Typography,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import styled from "@emotion/styled";

const CarouselContainer = styled(Box)`
  width: 100%;
  max-width: 1400px;
  margin: 60px auto;
  padding: 0;
  position: relative;
`;

const CarouselViewport = styled(Box)`
  position: relative;
  overflow: hidden;
  padding: 0 40px; // Move padding here from container
`;

const ProductsWrapper = styled(Box)`
  display: flex;
  gap: 24px;
  transition: transform 0.5s ease;
`;

const ProductCard = styled(Card)`
  min-width: 260px;
  border: none;
  box-shadow: none;
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
`;

const ProductImage = styled(CardMedia)`
  height: 360px;
  width: 100%;
  background-color: #f8f8f8;
  transition: transform 0.3s ease;
  object-fit: contain;
`;

// Fixed navigation button styling
const NavigationButton = styled(IconButton)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #fff;
  border: 1px solid #e0e0e0;
  width: 40px;
  height: 40px;
  z-index: 10; // Increased z-index
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }

  & .MuiSvgIcon-root {
    font-size: 24px;
    color: #666;
  }
`;

const PaginationDot = styled(Box)`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#333' : '#ddd'};
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
`;

const NewArrival = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4;

  const products = [
    {
      id: 1,
      name: "Women's Arcadian Packable Sunblock Jacket | White",
      price: "Rs. 9,400.00",
      image: "https://www.coolibar.com/cdn/shop/files/01418-111-1000-02_720x.jpg?v=1733867223"
    },
    {
      id: 2,
      name: "Women's Petra Wide Leg Pants | Black",
      price: "Rs. 9,400.00",
      image: "https://www.coolibar.com/cdn/shop/files/01482-001-1000-2-coolibar-wide-leg-pant-upf-50_14b5d1e2-d713-4c2d-98fb-5f7a6a34d0b2_720x.jpg?v=1723168749"
    },
    {
      id: 3,
      name: "Women's Rhodes Shirt | Future Dusk",
      price: "Rs. 8,450.00",
      image: "https://www.coolibar.com/cdn/shop/files/10322-509-1000-02_720x.jpg?v=1723655415"
    },
    {
      id: 4,
      name: "Women's Pellaro Travel Pants | Black",
      price: "Rs. 9,400.00",
      image: "https://www.coolibar.com/cdn/shop/files/10153-930-9001-02_720x.jpg?v=1737567768"
    },
    {
      id: 5,
      name: "Women's Sanibel Everyday Beach Shawl | White/Navy",
      price: "Rs. 3,700.00",
      image: "https://www.coolibar.com/cdn/shop/files/01262-001-1000-02_ad8ece1d-79f0-4ae8-a996-f93a9840eddc_720x.jpg?v=1727121195"
    },
    {
      id: 6,
      name: "Women's Morada Everyday Long Sleeve T-Shirt | Black",
      price: "Rs. 4,650.00",
      image: "https://www.coolibar.com/cdn/shop/files/01496-509-1000-02_ec635664-00dd-403e-a2ca-2c83439fc2a0_720x.jpg?v=1723168630"
    }
  ];

  const handleNext = () => {
    setCurrentIndex(prev => 
      prev + itemsPerView >= products.length ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex(prev => 
      prev === 0 ? products.length - itemsPerView : prev - 1
    );
  };

  return (
    <CarouselContainer>
      <Typography 
        variant="h5" 
        sx={{ 
          textAlign: "center", 
          marginBottom: 5,
          fontWeight: 600,
          color: "#333",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        New Arrivals
      </Typography>

      <CarouselViewport>
        {/* Left navigation button */}
        <NavigationButton 
          onClick={handlePrev}
          sx={{ 
            left: 0,
          }}
        >
          <ChevronLeft />
        </NavigationButton>

        {/* Products wrapper */}
        <ProductsWrapper
          sx={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id}>
              <Box sx={{ overflow: "hidden", position: "relative" }}>
                <ProductImage
                  component="img"
                  image={product.image}
                  alt={product.name}
                />
              </Box>
              <CardContent 
                sx={{ 
                  textAlign: "center", 
                  padding: "16px 12px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 500,
                    color: "#333",
                    fontSize: "14px",
                    lineHeight: 1.4,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {product.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "#666",
                    fontSize: "14px",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {product.price}
                </Typography>
              </CardContent>
            </ProductCard>
          ))}
        </ProductsWrapper>

        {/* Right navigation button */}
        <NavigationButton 
          onClick={handleNext}
          sx={{ 
            right: 0,
          }}
        >
          <ChevronRight />
        </NavigationButton>
      </CarouselViewport>

      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          marginTop: 3
        }}
      >
        {[...Array(Math.ceil(products.length / itemsPerView))].map((_, idx) => (
          <PaginationDot
            key={idx}
            active={Math.floor(currentIndex / itemsPerView) === idx}
            onClick={() => setCurrentIndex(idx * itemsPerView)}
          />
        ))}
      </Box>
    </CarouselContainer>
  );
};

export default NewArrival;