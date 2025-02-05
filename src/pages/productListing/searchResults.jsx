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
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import Filter from "../components/filter";
import { useFilter } from "@/context/filterContext";

const SearchResults = () => {
  const router = useRouter();
  const { search } = router.query;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { filterState } = useFilter();

  useEffect(() => {
    if (search) {
      setLoading(true);
      axios
        .get(
          `http://localhost:9090/api/products/product/search/related?query=${search}`
        )
        .then((response) => {
          const products = response.data.productsWithRelated;
          if (Array.isArray(products)) {
            const transformedProducts = products.map((item) => ({
              id: item.product._id,
              image: item.product.variants[0]?.mainImage,
              title: item.product.name,
              description: item.product.description,
              rating: item.product.ratings || 0,
              price: item.product.variants[0]?.sizes[0]?.price || 0,
              originalPrice: item.product.variants[0]?.sizes[0]?.price || 0,
              variantsCount: item.product.variants.length,
              category: item.product.category?.name,
              gender: item.product.gender,
            }));
            setProducts(transformedProducts);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
          setLoading(false);
        });
    }
  }, [search]);

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

  const filteredProducts = sortProducts(filterProducts(products));

  return (
    <>
      <Header />
      <Box sx={{ display: "flex" }}>
        <Filter />
        <Box
          sx={{
            width: "90%",
            backgroundColor: "#f9f9f9",
            padding: "20px",
            minHeight: "100vh",
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            Search Results
          </Typography>

          {loading ? (
            <Typography variant="h6" align="center">
              Loading...
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredProducts.map((product) => (
                <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0",
                      border: "0.5px solid lightgray",
                      "&:hover": { boxShadow: 3 },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={product.image}
                      alt={product.title}
                      sx={{
                        height: 320,
                        padding: "10px",
                        objectFit: "contain",
                        cursor: "pointer",
                        transition: "transform 0.3s",
                        "&:hover": { transform: "scale(1.05)" },
                      }}
                      onClick={() => router.push(`/product/${product.id}`)}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {product.title.split('').slice(0,30)}...
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
                        label={`${product.rating || "No"} Rating`}
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
                          ₹{product.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Variants: {product.variantsCount}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default SearchResults;
