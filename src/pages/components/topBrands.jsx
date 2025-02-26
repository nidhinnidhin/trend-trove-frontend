import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import Image from "next/image";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import axios from "axios";

const CarouselContainer = styled(Box)`
  width: 100%;
  max-width: 1400px;
  margin: 40px auto;
  padding: 0 40px;
  position: relative;
`;

const ProductsWrapper = styled(Box)`
  display: flex;
  gap: 20px;
  transition: transform 0.5s ease;
`;

const BrandCard = styled(Box)`
  flex: 0 0 calc(16.666% - 16px);
  position: relative;
  cursor: pointer;
  height: 500px;
  
  &:hover {
    .overlay {
      background-color: rgba(0, 0, 0, 0.4);
    }
  }
`;

const ImageWrapper = styled(Box)`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Overlay = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.7));
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  transition: all 0.3s ease;
`;

const ShopNowButton = styled(Typography)`
  color: white;
  background: transparent;
  border: 2px solid white;
  padding: 8px 16px;
  font-size: 14px;
  text-transform: uppercase;
  margin-top: 10px;
  display: inline-block;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  width: fit-content;

  &:hover {
    background: white;
    color: black;
  }
`;

const NavigationButton = styled(IconButton)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.9) !important;
  color: #333;
  width: 40px;
  height: 40px;
  z-index: 2;
  
  &:hover {
    background-color: white !important;
  }

  &.left {
    left: 0;
  }

  &.right {
    right: 0;
  }
`;

const TopBrands = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [brands, setBrands] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get('http://localhost:9090/api/brands');
        setBrands(response.data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchBrands();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % (brands.length - 5));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + (brands.length - 5)) % (brands.length - 5));
  };

  const handleBrandClick = (brandId) => {
    router.push(`/productListing/searchResults?brand=${brandId}`);
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
        Top Brands
      </Typography>
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <ProductsWrapper
          sx={{
            transform: `translateX(-${currentIndex * (100 / 6)}%)`,
          }}
        >
          {brands.map((brand) => (
            <BrandCard key={brand._id} onClick={() => handleBrandClick(brand._id)}>
              <ImageWrapper>
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 16.666vw"
                  style={{
                    objectFit: 'cover',
                  }}
                  priority
                />
                <Overlay className="overlay">
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      fontWeight: 500,
                      fontSize: "24px",
                      marginBottom: 1
                    }}
                  >
                    {brand.name}
                  </Typography>
                  <ShopNowButton>
                    Shop Now
                  </ShopNowButton>
                </Overlay>
              </ImageWrapper>
            </BrandCard>
          ))}
        </ProductsWrapper>

        <NavigationButton 
          className="left"
          onClick={handlePrev}
        >
          <ChevronLeft />
        </NavigationButton>

        <NavigationButton 
          className="right"
          onClick={handleNext}
        >
          <ChevronRight />
        </NavigationButton>
      </Box>
    </CarouselContainer>
  );
};

export default TopBrands;
