import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardMedia, Typography } from "@mui/material";
import { motion } from "framer-motion";

const TopBrands = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("http://localhost:9090/api/brands");
        const data = await response.json();
        setBrands(data.slice(0, 6));
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchBrands();
  }, []);

  return (
    <Box
      sx={{
        padding: "40px 20px",
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
        Top Brands
      </Typography>
      <Grid container spacing={4} justifyContent="center" sx={{ width: "90%" }}>
        {brands.map((brand) => (
          <Grid item key={brand._id} xs={12} sm={6} md={4} lg={4}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "20px",
                  height: "170px",
                  cursor:"pointer",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={brand.image}
                  alt={brand.name}
                  sx={{
                    width: "100%",
                    height: "100px",
                    objectFit: "contain",
                    marginBottom: "10px",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "600",
                    fontFamily: "'Poppins', sans-serif",
                    color: "#333",
                  }}
                >
                  {brand.name}
                </Typography>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TopBrands;
