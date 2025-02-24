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
  TextField,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import styled from "@emotion/styled";
import axios from "axios";
import CategoryCarousel from "../components/categoryCarousal";
import axiosInstance from "@/utils/axiosInstance";

const OfferBadge = styled(Chip)`
  position: absolute;
  top: 12px;
  left: -6px;
  background-color: #212121; /* Standard black */
  color: white;
  font-weight: 600;
  font-size: 13px;
  padding: 0 10px;
  height: 24px;
  z-index: 1;
  font-family: "Poppins", sans-serif;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);

  &::before {
    content: "";
    position: absolute;
    left: 0;
    bottom: -6px;
    width: 6px;
    height: 6px;
    background-color: #1a1a1a; /* Slightly lighter black */
    clip-path: polygon(0 0, 100% 0, 100% 100%);
  }

  &::after {
    content: "";
    position: absolute;
    right: -6px;
    top: 0;
    width: 6px;
    height: 24px;
    background-color: #212121;
    clip-path: polygon(0 0, 100% 50%, 0 100%);
  }

  &:hover {
    background-color: #333333; /* Slightly lighter black on hover */
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
    transition: all 0.2s ease;
  }
`;

const StyledWrapper = styled.div`
  width: 100%; // Full width for the search bar
  margin: 15px 0px;
  .input {
    width: 100%; // Full width for the input
    height: 45px;
    padding-left: 2.5rem;
    border: 1px solid #ccc; // Standard border
    border-radius: 5px;
    background-color: #fff;
    outline: none;
    color: black;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
    font-family: "Montserrat", sans-serif;
  }
  .input::placeholder {
    color: #aaa; // Placeholder color
  }
  .input:hover {
    border: 2px solid #ff6f61; // Change border color on hover
  }
  .input:focus {
    border-color: #ff6f61; // Change border color on focus
    box-shadow: 0 0 0 2px rgba(255, 111, 97, 0.5); // Shadow on focus
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
  const { filterState, updateFilters } = useFilter();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("categories");
        setCategories(response.data.categories.map((cat) => cat.name));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    updateFilters({ categories: [category] });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filterProducts = (products) => {
    return products.filter((product) => {
      if (
        searchQuery &&
        !product.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

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
          <CategoryCarousel
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />

          <StyledWrapper>
            <input
              id="query"
              className="input"
              type="search"
              placeholder="Search products..."
              name="searchbar"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </StyledWrapper>

          <Grid container spacing={1}>
            {filteredAndSortedProducts.map((product, index) => {
              console.log("Productttttttt", product);

              return (
                <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Grid
                      sx={{
                        height: "550px",
                        display: "flex",
                        flexDirection: "column",
                        border: "0.5px solid lightgray",
                        position: "relative",
                       
                      }}
                    >
                      {product.isOfferActive &&
                        product.discountPercentage > 0 && (
                          <OfferBadge
                            label={`${product.discountPercentage}% OFF`}
                            sx={{
                              "& .MuiChip-label": {
                                padding: "0 4px",
                                fontSize: "0.575rem",
                                lineHeight: "1.2",
                              },
                            }}
                          />
                        )}

                      <CardMedia
                        component="img"
                        image={product.image}
                        alt={product.title}
                        sx={{
                          height: 450,
                          objectFit: "cover",
                          cursor: "pointer",
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.02)",
                          },
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
                            fontSize: "15px",
                          }}
                        >
                          {product.title.slice(0, 20)}...
                        </Typography>
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
                              ₹{product.price.toFixed(1)}
                            </Typography>
                            {product.isOfferActive &&
                              product.originalPrice > product.price && (
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
                          <Box sx={{ display: "flex", gap: "5px" }}>
                            {product.colorImages.map((colorVariant) => {
                              console.log("COLORRRR", colorVariant);

                              return (
                                <img
                                  key={colorVariant.color}
                                  src={colorVariant}
                                  alt={colorVariant.color}
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    border: "2px solid black",
                                    cursor: "pointer",
                                    objectFit: "contain",
                                  }}
                                  title={colorVariant.color}
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      </CardContent>
                    </Grid>
                  </motion.div>
                </Grid>
              );
            })}
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
