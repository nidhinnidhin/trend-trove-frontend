import React, { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import Image from "next/image";
import styled from "@emotion/styled";

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
  
  const brands = [
    {
      id: 1,
      name: "White",
      image: "https://www.coolibar.com/cdn/shop/files/01418-111-1000-02_720x.jpg",
      shopNow: "Shop Now"
    },
    {
      id: 2,
      name: "Navy",
      image: "https://www.coolibar.com/cdn/shop/files/01482-001-1000-2-coolibar-wide-leg-pant-upf-50_14b5d1e2-d713-4c2d-98fb-5f7a6a34d0b2_720x.jpg",
      shopNow: "Shop Now"
    },
    {
      id: 3,
      name: "Peony Pink",
      image: "https://www.coolibar.com/cdn/shop/files/10322-509-1000-02_720x.jpg",
      shopNow: "Shop Now"
    },
    {
      id: 4,
      name: "Tahitian Teal",
      image: "https://www.coolibar.com/cdn/shop/files/10153-930-9001-02_720x.jpg",
      shopNow: "Shop Now"
    },
    {
      id: 5,
      name: "Future Dusk",
      image: "https://www.coolibar.com/cdn/shop/files/01262-001-1000-02_ad8ece1d-79f0-4ae8-a996-f93a9840eddc_720x.jpg",
      shopNow: "Shop Now"
    },
    {
      id: 6,
      name: "Black",
      image: "https://www.coolibar.com/cdn/shop/files/01496-509-1000-02_ec635664-00dd-403e-a2ca-2c83439fc2a0_720x.jpg",
      shopNow: "Shop Now"
    }
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % (brands.length - 5));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + (brands.length - 5)) % (brands.length - 5));
  };

  return (
    <CarouselContainer>
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <ProductsWrapper
          sx={{
            transform: `translateX(-${currentIndex * (100 / 6)}%)`,
          }}
        >
          {brands.map((brand) => (
            <BrandCard key={brand.id}>
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
                    {brand.shopNow}
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
