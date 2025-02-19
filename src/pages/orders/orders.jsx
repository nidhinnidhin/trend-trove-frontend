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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Divider,
} from "@mui/material";
import {
  LocalShipping,
  Cancel,
  AccessTime,
  LocationOn,
  Payment,
  ShoppingBag,
  Replay,
} from "@mui/icons-material";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [error, setError] = useState("");

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

  const handleOpenModal = (orderId, itemId, type) => {
    setSelectedOrder(orderId);
    setSelectedItem(itemId);
    setModalType(type);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setReturnReason("");
    setAdditionalDetails("");
    setError("");
  };

  const handleReturnProduct = async () => {
    if (!returnReason || !additionalDetails.trim()) {
      setError("Please select a return reason and provide additional details.");
      return;
    }

    const token = localStorage.getItem("usertoken");
    try {
      const response = await axios.patch(
        `http://localhost:9090/api/checkout/return-product/${selectedOrder}/${selectedItem}`,
        {
          reason: returnReason,
          details: additionalDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
                    ? {
                        ...item,
                        returnRequested: true,
                        returnStatus: "Return Pending",
                        returnReason: returnReason,
                      }
                    : item
                ),
              };
            }
            return order;
          })
        );
        handleCloseModal();
        // Show success message
        setError("");
        // You might want to add a success notification here
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to process return request. Please try again."
      );
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      setError("Please provide a reason for cancellation");
      return;
    }

    try {
      const token = localStorage.getItem("usertoken");
      const response = await axios.patch(
        `http://localhost:9090/api/checkout/cancel-order/${selectedOrder}/${selectedItem}`,
        { reason: cancelReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
                    ? {
                        ...item,
                        status: "Cancelled",
                        cancelReason: cancelReason,
                      }
                    : item
                ),
              };
            }
            return order;
          })
        );
        handleCloseModal();
        // Show success message
        setError("");
        // You might want to add a success notification here
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to process cancel order request. Please try again."
      );
    }
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
                  return (
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
                            {new Date(order.orderDate).toLocaleString()}
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
                                {(
                                  item.price * item.quantity -
                                  order.payment.amount
                                ).toFixed(1)}
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
                              sx={{ fontWeight: "bold", color: "green" }}
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
                          color={getStatusColor(
                            item.status || order.orderStatus
                          )}
                        />
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell>
                        {/* Show Cancel button for pending/processing orders */}
                        {(item.status === "pending" || item.status === "Processing") && (
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleOpenModal(order.orderId, item.itemId, "cancel")}
                            sx={{ width: "150px", mb: 1 }}
                          >
                            Cancel Order
                          </Button>
                        )}

                        {/* Show Return button for delivered orders */}
                        {item.status === "Delivered" && (
                          <>
                            {item.returnRequested ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Chip
                                  label={`Return ${item.returnStatus}`}
                                  color={
                                    item.returnStatus === "Return Approved"
                                      ? "success"
                                      : item.returnStatus === "Return Rejected"
                                      ? "error"
                                      : "warning"
                                  }
                                  sx={{ minWidth: '150px' }}
                                />
                                {item.returnStatus === "Return Rejected" && (
                                  <Typography variant="caption" color="error">
                                    Your return request was rejected
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<Replay />}
                                onClick={() => handleOpenModal(order.orderId, item.itemId, "return")}
                                sx={{ width: "150px" }}
                              >
                                Return
                              </Button>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
          </TableBody>
        </Table>
      </Paper>

      {/* Return Product Modal */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>
          {modalType === "return" ? "Return Product" : "Cancel Order"}
        </DialogTitle>
        <DialogContent>
          {modalType === "return" ? (
            <>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Return Reason</InputLabel>
                <Select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  label="Return Reason"
                >
                  <MenuItem value="Defective">Defective</MenuItem>
                  <MenuItem value="Not as described">Not as described</MenuItem>
                  <MenuItem value="Wrong size/fit">Wrong size/fit</MenuItem>
                  <MenuItem value="Changed my mind">Changed my mind</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Details"
                variant="outlined"
                margin="normal"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
              />
            </>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Cancellation Reason"
              variant="outlined"
              margin="normal"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          )}
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
          <Button
            onClick={modalType === "return" ? handleReturnProduct : handleCancelOrder}
            variant="contained"
            color="primary"
          >
            {modalType === "return" ? "Submit Return" : "Confirm Cancel"}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Container>
  );
};

export default OrdersPage;
