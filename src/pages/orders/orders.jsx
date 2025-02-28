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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  TableContainer,
} from "@mui/material";
import {
  LocalShipping,
  Cancel,
  AccessTime,
  LocationOn,
  Payment,
  ShoppingBag,
  Replay,
  ExpandMore,
} from "@mui/icons-material";
import { RateReview } from "@mui/icons-material";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import AddReviewModal from "@/components/modals/addReview";
import axiosInstance from "@/utils/axiosInstance";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  logo: {
    width: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderColor: '#e0e0e0',
    padding: 8,
  },
  col1: { width: '40%' },
  col2: { width: '20%' },
  col3: { width: '20%' },
  col4: { width: '20%' },
  total: {
    marginTop: 20,
    borderTop: 1,
    paddingTop: 10,
  },
});

// Create Invoice PDF Document component
const InvoicePDF = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          src="/logo.png" 
          style={styles.logo}
        />
        <Text style={styles.title}>Invoice</Text>
        <Text>Order ID: {order.orderId}</Text>
        <Text>Date: {format(new Date(order.orderDate), 'dd/MM/yyyy')}</Text>
      </View>

      {/* Customer Details */}
      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          Customer Details
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{order.shippingAddress.fullName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>
            {`${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{order.shippingAddress.mobileNumber}</Text>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          Order Items
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Product</Text>
            <Text style={styles.col2}>Price</Text>
            <Text style={styles.col3}>Quantity</Text>
            <Text style={styles.col4}>Total</Text>
          </View>
          {order.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>
                {`${item.productName} (${item.size}, ${item.color})`}
              </Text>
              <Text style={styles.col2}>₹{item.price}</Text>
              <Text style={styles.col3}>{item.quantity}</Text>
              <Text style={styles.col4}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.total}>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal:</Text>
          <Text style={styles.value}>₹{order.subTotal}</Text>
        </View>
        {order.deliveryCharge > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Delivery:</Text>
            <Text style={styles.value}>₹{order.deliveryCharge}</Text>
          </View>
        )}
        {order.couponDiscount > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Discount:</Text>
            <Text style={styles.value}>-₹{order.couponDiscount}</Text>
          </View>
        )}
        <View style={[styles.row, { marginTop: 10, fontWeight: 'bold' }]}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={styles.value}>₹{order.payment.amount}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

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
              const updatedOrder = {
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
              return updatedOrder;
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
              const updatedOrder = {
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
              return updatedOrder;
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

  const handleDownloadInvoice = (order) => {
    return (
      <PDFDownloadLink
        document={<InvoicePDF order={order} />}
        fileName={`invoice-${order.orderId}.pdf`}
      >
        {({ blob, url, loading, error }) => (
          <IconButton 
            onClick={(e) => e.stopPropagation()}
            disabled={loading}
            sx={{ color: '#333' }}
          >
            <FileDownloadIcon />
          </IconButton>
        )}
      </PDFDownloadLink>
    );
  };

  // Calculate total amount for an order
  const calculateOrderTotal = (order) => {
    return order.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Header />
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        My Orders
      </Typography>

      {orders.map((order) => {
        const orderTotal = calculateOrderTotal(order);
        
        return (
          <Accordion 
            key={order.orderId}
            defaultExpanded={true}
            sx={{
              mb: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: '#f5f5f5',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: '#eeeeee',
                },
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%',
                pr: 2 
              }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Order ID: {order.orderId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal: ₹{orderTotal}
                    </Typography>
                    {order.deliveryCharge > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Delivery Charge: ₹{order.deliveryCharge}
                      </Typography>
                    )}
                    {order.couponDiscount > 0 && (
                      <Typography variant="body2" sx={{ color: 'success.main' }}>
                        Coupon Discount: -₹{order.couponDiscount}
                      </Typography>
                    )}
                    <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 600, mt: 0.5 }}>
                      Final Amount: ₹{order.payment?.amount || orderTotal}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {(order.payment?.status === "retry_pending" && 
                    order.payment?.method === "online") && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetryPayment(order);
                      }}
                      startIcon={<Payment />}
                      sx={{
                        backgroundColor: "#1976d2",
                        "&:hover": {
                          backgroundColor: "#115293"
                        }
                      }}
                    >
                      Retry Payment
                    </Button>
                  )}
                  
                  {handleDownloadInvoice(order)}
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#fafafa' }}>
                      <TableCell>Product</TableCell>
                      <TableCell>Delivery Address</TableCell>
                      <TableCell>Payment Info</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item, index) => (
                      <TableRow key={`${order.orderId}-${item.itemId}-${index}`}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <img
                              src={item.image}
                              alt={item.productName}
                              style={{
                                width: 80,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: "4px",
                                marginRight: 10,
                              }}
                            />
                            <Box>
                              <Typography variant="subtitle2">
                                {item.productName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Size: {item.size}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Color: {item.color}
                              </Typography>
                              <Typography variant="body2">
                                Price: ₹{item.price} × {item.quantity}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Item Total: ₹{item.price * item.quantity}
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

                              {/* <Divider sx={{ my: 1 }} /> */}

                              {/* <Typography
                                variant="body2"
                                sx={{ fontWeight: "bold", color: "green" }}
                              >
                                Final Price: ₹{order.payment?.amount || 0}
                              </Typography> */}
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        );
      })}

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
