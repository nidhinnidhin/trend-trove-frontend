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
} from "@mui/material";
import axios from "axios"; // For fetching data
import Header from "../components/header";
import Footer from "../components/footer";
import Filter from "../components/filter";
import { useFilter } from "@/context/filterContext"; // Import the filter context

const SearchResults = () => {
  const router = useRouter();
  const { search } = router.query; // Extract the query parameter from the URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { filterState } = useFilter(); // Get the filter state from context

  // Fetch products based on the search query and filters
  useEffect(() => {
    if (search) {
      setLoading(true);
      // Construct the filter query string
      const filterParams = new URLSearchParams({
        query: search,
        minPrice: filterState.priceRange[0],
        maxPrice: filterState.priceRange[1],
        categories: filterState.categories.join(","),
        genders: filterState.selectedGenders.join(","),
        ratings: filterState.selectedRatings.join(","),
        discounts: filterState.selectedDiscounts.join(","),
      }).toString();

      // Fetch filtered products
      axios
        .get(
          `http://localhost:9090/api/products/product/search/related?${filterParams}`
        )
        .then((response) => {
          console.log(response.data.productsWithRelated); // Log the whole response
          const products = response.data.productsWithRelated;
          if (Array.isArray(products)) {
            setProducts(products); // Update state with products
          } else {
            console.error("productsWithRelated is not an array", products);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
          setLoading(false);
        });
    }
  }, [search, filterState]); // Re-run when search or filterState changes

  return (
    <>
      <Header />
      <Box sx={{display:"flex"}}>
        <Filter />
        <Box
          sx={{
            width: "100%",
            backgroundColor: "#f9f9f9",
            padding: "20px",
            minHeight: "100vh",
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            Products
          </Typography>

          {loading ? (
            <Typography variant="h6" align="center">
              Loading...
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {products.map((item) => {
                const product = item.product;
                return (
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
                        image={product.variants[0]?.mainImage}
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
                        onClick={() => router.push(`/product/${product._id}`)}
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
                      </CardContent>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px",
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          ₹{product.variants[0]?.sizes[0]?.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Variants: {product.variants.length}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default SearchResults;
