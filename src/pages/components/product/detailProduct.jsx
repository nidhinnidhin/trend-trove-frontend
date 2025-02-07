import { FaCartPlus } from "react-icons/fa";
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

const DetailProduct = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [variants, setVariants] = useState([]);
  const [variantIndex, setVariantIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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

  const handleQuantityChange = (action) => {
    if (action === "increment" && quantity < 4) setQuantity(quantity + 1);
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
      const response = await axios.post(
        "http://localhost:9090/api/cart/add-to-cart",
        productData,
        {
          headers: {
            Authorization: `Bearer ${isLoggedIn}`,
          },
        }
      );
      if (response.status === 201) {
        setSnackbarMessage("Product added to cart successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        // Fetch the updated cart length
        const cartResponse = await axios.get(
          "http://localhost:9090/api/cart/get-cart",
          {
            headers: {
              Authorization: `Bearer ${isLoggedIn}`,
            },
          }
        );

        // Dispatch the updated cart length to Redux
        dispatch(setCartLength(cartResponse.data.cart.items.length));
      }
    } catch (error) {
      console.error("Error adding product to cart", error);
      setSnackbarMessage("Failed to add to cart. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  const [zoomStyle, setZoomStyle] = useState({});
  const theme = useTheme();

  const handleMouseMove = (e) => {
    const image = e.target;
    const { width, height, top, left } = image.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;

    const zoomScale = 1.5;
    const zoomWidth = width * zoomScale;
    const zoomHeight = height * zoomScale;

    const backgroundPosX = (mouseX / width) * zoomWidth;
    const backgroundPosY = (mouseY / height) * zoomHeight;

    setZoomStyle({
      backgroundImage: `url(${product.image})`,
      backgroundSize: `${zoomWidth}px ${zoomHeight}px`,
      backgroundPosition: `-${backgroundPosX}px -${backgroundPosY}px`,
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "400px",
      height: "400px",
      border: "2px solid #fff",
      borderRadius: "8px",
      zIndex: 10,
      pointerEvents: "none",
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
  };

  const handleProductDetail = (id) => {
    router.push(`/product/${id}`);
  };

  return (
    <Grid
      container
      spacing={3}
      sx={{ width: "80%", margin: "0 auto", padding: "20px" }}
    >
      <Grid item xs={12}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">
            Home
          </Link>
          <Typography color="textPrimary">
            {product?.title?.slice(0, 50)}
          </Typography>
        </Breadcrumbs>
      </Grid>
      <Grid item xs={12} md={6} sx={{ position: "relative" }}>
        {zoomStyle.backgroundImage && <div style={zoomStyle}></div>}

        <div
          className="main-image"
          style={{ position: "relative", overflow: "hidden" }}
          onMouseMove={product ? handleMouseMove : null}
          onMouseLeave={product ? handleMouseLeave : null}
        >
          {product?.image ? (
            <img
              src={mainImage}
              alt="Main Product"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
                transition: "transform 0.5s ease",
                transformOrigin: "center center",
              }}
            />
          ) : (
            <Typography variant="body1" color="textSecondary">
              Loading product image...
            </Typography>
          )}
        </div>

        <div
          className="carousel"
          style={{
            display: "flex",
            marginTop: "10px",
            position: "relative",
            flexWrap: "wrap",
          }}
        >
          {product?.subImages?.map((image, index) => (
            <div
              key={index}
              className="carousel-image"
              style={{
                cursor: "pointer",
                opacity: currentImageIndex === index ? 1 : 0.2,
                border: "1px solid orange",
                padding: "4px 7px",
                margin: "10px",
                borderRadius: "5px",
              }}
              onClick={() => {
                setCurrentImageIndex(index), setMainImage(image);
              }}
            >
              <img
                src={image}
                alt={`Sub Image ${index + 1}`}
                style={{ width: "80px", height: "100px", objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      </Grid>
      <Grid item xs={12} md={6} sx={{ paddingLeft: theme.spacing(3) }}>
        <Box
          sx={{ padding: 2, backgroundColor: "#f9f9f9", borderRadius: "8px" }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
            {product?.title}
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{ color: "#555", lineHeight: 1.6 }}
          >
            {product?.description}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2">
                <strong>Price: </strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center" }}
              >
                {product?.discountPrice}{" "}
                {product?.price && (
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: "line-through",
                      color: "gray",
                      marginLeft: 1,
                    }}
                  >
                    {product?.price}$
                  </Typography>
                )}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2">
                <strong>Category: </strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Typography variant="body2">{product?.category}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2">
                <strong>Material: </strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Typography variant="body2">{product?.material}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2">
                <strong>Pattern: </strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Typography variant="body2">{product?.pattern}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2">
                <strong>Brand: </strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Typography variant="body2">{product?.brand}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2">
                <strong>Gender: </strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Typography variant="body2">{product?.gender}</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2">
                <strong>Rating: </strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Typography variant="body2"> 5</Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="body2">
                <strong>Stock: </strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Typography variant="body2">
                {product?.inStock} - {product?.stockCount} available
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ margin: "10px 0" }} />

        <FormControl fullWidth sx={{ marginBottom: theme.spacing(2) }}>
          <InputLabel>Size</InputLabel>
          <Select
            value={selectedSize}
            onChange={(e) => handleSizeChange(e.target.value)}
            label="Size"
          >
            {variants.length !== 0 &&
              variants[variantIndex]?.sizes?.map((size, index) => (
                <MenuItem key={index} value={size.size}>
                  {size.size}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl
          component="fieldset"
          sx={{ marginBottom: theme.spacing(2) }}
        >
          <Typography variant="body2" sx={{ marginBottom: theme.spacing(1) }}>
            <strong>Colors: </strong>
          </Typography>
          <Box sx={{ display: "flex", gap: "10px" }}>
            {variants.length !== 0 &&
              variants.map((variant, index) => (
                <Box
                  key={index}
                  onClick={() => handleColorChange(index)}
                  sx={{
                    width: "50px",
                    height: "50px",
                    border:
                      selectedColor === variant.color
                        ? "1px solid orange"
                        : "1px solid gray",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                    transform:
                      selectedColor === variant.color
                        ? "scale(1.1)"
                        : "scale(1)",
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
              ))}
          </Box>
        </FormControl>

        {product?.stockCount !== 0 && (
          <div
            className="quantity-control"
            style={{ display: "flex", alignItems: "center" }}
          >
            <Button
              onClick={() => handleQuantityChange("decrement")}
              variant="outlined"
              sx={{
                padding: "5px 10px",
                cursor: "pointer",
                minWidth: "35px",
                borderRadius: "4px",
                borderColor: "#1976d2",
                "&:hover": { borderColor: "#1565c0" },
              }}
            >
              -
            </Button>
            <Typography sx={{ margin: "0 10px" }}>{quantity}</Typography>
            <Button
              onClick={() => handleQuantityChange("increment")}
              variant="outlined"
              sx={{
                padding: "5px 10px",
                cursor: "pointer",
                minWidth: "35px",
                borderRadius: "4px",
                borderColor: "#1976d2",
                "&:hover": { borderColor: "#1565c0" },
              }}
            >
              +
            </Button>
          </div>
        )}

        {product?.stockCount === 0 ? (
          <Typography color="error" sx={{ marginTop: "10px" }}>
            Out of Stock
          </Typography>
        ) : (
          <Grid
            sx={{
              display: "flex",
              justifyContent: "space-between",
              margin: "20px 0px",
            }}
          >
            <Button
              variant="contained"
              // color="success"
              sx={{
                mt: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                backgroundColor: "#333333",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: "#1F1F1F",
                },
                "&:disabled": {
                  backgroundColor: "#9e9e9e",
                  color: "#e0e0e0",
                },
              }}
              onClick={handleAddToCart}
              disabled={!isLoggedIn}
            >
              <ShoppingCartIcon />
              {isLoggedIn ? "Add to Cart" : "Login to Add"}
            </Button>

            <Button
              variant="contained"
              color="warning"
              sx={{
                mt: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  backgroundColor: "#ed6c02",
                },
                "&:disabled": {
                  backgroundColor: "#9e9e9e",
                  color: "#e0e0e0",
                },
              }}
              onClick={() => handleButtonClick("Buy Now")}
              disabled={!isLoggedIn}
            >
              <LocalMallIcon />
              {isLoggedIn ? "Buy Now" : "Login to Buy"}
            </Button>
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        <Divider sx={{ marginY: 4 }} />
      </Grid>
      {/* Related Products Section */}
      <Grid item xs={12}>
        {relatedProducts.length !== 0 ? (
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            Related Products
          </Typography>
        ) : (
          <Typography variant="h5" sx={{ marginBottom: 2 }}>
            No Related Products
          </Typography>
        )}
        <Grid container spacing={3}>
          {relatedProducts.map((relatedProduct) =>
            relatedProduct.variants.map((variant) => (
              <Grid item xs={12} sm={6} md={4} key={variant._id}>
                <Card sx={{ height: "100%" }}>
                  <CardMedia
                    component="img"
                    image={variant.mainImage} // Ensure this is populated
                    alt={variant.name}
                    sx={{
                      padding: "10px",
                      height: 250,
                      objectFit: "contain",
                      cursor: "pointer",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                    onClick={() => handleProductDetail(relatedProduct._id)}
                  />
                </Card>
              </Grid>
            ))
          )}
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
    </Grid>
  );
};

export default DetailProduct;
