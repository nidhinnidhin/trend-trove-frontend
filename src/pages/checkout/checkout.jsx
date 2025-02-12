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
} from "@mui/material";
import { LocationOn, LocalShipping, Payment } from "@mui/icons-material";
import Header from "../components/header";
import Footer from "../components/footer";

const CheckoutPage = () => {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('')

  useEffect(() => {
    if (router.query.data) {
      // Parse the data passed from the Cart page
      const data = JSON.parse(router.query.data);
      console.log(router.query.data);

      setCheckoutData(data);
    }
  }, [router.query.data]);

  const clearCart = async () => {
    const token = localStorage.getItem("usertoken");
    
    try {
      const response = await fetch(`http://localhost:9090/api/cart/clear-cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      const data = await response.json();
      console.log('Cart cleared successfully:', data);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error; 
    }
  };

  const handlePlaceOrder = async () => {
    if (!checkoutData) return;

    setLoading(true);
    const token = localStorage.getItem("usertoken");

    const { cartItems, totalPrice, discountAmount, selectedAddress } =
      checkoutData;

    if (!checkoutData.cartId) {
      console.error("cartId is missing in checkoutData");
      setLoading(false);
      return;
    }

    const checkoutPayload = {
      cartId: checkoutData.cartId, 
      addressId: selectedAddress._id,
      shippingMethod: "Standard",
      paymentMethod: "Cash On Delivery",
      transactionId: "txn_1234567890",
      paymentStatus: "completed",
    };

    console.log("Checkout Payload:", checkoutPayload); 

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
          router.push("/orders/orders");
        } catch (clearCartError) {
          setError("Order placed but failed to clear cart. Please refresh the page.");
        }
      } else {
        setError(data.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    } finally {
      setLoading(false);
    }
  };
  if (!checkoutData) {
    return <Typography>Loading...</Typography>;
  }

  const { cartItems, totalPrice, discountAmount, selectedAddress, deliverCharge, finalTotal } =
    checkoutData;

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
                        style={{ width: 50, height: 50, objectFit: "cover" }}
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
                      ₹{item.price * item.quantity}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle1">Subtotal</Typography>
                  </TableCell>
                  <TableCell align="right">₹{totalPrice}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle1">Discount</Typography>
                  </TableCell>
                  <TableCell align="right">-₹{discountAmount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle1">Delivery</Typography>
                  </TableCell>
                  <TableCell align="right">{deliverCharge}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Total
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      ₹{finalTotal}
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
      <Footer />
    </Container>
  );
};

export default CheckoutPage;
