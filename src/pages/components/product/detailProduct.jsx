import { FaCartPlus } from "react-icons/fa";
import React from "react";
import {
  Grid,
  Button,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Breadcrumbs,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  Chip,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import StarIcon from "@mui/icons-material/Star";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import { useDispatch, useSelector } from "react-redux";
import { setCartLength } from "@/redux/features/cartSlice";
import { motion } from "framer-motion";
import styled from "@emotion/styled";
import SecurityIcon from "@mui/icons-material/Security";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import axiosInstance from "@/utils/axiosInstance";
import ProductReviews from "../productReviews/review";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const DetailProduct = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [variants, setVariants] = useState([]);
  const [variantIndex, setVariantIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);

  const settings = {
    dots: false, // Hide default dots
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false, // Hide default arrows
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const scaleIn = {
    initial: { scale: 0.95 },
    animate: { scale: 1 },
    transition: { duration: 0.3 },
  };

  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("usertoken") !== null) {
      setIsLoggedIn(localStorage.getItem("usertoken"));
    }
    if (id) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get(
            `http://localhost:9090/api/products/${id}/details`
          );
          const productData = response.data.product;
          setVariants(productData.variants);

          const initialVariant = productData.variants[0];
          setVariantIndex(0);
          setMainImage(initialVariant.mainImage);
          setSelectedColor(initialVariant.color);

          const initialSize = initialVariant.sizes[0]?.size || "";
          setSelectedSize(initialSize);

          setProduct({
            id: productData._id,
            image: initialVariant.mainImage,
            title: productData.name,
            description: productData.description,
            price: initialVariant.sizes[0]?.price || 0,
            discountPrice: initialVariant.sizes[0]?.discountPrice || 0,
            category: productData.category.name,
            sizes: initialVariant.sizes,
            colors: initialVariant.color,
            material: productData.material,
            pattern: productData.pattern,
            brand: productData.brand.name,
            inStock: initialVariant.sizes[0]?.inStock
              ? "Available"
              : "Not Available",
            stockCount: initialVariant.sizes[0]?.stockCount,
            subImages: initialVariant.subImages,
            gender: productData.gender,
          });

          const relatedResponse = await axios.get(
            `http://localhost:9090/api/products/related/${productData.category._id}/${id}`
          );
          setRelatedProducts(relatedResponse.data.relatedProducts);
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      };

      fetchProduct();
    }
  }, [id]);

  const itemsPerView = {
    xs: 1, // mobile
    sm: 2, // tablet
    md: 3, // desktop
  };

  // Calculate total number of slides needed
  const totalProductCount = relatedProducts.reduce(
    (count, product) => count + product.variants.length,
    0
  );
  const maxVisibleItems = 3; // Maximum number of items to show at once
  const totalSlides = Math.max(
    1,
    Math.ceil(totalProductCount / maxVisibleItems)
  );

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  // Get current visible products
  const getCurrentProducts = () => {
    let flattenedProducts = [];
    relatedProducts.forEach((product) => {
      product.variants.forEach((variant) => {
        flattenedProducts.push({
          productId: product._id,
          variant: variant,
        });
      });
    });

    const startIndex = currentIndex * maxVisibleItems;
    return flattenedProducts.slice(startIndex, startIndex + maxVisibleItems);
  };

  const handleQuantityChange = (action) => {
    if (action === "increment" && quantity < 4 && quantity < product.stockCount)
      setQuantity(quantity + 1);
    if (action === "decrement" && quantity > 1) setQuantity(quantity - 1);
  };

  const handleColorChange = (index) => {
    setVariantIndex(index);
    setMainImage(variants[index].mainImage);
    setSelectedColor(variants[index].color);
    const initialSize = variants[index].sizes[0]?.size || "";
    setSelectedSize(initialSize);

    setProduct({
      ...product,
      image: variants[index].mainImage,
      colors: variants[index].color,
      sizes: variants[index].sizes,
      price: variants[index].sizes[0]?.price || 0,
      discountPrice: variants[index].sizes[0]?.discountPrice || 0,
      inStock: variants[index].sizes[0]?.inStock
        ? "Available"
        : "Not Available",
      stockCount: variants[index].sizes[0]?.stockCount,
      subImages: variants[index].subImages,
    });
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);

    const selectedSizeDetails = variants[variantIndex].sizes.find(
      (item) => item.size === size
    );

    if (selectedSizeDetails) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        price: selectedSizeDetails.price,
        discountPrice: selectedSizeDetails.discountPrice,
        description: selectedSizeDetails.description || prevProduct.description,
        inStock: selectedSizeDetails.inStock ? "Available" : "Not Available",
        stockCount: selectedSizeDetails.stockCount,
      }));
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      router.push("/authentication/loginSignup");
      return;
    }

    if (!selectedSize || !selectedColor) {
      alert("Please select a size and color before adding to the cart.");
      return;
    }

    if (quantity > 4) {
      alert("Maximum quantity limit is 4.");
      return;
    }

    const productData = {
      productId: product.id,
      variantId: variants[variantIndex]._id,
      sizeVariantId: variants[variantIndex].sizes.find(
        (size) => size.size === selectedSize
      )?._id,
      quantity,
    };

    try {
      const response = await axiosInstance.post(
        "/cart/add-to-cart",
        productData
      );
      if (response.status === 201) {
        setSnackbarMessage("Product added to cart successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        const cartResponse = await axiosInstance.get("/cart/get-cart");

        dispatch(setCartLength(cartResponse.data.cart.items.length));
      }
    } catch (error) {
      console.error("Error adding product to cart", error);
      setSnackbarMessage("Failed to add to cart. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isLoggedIn) {
      router.push("/authentication/loginSignup");
      return;
    }

    if (!selectedSize || !selectedColor) {
      alert("Please select a size and color before adding to the wishlist.");
      return;
    }

    const wishlistData = {
      productId: product.id,
      variantId: variants[variantIndex]._id,
      sizeVariantId: variants[variantIndex].sizes.find(
        (size) => size.size === selectedSize
      )?._id,
    };

    try {
      const response = await axiosInstance.post(
        "/user/wishlist/add",
        wishlistData
      );

      if (response.status === 201) {
        setSnackbarMessage("Product added to wishlist successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error adding product to wishlist", error);
      setSnackbarMessage("Failed to add to wishlist. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleImageHover = (e) => {
    if (!product?.image) return;

    const image = e.currentTarget;
    const { left, top, width, height } = image.getBoundingClientRect();

    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setMousePosition({ x: e.clientX, y: e.clientY });
    setZoomPosition({ x, y });
    setShowZoom(true);
  };

  const handleImageLeave = () => {
    setShowZoom(false);
  };

  const handleProductDetail = (id) => {
    router.push(`/product/${id}`);
  };

  const sliderRef = React.useRef(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Grid
        container
        spacing={3}
        sx={{
          width: "90%",
          margin: "2rem auto",
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        }}
      >
        <Grid item xs={12}>
          <motion.div {...fadeIn}>
            <Breadcrumbs
              aria-label="breadcrumb"
              sx={{
                padding: "1rem 0",
                "& a": {
                  color: "#666",
                  textDecoration: "none",
                  "&:hover": { color: "#000" },
                },
              }}
            >
              <Link href="/">Home</Link>
              <Typography color="textPrimary">
                {product?.title?.slice(0, 50)}
              </Typography>
            </Breadcrumbs>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6} sx={{ position: "relative" }}>
          <motion.div {...scaleIn}>
            <Box
              className="image-container"
              sx={{
                position: "relative",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#f8f9fa",
                height: "700px",
              }}
            >
              <Box
                onMouseMove={handleImageHover}
                onMouseLeave={handleImageLeave}
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  cursor: "crosshair",
                }}
              >
                <img
                  src={mainImage}
                  alt="Main Product"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />

                <Chip
                  label={
                    product?.stockCount > 0
                      ? `In Stock ${product.stockCount} units available`
                      : "Out of Stock"
                  }
                  color={product?.stockCount > 0 ? "success" : "error"}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 2,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    ...(product?.stockCount > 0
                      ? {
                          backgroundColor: "#4CAF50",
                          color: "white",
                        }
                      : {
                          backgroundColor: "#f44336",
                          color: "white",
                        }),
                  }}
                />
              </Box>
            </Box>

            {/* Zoom Window */}
            {showZoom && (
              <Box
                sx={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "600px",
                  height: "600px",
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                <img
                  src={mainImage}
                  alt="Zoomed Product"
                  style={{
                    position: "absolute",
                    width: "200%",
                    height: "200%",
                    objectFit: "contain",
                    transform: `translate(-${zoomPosition.x}%, -${zoomPosition.y}%)`,
                  }}
                />
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                gap: "10px",
                marginTop: "1rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {product?.subImages?.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Box
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setMainImage(image);
                    }}
                    sx={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "4px",
                      overflow: "hidden",
                      border:
                        currentImageIndex === index
                          ? "2px solid #000"
                          : "1px solid #ddd",
                      cursor: "pointer",
                      opacity: currentImageIndex === index ? 1 : 0.6,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        opacity: 1,
                        borderColor: "#000",
                      },
                    }}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </motion.div>
              ))}
            </Box>
            {product?.stockCount === 0 && (
              <Box
                sx={{
                  marginTop: "1rem",
                  padding: "1rem",
                  backgroundColor: "#fff4f4",
                  borderRadius: "8px",
                  border: "1px solid #ffebee",
                }}
              >
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ fontSize: "1.2em" }}>•</span>
                  This product is currently out of stock. Please check back
                  later.
                </Typography>
              </Box>
            )}
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div {...fadeIn}>
            <Box
              sx={{
                padding: "2rem",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  marginBottom: "1rem",
                  color: "#2c3e50",
                }}
              >
                {product?.title}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: "#e74c3c",
                    fontWeight: 600,
                  }}
                >
                  {product?.discountPrice}
                </Typography>
                {product?.price && (
                  <Typography
                    variant="h6"
                    sx={{
                      textDecoration: "line-through",
                      color: "#95a5a6",
                    }}
                  >
                    {product?.price}
                  </Typography>
                )}
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: "#34495e",
                  lineHeight: 1.8,
                  marginBottom: "2rem",
                }}
              >
                {product?.description}
              </Typography>

              <Grid container spacing={2} sx={{ marginBottom: "2rem" }}>
                {[
                  ["Brand", product?.brand],
                  ["Category", product?.category],
                  ["Material", product?.material],
                  ["Pattern", product?.pattern],
                  ["Gender", product?.gender],
                ].map(([label, value]) => (
                  <Grid item xs={6} key={label}>
                    <Box
                      sx={{
                        backgroundColor: "#fff",
                        padding: "1rem",
                        borderRadius: "8px",
                        height: "100%",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#7f8c8d", marginBottom: "0.5rem" }}
                      >
                        {label}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "#2c3e50", fontWeight: 500 }}
                      >
                        {value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ marginBottom: "2rem", width: "100%" }}>
                <FormControl
                  fullWidth
                  variant="outlined"
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#bdc3c7",
                      },
                      "&:hover fieldset": {
                        borderColor: "#7f8c8d",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3498db",
                      },
                    },
                  }}
                >
                  <InputLabel sx={{ color: "#34495e" }}>Size</InputLabel>
                  <Select
                    value={selectedSize}
                    onChange={(e) => handleSizeChange(e.target.value)}
                    IconComponent={ExpandMoreIcon}
                    sx={{
                      "& .MuiSelect-select": {
                        padding: "12px",
                      },
                    }}
                  >
                    {variants[variantIndex]?.sizes?.map((size, index) => (
                      <MenuItem
                        key={index}
                        value={size.size}
                        sx={{
                          transition: "background 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#ecf0f1",
                          },
                        }}
                      >
                        {size.size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ marginBottom: "2rem" }}>
                <Typography
                  variant="subtitle1"
                  sx={{ marginBottom: "1rem", color: "#34495e" }}
                >
                  Colors
                </Typography>
                <Box sx={{ display: "flex", gap: "1rem" }}>
                  {variants.map((variant, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Box
                        onClick={() => handleColorChange(index)}
                        sx={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          border:
                            selectedColor === variant.color
                              ? "2px solid #000"
                              : "1px solid #ddd",
                          cursor: "pointer",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={variant.colorImage}
                          alt={variant.color}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Box>

              {product?.stockCount !== 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "2rem",
                    backgroundColor: "#fff",
                    padding: "1rem",
                    borderRadius: "8px",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: "#34495e" }}>
                    Quantity:
                  </Typography>
                  <Button
                    onClick={() => handleQuantityChange("decrement")}
                    variant="outlined"
                    sx={{
                      minWidth: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "1px solid #bdc3c7",
                    }}
                  >
                    -
                  </Button>
                  <Typography sx={{ width: "40px", textAlign: "center" }}>
                    {quantity}
                  </Typography>
                  <Button
                    onClick={() => handleQuantityChange("increment")}
                    variant="outlined"
                    sx={{
                      minWidth: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "1px solid #bdc3c7",
                    }}
                  >
                    +
                  </Button>
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "2rem",
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ flex: 1 }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddToCart}
                    disabled={!isLoggedIn || product?.stockCount === 0}
                    sx={{
                      backgroundColor: "#2c3e50",
                      color: "#fff",
                      padding: "1rem",
                      "&:hover": {
                        backgroundColor: "#34495e",
                      },
                      "&:disabled": {
                        backgroundColor: "#95a5a6",
                      },
                    }}
                  >
                    <ShoppingCartIcon sx={{ marginRight: "0.5rem" }} />
                    {isLoggedIn ? "Add to Cart" : "Login to Add"}
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ flex: 1 }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleButtonClick("Buy Now")}
                    disabled={!isLoggedIn || product?.stockCount === 0}
                    sx={{
                      backgroundColor: "#e67e22",
                      color: "#fff",
                      padding: "1rem",
                      "&:hover": {
                        backgroundColor: "#d35400",
                      },
                      "&:disabled": {
                        backgroundColor: "#95a5a6",
                      },
                    }}
                  >
                    <LocalMallIcon sx={{ marginRight: "0.5rem" }} />
                    {isLoggedIn ? "Buy Now" : "Login to Buy"}
                  </Button>
                </motion.div>
              </Box>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full"
              >
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<FavoriteBorderIcon />}
                  onClick={handleAddToWishlist}
                  sx={{
                    backgroundColor: "#2c3e50",
                    color: "#fff",
                    fontSize: "1rem",
                    marginTop: "10px",
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "#34495e",
                    },
                  }}
                >
                  Add to Wishlist
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div {...fadeIn}>
            <Typography
              variant="h5"
              sx={{
                marginBottom: "2rem",
                marginTop: "3rem",
                fontWeight: 600,
                color: "#2c3e50",
              }}
            >
              {relatedProducts.length !== 0
                ? "You may like"
                : "No Related Products"}
            </Typography>

            {relatedProducts.length > 0 && (
              <Box sx={{ position: "relative", width: "100%", px: 4 }}>
                {/* Left Navigation Button */}
                <IconButton
                  sx={{
                    position: "absolute",
                    left: -40,
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,1)",
                    },
                    zIndex: 2,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                  onClick={() => sliderRef.current.slickPrev()}
                >
                  <ArrowBackIosNewIcon />
                </IconButton>

                {/* Slider */}
                <Slider ref={sliderRef} {...settings}>
                  {relatedProducts.map((product) =>
                    product.variants.map((variant) => (
                      <Box key={variant._id} sx={{ padding: "0 10px" }}>
                        <motion.div
                          whileHover={{ y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              overflow: "hidden",
                              // boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                              cursor: "pointer",
                            }}
                            onClick={() => handleProductDetail(product._id)}
                          >
                            <CardMedia
                              component="img"
                              image={variant.mainImage}
                              alt={variant.name}
                              sx={{
                                height: 400,
                                padding:"10px 0px",
                                objectFit: "contain",
                                transition: "transform 0.3s ease",
                                "&:hover": {
                                  transform: "scale(1.05)",
                                },
                              }}
                            />
                          </Box>
                        </motion.div>
                      </Box>
                    ))
                  )}
                </Slider>

                {/* Right Navigation Button */}
                <IconButton
                  sx={{
                    position: "absolute",
                    right: -40,
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,1)",
                    },
                    zIndex: 2,
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  }}
                  onClick={() => sliderRef.current.slickNext()}
                >
                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>
            )}
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <ProductReviews
            productId={id}
            selectedVariantId={variants[variantIndex]?._id}
            selectedSizeVariantId={
              variants[variantIndex]?.sizes.find(
                (size) => size.size === selectedSize
              )?._id
            }
          />
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default DetailProduct;
