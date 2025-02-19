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
import { LocationOn, LocalShipping, Payment, CreditCard, MonetizationOn } from "@mui/icons-material";
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
  const [paymentMethod, setPaymentMethod] = useState("cod");

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

  const handleCouponChange = async (event) => {
    const couponCode = event.target.value;
    setSelectedCoupon(couponCode);

    if (couponCode) {
      try {
        const token = localStorage.getItem("usertoken");
        const response = await fetch("http://localhost:9090/api/coupon/apply", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            couponCode,
            totalPrice: checkoutData.totalPrice,
            userId: localStorage.getItem("userId")
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to apply coupon");
        }

        const data = await response.json();
        setPreviewDiscount(data.discountAmount);
        setSnackbarMessage(`Coupon applied! You'll save ₹${data.discountAmount} at checkout`);
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error applying coupon:", error);
        setSnackbarMessage("Failed to apply coupon");
        setSnackbarOpen(true);
        setSelectedCoupon("");
        setPreviewDiscount(0);
      }
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

  const handleOnlinePayment = async () => {
    try {
      setLoading(true);
      
      // Load Razorpay SDK
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      // Create order
      const token = localStorage.getItem("usertoken");
      const response = await fetch(
        "http://localhost:9090/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: Math.round(previewTotal * 100), // amount in paise
            currency: "INR",
          }),
        }
      );

      const orderData = await response.json();

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(previewTotal * 100),
        currency: "INR",
        name: "TREND TROVE",
        description: "Purchase Payment",
        order_id: orderData.id,
        prefill: {
          name: selectedAddress?.fullName || "",
          contact: selectedAddress?.mobileNumber || "",
        },
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch(
              "http://localhost:9090/api/payment/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (verifyData.status === "success") {
              // Create order with payment details
              const checkoutPayload = {
                cartId: checkoutData.cartId,
                addressId: selectedAddress._id,
                shippingMethod: "Standard",
                paymentMethod: "online",
                transactionId: response.razorpay_payment_id,
                paymentStatus: "completed",
                couponCode: selectedCoupon,
                finalTotal: previewTotal,
                items: cartItems.map((item) => ({
                  ...item,
                  finalPrice: item.sizeVariant.discountPrice * item.quantity,
                })),
              };

              await handlePlaceOrder(checkoutPayload);
              
              // Clear cart and redirect
              await clearCart();
              router.push("/orders/orders");
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            setSnackbarMessage("Payment verification failed");
            setSnackbarOpen(true);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: {
          color: "#333",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error("Payment initiation failed:", error);
      setSnackbarMessage(error.message);
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleCashOnDelivery = async () => {
    try {
      setLoading(true);
      const checkoutPayload = {
        cartId: checkoutData.cartId,
        addressId: selectedAddress._id,
        shippingMethod: "Standard",
        paymentMethod: "cod",
        transactionId: "COD_" + Date.now(),
        paymentStatus: "pending",
        couponCode: selectedCoupon,
        finalTotal: previewTotal,
        items: cartItems.map((item) => ({
          ...item,
          finalPrice: item.sizeVariant.discountPrice * item.quantity,
        })),
      };

      const token = localStorage.getItem("usertoken");
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

      if (!response.ok) {
        throw new Error("Checkout failed");
      }

      await clearCart();
      
      setSnackbarMessage("Order placed successfully!");
      setSnackbarOpen(true);
      router.push("/orders/orders");
    } catch (error) {
      console.error("Error during checkout:", error);
      setSnackbarMessage("Failed to place order: " + error.message);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = () => {
    if (paymentMethod === "online") {
      handleOnlinePayment();
    } else {
      handleCashOnDelivery();
    }
  };

  const handlePlaceOrder = async (checkoutPayload) => {
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

            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="cod"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <MonetizationOn sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle1">Cash on Delivery</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Pay when you receive
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                value="online"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CreditCard sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle1">Pay Online</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Credit/Debit Card, UPI, Net Banking
                      </Typography>
                    </Box>
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
              onClick={handlePaymentClick}
              disabled={loading}
            >
              {loading ? "Processing..." : `Pay ₹${previewTotal}`}
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
          severity="info"
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
