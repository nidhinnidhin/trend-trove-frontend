import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Pagination,
} from "@mui/material";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import Filter from "../components/filter";
import { useFilter } from "@/context/filterContext";
import { motion } from "framer-motion";
import axiosInstance from "@/utils/axiosInstance";

const SearchResults = () => {
  const router = useRouter();
  const { search, brand, category } = router.query;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8; // Items per page
  const { filterState } = useFilter();

  useEffect(() => {
    if (search || brand || category || router.query.gender) {
      setLoading(true);
      let endpoint = '';
      
      if (brand) {
        endpoint = `/products/brand/${brand}`;
      } else if (category) {
        endpoint = `/products/category/${category}?page=${page}&limit=${limit}`;
      } else if (router.query.gender) {
        endpoint = `/products/gender/${router.query.gender}?page=${page}&limit=${limit}`;
      } else {
        endpoint = `/products/product/search/related?query=${search}`;
      }

      axiosInstance
        .get(endpoint)
        .then((response) => {
          let productsToTransform = [];
          let total = 0;
          
          if (category) {
            productsToTransform = response.data.products || [];
            total = response.data.totalProducts || 0;
            setTotalPages(Math.ceil(total / limit));
          } else if (brand) {
            productsToTransform = response.data.products || [];
          } else {
            productsToTransform = response.data.productsWithRelated || [];
          }

          const transformedProducts = productsToTransform.map((item) => {
            const product = category || brand ? item : (item.product || item);
            const colorImages = product.variants.map(variant => ({
              color: variant.color,
              colorImage: variant.colorImage,
            }));

            return {
              id: product._id,
              image: product.variants[0]?.mainImage,
              title: product.name,
              description: product.description,
              rating: product.ratings || 0,
              price: product.variants[0]?.sizes[0]?.price || 0,
              originalPrice: product.variants[0]?.sizes[0]?.price || 0,
              variantsCount: product.variants.length,
              category: product.category?.name,
              gender: product.gender,
              colorImages,
            };
          });

          setProducts(transformedProducts);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
          setLoading(false);
        });
    }
  }, [search, brand, category, router.query.gender, page]);

  const filterProducts = (products) => {
    return products.filter((product) => {
      const price = product.price;
      if (
        price < filterState.priceRange[0] ||
        price > filterState.priceRange[1]
      )
        return false;
      if (
        filterState.categories.length > 0 &&
        !filterState.categories.includes(product.category)
      )
        return false;
      if (
        filterState.selectedGenders.length > 0 &&
        !filterState.selectedGenders.includes(product.gender)
      )
        return false;
      if (
        filterState.selectedRatings.length > 0 &&
        !filterState.selectedRatings.includes(Math.floor(product.rating))
      )
        return false;
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleProductDetail = (id) => {
    router.push(`/product/${id}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const filteredProducts = sortProducts(filterProducts(products));

  return (
    <>
      <Header />
      <Box
        sx={{
          width: "100%",
          margin: "0 auto",
          padding: "20px",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          display: "flex"
        }}
      >
        <Filter/>
        <Box sx={{ width: '100%' }}>
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
          ) : filteredProducts.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "50vh",
                textAlign: "center",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "#666",
                  fontFamily: "'Poppins', sans-serif",
                  marginBottom: 2,
                }}
              >
                No Products Available
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#888",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                We couldn't find any products matching your criteria.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={2}>
                {filteredProducts.map((product, index) => (
                  <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                    <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <Grid
                        sx={{
                          margin:"0px 10px",
                          height: "600px",
                          width:"300px",
                          display: "flex",
                          flexDirection: "column",
                          transition: "transform 0.3s, box-shadow 0.3s",
                          "&:hover": {
                            transform: "translateY(-5px)",
                            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={product.image}
                          alt={product.title}
                          sx={{
                            height: 450,
                            padding: "10px",
                            objectFit: "cover",
                            cursor: "pointer",
                            borderRadius: "10px 10px 0 0",
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
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: "bold", color: "#333" }}
                            >
                              ₹{product.price}
                            </Typography>
                            <Box sx={{ display: "flex", gap: "5px" }}>
                              {product.colorImages.map((colorVariant) => (
                                <img
                                  key={colorVariant.color}
                                  src={colorVariant.colorImage}
                                  alt={colorVariant.color}
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    border: "2px solid #ff6f61",
                                    cursor: "pointer",
                                  }}
                                  title={colorVariant.color}
                                />
                              ))}
                            </Box>
                          </Box>
                        </CardContent>
                      </Grid>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {/* Add Pagination */}
              {category && (
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
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#333',
                        '&.Mui-selected': {
                          bgcolor: '#ff6f61',
                          color: '#fff',
                          '&:hover': {
                            bgcolor: '#ff5f50',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default SearchResults;
