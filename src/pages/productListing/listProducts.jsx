import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Pagination,
} from "@mui/material";
import { Chip } from "@mui/material";

const Explore = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products when the page changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://localhost:9090/api/products/get?page=${currentPage}&limit=5`);
        const data = await response.json();
        console.log("Backend Response:", data); // Log the response

        if (response.ok) {
          setProducts(data.products || []); // Access `data.products` instead of `data`
          setTotalPages(data.totalPages || 1);
          setCurrentPage(data.currentPage || 1);
        } else {
          console.error("Error fetching products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [currentPage]);

  // Handle product detail navigation
  const handleProductDetail = (id) => {
    router.push(`/product/${id}`);
  };

  // Handle pagination change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: value },
    });
  };

  return (
    <Box
      sx={{
        width: "90%",
        backgroundColor: "#f9f9f9",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Products
      </Typography>

      {/* Product Grid */}
      <Grid container spacing={2}>
        {Array.isArray(products) &&
          products.map((product) => (
            <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0",
                  border: "0.5px solid lightgray",
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={product.variants[0].colorImage} // Use the first variant's image
                  alt={product.name}
                  sx={{
                    height: 320,
                    padding: "10px",
                    objectFit: "contain",
                    cursor: "pointer",
                    transition: "transform 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                  onClick={() => handleProductDetail(product._id)}
                />

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {product.name.slice(0, 30)}...
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      height: "40px",
                      overflow: "hidden",
                      marginBottom: 2,
                    }}
                  >
                    {product.description}
                  </Typography>
                  <Chip
                    label={`${product.ratings || "No"} Rating`}
                    size="small"
                    sx={{
                      backgroundColor: "green",
                      color: "white",
                      fontSize: "0.65rem",
                      margin: "5px 0px",
                      borderRadius: "2px",
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      ₹{product.variants[0].sizes[0].price} {/* Use the first variant's first size price */}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Variants: {product.variants.length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default Explore;