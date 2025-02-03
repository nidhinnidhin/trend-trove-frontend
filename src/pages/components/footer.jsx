import React from "react";
import { Box, Typography, Link, Grid, Divider, IconButton } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        padding: "40px 20px",
        marginTop: "40px",
        fontSize: "14px",
      }}
    >
      {/* Links Section */}
      <Grid container spacing={4} columns={{ xs: 2, sm: 4, md: 12 }}>
        {/* Column 1 */}
        <Grid item xs={1} sm={2} md={3}>
          <Typography variant="h6" gutterBottom>
            Men
          </Typography>
          <Link
            href="#"
            color="inherit"
            underline="hover"
            display="block"
            sx={{ marginBottom: "8px" }}
          >
            T-Shirts
          </Link>
          <Link
            href="#"
            color="inherit"
            underline="hover"
            display="block"
            sx={{ marginBottom: "8px" }}
          >
            Shirts
          </Link>
          <Link
            href="#"
            color="inherit"
            underline="hover"
            display="block"
            sx={{ marginBottom: "8px" }}
          >
            Jeans
          </Link>
          <Link href="#" color="inherit" underline="hover" display="block">
            Jackets
          </Link>
        </Grid>

        {/* Column 2 */}
        <Grid item xs={1} sm={2} md={3}>
          <Typography variant="h6" gutterBottom>
            Women
          </Typography>
          <Link
            href="#"
            color="inherit"
            underline="hover"
            display="block"
            sx={{ marginBottom: "8px" }}
          >
            Dresses
          </Link>
          <Link
            href="#"
            color="inherit"
            underline="hover"
            display="block"
            sx={{ marginBottom: "8px" }}
          >
            Tops
          </Link>
          <Link
            href="#"
            color="inherit"
            underline="hover"
            display="block"
            sx={{ marginBottom: "8px" }}
          >
            Skirts
          </Link>
          <Link href="#" color="inherit" underline="hover" display="block">
            Handbags
          </Link>
        </Grid>

        {/* Column 3 */}
        <Grid item xs={1} sm={2} md={3}>
          <Typography variant="h6" gutterBottom>
            Kids
          </Typography>
          <Link
            href="#"
            color="inherit"
            underline="hover"
            display="block"
            sx={{ marginBottom: "8px" }}
          >
            Boys' Clothing
          </Link>
          <Link
            href="#"
            color="inherit"
            underline="hover"
            display="block"
            sx={{ marginBottom: "8px" }}
          >
            Girls' Clothing
          </Link>
          <Link
            href="#"
            color="inherit"
            underline="hover"
            display="block"
            sx={{ marginBottom: "8px" }}
          >
            Baby Wear
          </Link>
          <Link href="#" color="inherit" underline="hover" display="block">
            Toys
          </Link>
        </Grid>

        {/* Column 4 */}
        <Grid item xs={1} sm={2} md={3}>
          <Typography variant="h6" gutterBottom>
            Accessories
          </Typography>
          <Link
            href="#"
            color="inherit"
            underline="hover"
            display="block"
            sx={{ marginBottom: "8px" }}
          >
            Belts
          </Link>
          <Link
            href="#"
            color="inherit"
            underline="hover"
            display="block"
            sx={{ marginBottom: "8px" }}
          >
            Watches
          </Link>
          <Link
            href="#"
            color="inherit"
            underline="hover"
            display="block"
            sx={{ marginBottom: "8px" }}
          >
            Sunglasses
          </Link>
          <Link href="#" color="inherit" underline="hover" display="block">
            Footwear
          </Link>
        </Grid>
      </Grid>

      {/* Divider */}
      <Divider sx={{ marginY: "20px" }} />

      {/* Footer Bottom Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Left Section */}
        <Typography variant="body2" color="text.secondary">
          © 2025 Clothing Store. All rights reserved.
        </Typography>

        {/* Social Icons */}
        <Box>
          <IconButton href="#" color="inherit">
            <FacebookIcon />
          </IconButton>
          <IconButton href="#" color="inherit">
            <LinkedInIcon />
          </IconButton>
          <IconButton href="#" color="inherit">
            <TwitterIcon />
          </IconButton>
          <IconButton href="#" color="inherit">
            <InstagramIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
