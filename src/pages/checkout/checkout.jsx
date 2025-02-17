import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Box,
  Divider,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { LocationOn, LocalShipping, Payment } from "@mui/icons-material";
import Header from "../components/header";
import Footer from "../components/footer";
import DeliveryLoader from "@/loaders/deliveryLoader";

const CheckoutPage = () => {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState("");
  const [previewDiscount, setPreviewDiscount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (router.query.data) {
      const data = JSON.parse(router.query.data);
      setCheckoutData(data);
    }
  }, [router.query.data]);

  useEffect(() => {
    const fetchCoupons = async () => {
      const token = localStorage.getItem("usertoken");
      try {
        const response = await fetch(
          `http://localhost:9090/api/coupon/get?totalPrice=${
            checkoutData?.totalPrice || 0
          }`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch coupons");
        }

        const data = await response.json();
        setCoupons(data.coupons);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    };

    if (checkoutData) {
      fetchCoupons();
    }
  }, [checkoutData]);

  // Calculate preview discount when coupon is selected
  const calculatePreviewDiscount = (couponCode, totalPrice) => {
    const selectedCouponDetails = coupons.find(
      (coupon) => coupon.couponCode === couponCode
    );

    if (!selectedCouponDetails) return 0;

    let discount = 0;
    if (selectedCouponDetails.discountType === "percentage") {
      discount = (totalPrice * selectedCouponDetails.discountValue) / 100;
    } else {
      discount = selectedCouponDetails.discountValue;
    }

    return discount;
  };

  const handleCouponChange = (event) => {
    const couponCode = event.target.value;
    setSelectedCoupon(couponCode);

    if (couponCode) {
      const discount = calculatePreviewDiscount(
        couponCode,
        checkoutData.totalPrice
      );
      setPreviewDiscount(discount);
      setSnackbarMessage(
        `Coupon selected! You'll save ₹${discount} at checkout`
      );
      setSnackbarOpen(true);
    } else {
      setPreviewDiscount(0);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const clearCart = async () => {
    const token = localStorage.getItem("usertoken");

    try {
      const response = await fetch(
        `http://localhost:9090/api/cart/clear-cart`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      const data = await response.json();
      console.log("Cart cleared successfully:", data);
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    if (!checkoutData) return;

    setShowLoader(true);
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const token = localStorage.getItem("usertoken");
    const { cartItems, selectedAddress } = checkoutData;

    if (!checkoutData.cartId) {
      console.error("cartId is missing in checkoutData");
      setLoading(false);
      return;
    }

    // Apply coupon at checkout
    let finalTotal = checkoutData.totalPrice;
    if (selectedCoupon) {
      try {
        const couponResponse = await fetch(
          `http://localhost:9090/api/coupon/apply`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              couponCode: selectedCoupon,
              totalPrice: checkoutData.totalPrice,
              userId: localStorage.getItem("userId"),
            }),
          }
        );

        if (!couponResponse.ok) {
          throw new Error("Failed to apply coupon");
        }

        const couponData = await couponResponse.json();
        finalTotal = couponData.finalTotal;
      } catch (error) {
        console.error("Error applying coupon:", error);
        setSnackbarMessage("Failed to apply coupon at checkout");
        setSnackbarOpen(true);
        setShowLoader(false);
        setLoading(false);
        return;
      }
    }

    const checkoutPayload = {
      cartId: checkoutData.cartId,
      addressId: selectedAddress._id,
      shippingMethod: "Standard",
      paymentMethod: "Cash On Delivery",
      transactionId: "txn_1234567890",
      paymentStatus: "completed",
      couponCode: selectedCoupon,
      finalTotal: finalTotal,
      items: cartItems.map((item) => ({
        ...item,
        finalPrice: item.sizeVariant.discountPrice * item.quantity,
      })),
    };

    try {
      const response = await fetch(
        "http://localhost:9090/api/checkout/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(checkoutPayload),
        }
      );
      const data = await response.json();

      if (response.ok) {
        try {
          await clearCart();
          router.push("/orders/orders");
        } catch (clearCartError) {
          setError(
            "Order placed but failed to clear cart. Please refresh the page."
          );
        }
      } else {
        setError(data.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    } finally {
      setShowLoader(false);
      setLoading(false);
    }
  };

  if (!checkoutData) {
    return <Typography>Loading...</Typography>;
  }

  const { cartItems, totalPrice, selectedAddress } = checkoutData;
  const deliveryCharge = totalPrice < 1000 ? 40 : 0;
  const previewTotal = totalPrice - previewDiscount + deliveryCharge;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Header />
      <Typography variant="h4" gutterBottom sx={{ color: "#333", mb: 4 }}>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        {/* Left Section - Address */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{ p: 2, height: "100%", bgcolor: "#fafafa" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: "#333" }} />
              <Typography variant="h6">Delivery Address</Typography>
            </Box>
            <Card variant="outlined" sx={{ bgcolor: "white" }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {selectedAddress.fullName}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Type: {selectedAddress.addressType}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  {selectedAddress.address}
                </Typography>
                <Typography variant="body2">
                  {selectedAddress.city}, {selectedAddress.state}
                </Typography>
                <Typography variant="body2">
                  PIN: {selectedAddress.pincode}
                </Typography>
                <Typography variant="body2">
                  Phone: {selectedAddress.mobileNumber}
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* Middle Section - Order Summary */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={3}
            sx={{ p: 2, height: "100%", bgcolor: "#fafafa" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <LocalShipping sx={{ mr: 1, color: "#333" }} />
              <Typography variant="h6">Order Summary</Typography>
            </Box>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <img
                        src={item.variant.mainImage}
                        alt={item.product.name}
                        style={{ width: 50, height: 100, objectFit: "cover" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Size: {item.sizeVariant.size}, Color:{" "}
                        {item.variant.color}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Qty: {item.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      ₹{item.sizeVariant.discountPrice * item.quantity}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle1">Subtotal</Typography>
                  </TableCell>
                  <TableCell align="right">₹{totalPrice}</TableCell>
                </TableRow>
                {previewDiscount > 0 && (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="subtitle1" color="success.main">
                        Coupon Discount (will be applied at checkout)
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ color: "success.main" }}>
                      -₹{previewDiscount}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle1">Delivery</Typography>
                  </TableCell>
                  <TableCell align="right">
                    {deliveryCharge === 0
                      ? "Free delivery"
                      : `₹${deliveryCharge}`}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      ₹{previewTotal}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Right Section - Payment */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={3}
            sx={{ p: 2, height: "100%", bgcolor: "#fafafa" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Payment sx={{ mr: 1, color: "#333" }} />
              <Typography variant="h6">Payment Method</Typography>
            </Box>
            <RadioGroup defaultValue="cod">
              <FormControlLabel
                value="cod"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1">
                      Cash on Delivery
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pay when you receive
                    </Typography>
                  </Box>
                }
                sx={{ mb: 2 }}
              />
            </RadioGroup>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="coupon-select-label">Select Coupon</InputLabel>
              <Select
                labelId="coupon-select-label"
                id="coupon-select"
                value={selectedCoupon}
                label="Select Coupon"
                onChange={handleCouponChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {coupons.map((coupon) => (
                  <MenuItem key={coupon._id} value={coupon.couponCode}>
                    {coupon.couponCode} - {coupon.discountValue}
                    {coupon.discountType === "percentage" ? "%" : "₹"} off
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                bgcolor: "#333",
                "&:hover": {
                  bgcolor: "#555",
                },
                py: 1.5,
              }}
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </Button>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 2, textAlign: "center" }}
            >
              By placing your order, you agree to our terms and conditions
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <DeliveryLoader open={showLoader} />
      <Footer />
    </Container>
  );
};

export default CheckoutPage;
