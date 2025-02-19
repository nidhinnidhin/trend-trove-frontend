import React from "react";
import { useRouter } from "next/router";
import { useFilter } from "@/context/filterContext";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import { motion } from "framer-motion";

const styles = {
  container: {
    width: "100%",
    margin: "0 auto",
    padding: "20px",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  card: {
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s, box-shadow 0.3s",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    },
  },
  numberBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    width: "32px",
    height: "32px",
    backgroundColor: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    zIndex: 1,
  },
  imageContainer: {
    height: 320,
    padding: "10px",
    backgroundColor: "#f7fafc",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    cursor: "pointer",
    borderRadius: "10px 10px 0 0",
  },
  contentArea: {
    flexGrow: 1,
    padding: "16px",
  },
  priceTag: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  price: {
    color: "#333",
    fontWeight: "bold",
    fontSize: "1.25rem",
  },
  metaContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  },
  ratingChip: {
    backgroundColor: "#ff6f61",
    color: "white",
    fontSize: "0.75rem",
    margin: "5px 0",
    borderRadius: "4px",
    fontFamily: "'Poppins', sans-serif",
  },
  variantText: {
    fontFamily: "'Open Sans', sans-serif",
    color: "text.secondary",
  },
  actionButtons: {
    display: "flex",
    gap: "4px",
  },
};

const Products = ({ products, loading }) => {
  const router = useRouter();
  const { filterState } = useFilter();

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


  const filteredAndSortedProducts = sortProducts(filterProducts(products));

  const handleProductDetail = (id) => {
    router.push(`/product/${id}`);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Box sx={styles.container}>
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
        Latest Products
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
        <Grid container spacing={2}>
          {filteredAndSortedProducts.map((product, index) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Grid sx={styles.card} onClick={() => handleProductDetail(product.id)}>
                  {/* Number Badge */}
                  <Box sx={styles.numberBadge}>
                    <Typography variant="body2" fontWeight={500}>
                      {index + 1}
                    </Typography>
                  </Box>

                  <Box sx={styles.imageContainer}>
                    <CardMedia
                      component="img"
                      image={product.image}
                      alt={product.title}
                      sx={styles.productImage}
                    />
                  </Box>

                  <CardContent sx={styles.contentArea}>
                    <Box sx={styles.priceTag}>
                      <Typography sx={styles.price}>
                        ₹{product.price}
                      </Typography>
                    </Box>

                    <Box sx={styles.metaContainer}>
                      <Box>
                        <Chip
                          label={`${product.rating || "No"} Rating`}
                          size="small"
                          sx={styles.ratingChip}
                        />
                        <Typography variant="body2" sx={styles.variantText}>
                          Variants: {product.variantsCount}
                        </Typography>
                      </Box>

                      <Box sx={styles.actionButtons}>
                        <IconButton size="small" color="inherit" >
                          <FavoriteIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="inherit">
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Grid>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Products;
