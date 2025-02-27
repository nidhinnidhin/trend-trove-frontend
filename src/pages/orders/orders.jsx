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
  Rating,
  Snackbar,
  Alert,
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
import { RateReview } from "@mui/icons-material";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import AddReviewModal from "@/components/modals/addReview";
import axiosInstance from "@/utils/axiosInstance";

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
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get("/checkout/get-orders");
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOpenReviewModal = (orderId, itemId) => {
    setSelectedOrder(orderId);
    setSelectedItem(itemId);
    setOpenReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setOpenReviewModal(false);
  };

  const handleOpenModal = (orderId, itemId, type) => {
    console.log("OrderId:", orderId, "ItemId: ", itemId);

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

    try {
      const response = await axiosInstance.patch(
        `/checkout/return-product/${selectedOrder}/${selectedItem}`,
        {
          reason: returnReason,
          details: additionalDetails,
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
        setError("");
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
      const response = await axiosInstance.patch(
        `/checkout/cancel-order/${selectedOrder}/${selectedItem}`,
        { reason: cancelReason }
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
        setError("");
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

  const handleRetryPayment = async (order) => {
    try {
      // Load Razorpay script
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

      // Create new order for retry payment
      const response = await axiosInstance.post(`/payment/create-order`, {
        amount: Math.round(order.payment.amount * 100),
        currency: "INR",
        checkoutId: order.orderId
      });

      const orderData = response.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(order.payment.amount * 100),
        currency: "INR",
        name: "TREND TROVE",
        description: "Purchase Payment Retry",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyResponse = await axiosInstance.post(`/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              checkoutId: order.orderId
            });

            if (verifyResponse.data.status === "success") {
              window.location.reload();
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            setSnackbar({
              open: true,
              message: "Payment verification failed",
              severity: "error",
            });
          }
        },
        modal: {
          ondismiss: async function () {
            try {
              await axiosInstance.post(`/payment/cancel`, {
                orderId: orderData.id,
                checkoutId: order.orderId
              });
            } catch (error) {
              console.error("Failed to handle payment cancellation:", error);
            }
          },
        },
        prefill: {
          name: order.shippingAddress?.fullName || "",
          contact: order.shippingAddress?.mobileNumber || "",
        },
        theme: {
          color: "#333",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment retry failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to retry payment",
        severity: "error",
      });
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
                    <TableRow key={`${order.orderId}-${item.itemId}-${index}`}>
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
                        {order.shippingAddress ? (
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
                        ) : (
                          <Typography variant="body2" color="error">
                            Address not available
                          </Typography>
                        )}
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
                            {order.payment?.method || "N/A"}
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
                                  (order.payment?.amount || 0)
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
                              Final Price: ₹{order.payment?.amount || 0}
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
                        {(item.status === "pending" ||
                          item.status === "Processing") && (
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() =>
                              handleOpenModal(
                                order.orderId,
                                item.itemId,
                                "cancel"
                              )
                            }
                            sx={{ width: "150px", mb: 1 }}
                          >
                            Cancel
                          </Button>
                        )}

                        {/* Show Return button for delivered orders */}
                        {item.status === "Delivered" && (
                          <>
                            {item.returnRequested ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  label={`Return ${item.returnStatus}`}
                                  color={
                                    item.returnStatus === "Return Approved"
                                      ? "success"
                                      : item.returnStatus === "Return Rejected"
                                      ? "error"
                                      : "warning"
                                  }
                                  sx={{ minWidth: "150px" }}
                                />
                                {item.returnStatus === "Return Rejected" && (
                                  <Typography variant="caption" color="error">
                                    Your return request was rejected
                                  </Typography>
                                )}
                              </Box>
                            ) : (
                              <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Replay />}
                                onClick={() =>
                                  handleOpenModal(
                                    order.orderId,
                                    item.itemId,
                                    "return"
                                  )
                                }
                                sx={{ width: "150px" }}
                              >
                                Return
                              </Button>
                            )}
                          </>
                        )}

                        {(item.status === "Delivered" ||
                          item.status === "Returned") && (
                          <Button
                            variant="outlined"
                            color="success"
                            onClick={() =>
                              handleOpenReviewModal(order.orderId, item.itemId)
                            }
                            sx={{
                              width: "150px",
                              margin: "10px 0px",
                              backgroundColor: "rgba(0, 0, 0, 0.05)",
                              "&:hover": {
                                backgroundColor: "rgba(0, 0, 0, 0.1)",
                              },
                            }}
                          >
                            Add Review
                          </Button>
                        )}

                        {(item.paymentStatus === "retry_pending" || order.payment?.status === "retry_pending") && 
                         order.payment?.method === "online" && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleRetryPayment(order)}
                            startIcon={<Payment />}
                            sx={{ 
                              width: "150px", 
                              mt: 1,
                              backgroundColor: "#1976d2",
                              "&:hover": {
                                backgroundColor: "#115293"
                              }
                            }}
                          >
                            Retry Payment
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
          </TableBody>
        </Table>
      </Paper>

      <AddReviewModal
        openReviewModal={openReviewModal}
        handleCloseReviewModal={handleCloseReviewModal}
        selectedOrder={selectedOrder}
        selectedItem={selectedItem}
        orders={orders}
        setOrders={setOrders}
      />

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
            onClick={
              modalType === "return" ? handleReturnProduct : handleCancelOrder
            }
            variant="contained"
            color="primary"
          >
            {modalType === "return" ? "Submit Return" : "Confirm Cancel"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </Container>
  );
};

export default OrdersPage;
