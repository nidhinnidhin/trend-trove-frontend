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

// Styled offer badge using emotion
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
  .group {
    display: flex;
    line-height: 28px;
    align-items: center;
    position: relative;
    max-width: 250px;
    margin: 10px 0px;
  }

  .input {
    font-family: "Montserrat", sans-serif;
    width: 100%;
    height: 45px;
    padding-left: 2.5rem;
    box-shadow: 0 0 0 1.5px #2b2c37, 0 0 25px -17px #000;
    border: 0;
    border-radius: 12px;
    background-color: #fff;
    outline: none;
    color: black;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
    cursor: text;
    z-index: 0;
  }

  .input::placeholder {
    color: black;
  }

  .input:hover {
    box-shadow: 0 0 0 2.5px #2f303d, 0px 0px 25px -15px #000;
  }

  .input:active {
    transform: scale(0.95);
  }

  .input:focus {
    box-shadow: 0 0 0 2.5px #2f303d;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    fill: rgb(3, 3, 3);
    width: 1rem;
    height: 1rem;
    pointer-events: none;
    z-index: 1;
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
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

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

  const handleCategoryClick = (category) => {
    updateFilters({ categories: [category] });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value); // Update search query as the user types
  };

  const filterProducts = (products) => {
    return products.filter((product) => {
      // Filter by search query
      if (
        searchQuery &&
        !product.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter by price range
      const price = product.price;
      if (
        price < filterState.priceRange[0] ||
        price > filterState.priceRange[1]
      ) {
        return false;
      }

      // Filter by categories
      if (
        filterState.categories.length > 0 &&
        !filterState.categories.includes(product.category)
      ) {
        return false;
      }

      // Filter by gender
      if (
        filterState.selectedGenders.length > 0 &&
        !filterState.selectedGenders.includes(product.gender)
      ) {
        return false;
      }

      // Filter by ratings
      if (
        filterState.selectedRatings.length > 0 &&
        !filterState.selectedRatings.includes(Math.floor(product.rating))
      ) {
        return false;
      }

      // Filter by discounts
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
          {/* Search Input Field with Animation */}
          <CategoryCarousel
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />
          {/* <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              marginBottom: "20px",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TextField
                label="Search Products"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  width: "300px",
                  backgroundColor: "white",
                  borderRadius: "4px",
                }}
              />
            </motion.div>
          </Box> */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              marginBottom: "20px",
            }}
          >
            <StyledWrapper>
              <div className="group">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="search-icon"
                >
                  <g>
                    <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z" />
                  </g>
                </svg>
                <input
                  id="query"
                  className="input"
                  type="search"
                  placeholder="Search products..."
                  name="searchbar"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </StyledWrapper>
          </Box>
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
                        height: "650px",
                        display: "flex",
                        flexDirection: "column",
                        border: "0.5px solid lightgray",
                        position: "relative",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                        },
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
