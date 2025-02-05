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
  Tooltip,
} from "@mui/material";
import { 
  LocalShipping, 
  Cancel, 
  AccessTime, 
  LocationOn, 
  Payment,
  ShoppingBag 
} from "@mui/icons-material";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleCancelOrder = async (orderId) => {
    const token = localStorage.getItem("usertoken");
    try {
      await axios.put(
        `http://localhost:9090/api/orders/cancel-order/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId
            ? { ...order, orderStatus: "Cancelled" }
            : order
        )
      );
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      <Paper elevation={3} sx={{ p: 2, bgcolor: "#fafafa", margin: "80px 0px" }}>
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
            {orders.map((order) =>
              order.items.map((item, index) => (
                <TableRow key={`${order.orderId}-${index}`}>
                  {/* Order Details Column */}
                  <TableCell>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography variant="subtitle2">
                        <strong>Order ID:</strong> {order.orderId}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <AccessTime sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }}/>
                        {formatDate(order.orderDate)}
                      </Typography>
                      <Typography variant="body2">
                        <LocalShipping sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }}/>
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
                          {item.productName}
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
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Delivery Address Column */}
                  <TableCell>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="subtitle2">
                        {order.shippingAddress.fullName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {order.shippingAddress.address},
                        {order.shippingAddress.city},
                        {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </Typography>
                      <Typography variant="body2">
                        Mobile: {order.shippingAddress.mobileNumber}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Payment Info Column */}
                  <TableCell>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography variant="subtitle2">
                        <Payment sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }}/>
                        {order.payment.method}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        ₹{item.price * item.quantity}
                      </Typography>
                      <Chip 
                        size="small"
                        label={order.payment.status}
                        color={order.payment.status === "success" ? "success" : "error"}
                      />
                    </Box>
                  </TableCell>

                  {/* Order Status Column */}
                  <TableCell>
                    <Chip
                      label={order.orderStatus}
                      color={
                        order.orderStatus === "Delivered"
                          ? "success"
                          : order.orderStatus === "Cancelled"
                          ? "error"
                          : "primary"
                      }
                    />
                  </TableCell>

                  {/* Actions Column */}
                  <TableCell>
                    {order.orderStatus === "pending" ||
                    order.orderStatus === "Processing" ? (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleCancelOrder(order.orderId)}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No actions available
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
      <Footer />
    </Container>
  );
};

export default OrdersPage;