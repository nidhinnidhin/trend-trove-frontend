import React, { useState, useEffect } from "react";
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
import { useRouter } from "next/router";

// Styled Components
const CarouselContainer = styled(Box)`
  width: 100%;
  max-width: 1400px;
  margin: 10px auto;
  padding: 0;
  position: relative;
`;

const CarouselViewport = styled(Box)`
  position: relative;
  overflow: hidden;
  padding: 0 40px;
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

const NavigationButton = styled(IconButton)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #fff;
  border: 1px solid #e0e0e0;
  width: 40px;
  height: 40px;
  z-index: 10;
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

const TrendingWears = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const itemsPerView = 4;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://13.126.18.175:9090/api/products/get?page=1&limit=8"
        );
        const data = await response.json();
        
        // Filter products for trending wears category
        const trendingProducts = data.products.filter(
          product => product.category?.name === "Trending Wears"
        );

        const transformedProducts = trendingProducts.map((product) => {
          const variant = product.variants[0];
          const firstSize = variant.sizes[0];
          return {
            id: product._id,
            name: product.name,
            price: `₹${firstSize.discountPrice || firstSize.price}`,
            image: variant.mainImage,
          };
        });
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        {/* You can add a loading spinner here if you want */}
      </Box>
    );
  }

  // Don't render if no products
  if (products.length === 0) {
    return null;
  }

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
        Trending Wears
      </Typography>

      <CarouselViewport>
        <NavigationButton 
          onClick={handlePrev}
          sx={{ left: 0 }}
        >
          <ChevronLeft />
        </NavigationButton>

        <ProductsWrapper
          sx={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            display:"flex",
            justifyContent:"center"
          }}
        >
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              onClick={() => handleProductClick(product.id)}
            >
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

        <NavigationButton 
          onClick={handleNext}
          sx={{ right: 0 }}
        >
          <ChevronRight />
        </NavigationButton>
      </CarouselViewport>

    </CarouselContainer>
  );
};

export default TrendingWears;
