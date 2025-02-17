import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Paper,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  LocalShipping,
  Cancel,
  AccessTime,
  LocationOn,
  Payment,
  ShoppingBag,
} from "@mui/icons-material";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("usertoken");
      try {
        const response = await axios.get(
          "http://localhost:9090/api/checkout/get-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  console.log("Ordersssssssss", orders);

  const handleOpenModal = (orderId, itemId) => {
    setSelectedOrder(orderId);
    setSelectedItem(itemId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCancelReason("");
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Please enter a cancellation reason.");
      return;
    }

    const token = localStorage.getItem("usertoken");
    try {
      const response = await axios.patch(
        `http://localhost:9090/api/checkout/cancel-order/${selectedOrder}/${selectedItem}`,
        { reason: cancelReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order.orderId === selectedOrder) {
              return {
                ...order,
                items: order.items.map((item) =>
                  item.itemId === selectedItem
                    ? { ...item, status: "Cancelled" }
                    : item
                ),
                orderStatus: response.data.order.orderStatus,
              };
            }
            return order;
          })
        );
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Cancelled":
        return "error";
      default:
        return "primary";
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Header />
      <Typography variant="h4" gutterBottom sx={{ color: "#333", mb: 4 }}>
        My Orders
      </Typography>

      <Paper
        elevation={3}
        sx={{ p: 2, bgcolor: "#fafafa", margin: "30px 0px" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <ShoppingBag sx={{ mr: 1, color: "#333" }} />
          <Typography variant="h6">Order History</Typography>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Details</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Delivery Address</TableCell>
              <TableCell>Payment Info</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length !== 0 &&
              orders.map((order) =>
                order.items.map((item, index) => {
                  console.log(order.payment);
                  
                  return(
                    
                  <TableRow key={`${order.orderId}-${index}`}>
                    {/* Order Details Column */}
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Typography variant="subtitle2">
                          <strong>Order ID:</strong> {order.orderId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <AccessTime
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              verticalAlign: "text-bottom",
                            }}
                          />
                          {formatDate(order.orderDate)}
                        </Typography>
                        <Typography variant="body2">
                          <LocalShipping
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              verticalAlign: "text-bottom",
                            }}
                          />
                          {order.shippingMethod}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Product Details Column */}
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={item.image}
                          alt={item.productName}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            marginRight: 10,
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle2">
                            {item.productName.slice(0, 10)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Color: {item.color}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Size: {item.size}
                          </Typography>
                          <Typography variant="body2">
                            Quantity: {item.quantity} × ₹{item.price}
                          </Typography>
                          <Typography variant="body2">
                            Sub Total: ₹{item.quantity * item.price}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Delivery Address Column */}
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Typography variant="subtitle2">
                          {order.shippingAddress.fullName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {order.shippingAddress.address},
                          {order.shippingAddress.city},
                          {order.shippingAddress.state} -{" "}
                          {order.shippingAddress.pincode}
                        </Typography>
                        <Typography variant="body2">
                          Mobile: {order.shippingAddress.mobileNumber}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Payment Info Column */}
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Typography variant="subtitle2">
                          <Payment
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              verticalAlign: "text-bottom",
                            }}
                          />
                          {order.payment.method}
                        </Typography>

                        {/* Price Breakdown */}
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            Subtotal: ₹{item.price * item.quantity}
                          </Typography>

                          {order.couponCode && (
                            <Typography variant="body2" color="error">
                              Coupon ({order.couponCode}): -₹
                              {(item.price * item.quantity - order.payment.amount).toFixed(1)}
                            </Typography>
                          )}

                          {order.deliveryCharge > 0 && (
                            <Typography variant="body2" color="textSecondary">
                              Delivery: ₹{order.deliveryCharge}
                            </Typography>
                          )}

                          <Divider sx={{ my: 1 }} />

                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold", color:"green" }}
                          >
                            Final Price: ₹{order.payment.amount}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Order Status Column */}
                    <TableCell>
                      <Chip
                        label={item.status || order.orderStatus}
                        color={getStatusColor(item.status || order.orderStatus)}
                      />
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell>
                      {(item.status === "pending" ||
                        item.status === "Processing") && (
                        <Button
                          variant="outlined"
                          color="error"
                          sx={{ width: "150px" }}
                          // startIcon={<Cancel />}
                          onClick={() =>
                            handleOpenModal(order.orderId, item.itemId)
                          }
                        >
                          Cancel order
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )})
              )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Please enter the reason for cancellation:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            margin="normal"
            placeholder="Enter your reason..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained">
            Confirm Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Footer />
    </Container>
  );
};

export default OrdersPage;
