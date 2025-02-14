import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useFilter } from "@/context/filterContext";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Pagination,
  CircularProgress,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import axios from "axios";
import CategoryCarousel from "../components/categoryCarousal";

// Styled offer badge using emotion
const OfferBadge = styled(Chip)`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color:rgb(56, 56, 56);
  color: white;
  font-weight: 600;
  padding: 0 8px;
  height: 24px;
  z-index: 1;
  font-family: "Poppins", sans-serif;

  &:hover {
    background-color: #ff385c;
  }
`;

const ListProducts = ({
  products,
  totalPages,
  currentPage,
  onPageChange,
  loading,
}) => {
  const router = useRouter();
  const { filterState } = useFilter();
  const [categories, setCategories] = useState([])


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9090/api/categories"
        );
        setCategories(response.data.categories.map((cat) => cat.name));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  console.log("Categories", categories);
  

  const filterProducts = (products) => {
    return products.filter((product) => {
      const price = product.price;
      if (
        price < filterState.priceRange[0] ||
        price > filterState.priceRange[1]
      ) {
        return false;
      }
      if (
        filterState.categories.length > 0 &&
        !filterState.categories.includes(product.category)
      ) {
        return false;
      }
      if (
        filterState.selectedGenders.length > 0 &&
        !filterState.selectedGenders.includes(product.gender)
      ) {
        return false;
      }
      if (
        filterState.selectedRatings.length > 0 &&
        !filterState.selectedRatings.includes(Math.floor(product.rating))
      ) {
        return false;
      }
      if (filterState.selectedDiscounts.length > 0) {
        const discount =
          ((product.originalPrice - product.price) / product.originalPrice) *
          100;
        return filterState.selectedDiscounts.some(
          (d) => discount >= parseInt(d)
        );
      }
      return true;
    });
  };

  const sortProducts = (products) => {
    const sorted = [...products];
    switch (filterState.sortBy) {
      case "asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "popularity":
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  };

  const calculateDiscount = (originalPrice, currentPrice) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const filteredAndSortedProducts = sortProducts(filterProducts(products));

  const handleProductDetail = (id) => {
    router.push(`/product/${id}`);
  };

  const handlePageChange = (event, value) => {
    onPageChange(value);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box
      sx={{
        width: "90%",
        margin: "0 auto",
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#333",
          marginBottom: "30px",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        All Products
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress sx={{ color: "#ff6f61" }} />
        </Box>
      ) : (
        <>
        <CategoryCarousel categories={categories} />
          <Grid container spacing={1}>
            {filteredAndSortedProducts.map((product, index) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <motion.div
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Grid
                    sx={{
                      height: "650px",
                      display: "flex",
                      flexDirection: "column",
                      // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      border:"0.5px solid lightgray",
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    {product.originalPrice > product.price && (
                      <OfferBadge
                        label={`${calculateDiscount(
                          product.originalPrice,
                          product.price
                        )}% OFF`}
                      />
                    )}

                    <CardMedia
                      component="img"
                      image={product.image}
                      alt={product.title}
                      sx={{
                        height: 450,
                        // padding: "10px",
                        objectFit: "cover",
                        cursor: "pointer",
                        // borderRadius: "10px 10px 0 0",
                      }}
                      onClick={() => handleProductDetail(product.id)}
                    />

                    <CardContent sx={{ flexGrow: 1, padding: "16px" }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: "600",
                          fontFamily: "'Poppins', sans-serif",
                          color: "#333",
                        }}
                      >
                        {product.title.slice(0, 30)}...
                      </Typography>
                      {/* <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          height: "40px",
                          overflow: "hidden",
                          marginBottom: 2,
                          fontFamily: "'Open Sans', sans-serif",
                        }}
                      >
                        {product.description}
                      </Typography> */}
                      <Chip
                        label={`${product.rating || "No"} Rating`}
                        size="small"
                        sx={{
                          backgroundColor: "#ff6f61",
                          color: "white",
                          fontSize: "0.75rem",
                          margin: "5px 0",
                          borderRadius: "4px",
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "10px",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: "#333" }}
                          >
                            ₹{product.price}
                          </Typography>
                          {product.originalPrice > product.price && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#666",
                                textDecoration: "line-through",
                                marginLeft: "4px",
                              }}
                            >
                              ₹{product.originalPrice}
                            </Typography>
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: "'Open Sans', sans-serif" }}
                        >
                          Variants: {product.variantsCount}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Grid>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              marginTop: "40px",
              marginBottom: "20px",
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#333",
                  "&.Mui-selected": {
                    backgroundColor: "#ff6f61",
                    color: "white",
                  },
                  "&:hover": {
                    backgroundColor: "#ff6f61",
                    color: "white",
                  },
                },
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ListProducts;
