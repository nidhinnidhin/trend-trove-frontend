import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import axios from "axios";
import { useRouter } from "next/router";

const Products = () => {
  const [products, setProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:9090/api/products/get");
        console.log(response.data);

        // Transform the API response into the format needed for rendering
        const transformedProducts = response.data.map((product) => {
          // Extracting the first variant and its first size
          const variant = product.variants[0];
          const firstSize = variant.sizes[0]; // Assuming there's always at least one size

          return {
            id: product._id,
            image: variant.mainImage, // Using the main image for the product card
            title: product.name, // Product name
            description: product.description, // Product description
            rating: product.ratings || 0, // Using the product's rating
            price: `$${firstSize.discountPrice || firstSize.price}`, // Show discount price if available
            variantsCount: product.variants.length, // Number of variants available
            color: variant.color, // Variant color (using the first variant's color)
            isDeleted: product.isDeleted,
          };
        });

        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductDetail = (id) => {
    router.push(`/product/${id}`);
  };

  return (
    <Box
      sx={{
        width: "90%",
        backgroundColor: "#f9f9f9",
        padding: "20px 0",
        minHeight: "100vh",
      }}
    >
      <Box>
        <Typography variant="h4" align="center" gutterBottom>
          Products
        </Typography>
        <Grid container spacing={1}>
          {products
            .filter((product) => !product.isDeleted) // Exclude deleted products
            .map((product) => (
              <Grid
                item
                key={product.id}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Card
                  sx={{
                    borderRadius: "5px",
                    overflow: "hidden",
                    border: "1px solid #e0e0e0",
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.title}
                    sx={{
                      padding: "10px",
                      height: 250,
                      objectFit: "contain",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                    onClick={() => handleProductDetail(product.id)}
                  />

                  <CardContent
                    sx={{
                      padding: 2,
                      flexGrow: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, fontSize: "16px" }}
                    >
                      {product.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        margin: "8px 0",
                        height: "40px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {product.description}
                    </Typography>
                    <Button
                      startIcon={<StarIcon />}
                      variant="contained"
                      size="small"
                      disableElevation
                      sx={{
                        backgroundColor: "green",
                        color: "white",
                        textTransform: "capitalize",
                        marginBottom: 1,
                        "&:hover": {
                          backgroundColor: "darkgreen",
                        },
                      }}
                    >
                      {product.rating || "No"} Rating
                    </Button>
                  </CardContent>

                  <Box
                    sx={{
                      padding: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "primary.main",
                      }}
                    >
                      {product.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Variants: {product.variantsCount}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Products;
