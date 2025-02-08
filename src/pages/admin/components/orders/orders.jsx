import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Typography,
  TablePagination,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import { HistoryIcon } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:9090/api/admin/checkout/get-all-order-product"
        );
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:9090/api/admin/checkout/update-order-status/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newStatus }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setOrders(
          orders.map((order) =>
            order.orderId === orderId
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );
        setSnackbar({
          open: true,
          message: "Order status updated successfully",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error updating order status",
        severity: "error",
      });
    }
    setIsEditModalOpen(false);
  };

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setIsEditModalOpen(true);
  };

  const handleHistoryClick = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:9090/api/admin/checkout/order-history/${orderId}`
      );
      const data = await response.json();
      if (data.success) {
        setSelectedOrder(data.order);
        setIsHistoryModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#212121" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#333",
          borderRadius: 2,
          padding: 2,
          marginBottom: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "#FF9800" }}>
          Orders Management
        </Typography>
      </Box>

      {/* Orders Table */}
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "#333", borderRadius: 3 }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: "#212121", color: "#FF9800" }}>
                Order ID
              </TableCell>
              <TableCell sx={{ backgroundColor: "#212121", color: "#FF9800" }}>
                Customer
              </TableCell>
              <TableCell sx={{ backgroundColor: "#212121", color: "#FF9800" }}>
                Items
              </TableCell>
              <TableCell sx={{ backgroundColor: "#212121", color: "#FF9800" }}>
                Total Amount
              </TableCell>
              <TableCell sx={{ backgroundColor: "#212121", color: "#FF9800" }}>
                Created At
              </TableCell>
              <TableCell sx={{ backgroundColor: "#212121", color: "#FF9800" }}>
                Status
              </TableCell>
              <TableCell sx={{ backgroundColor: "#212121", color: "#FF9800" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell sx={{ color: "#ffffff" }}>
                    {order.orderId}
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>
                    {order.customer.name}
                    <br />
                    {order.customer.email}
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>
                    {order.items.map((item, idx) => (
                      <Box key={idx} sx={{ mb: 1 }}>
                        {item.productName.slice(0, 15)} - {item.color} (
                        {item.size}) x{item.quantity}
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>
                    ₹{order.totalAmount}
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>
                    ₹{order.createdAt}
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff" }}>
                    {order.orderStatus}
                  </TableCell>
                  <TableCell>
                  <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditClick(order)}
                      sx={{
                        backgroundColor: '#FF9800',
                        color: 'white',
                        mr: 1,
                        '&:hover': { backgroundColor: '#FFB74D' },
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<HistoryIcon />}
                      onClick={() => handleHistoryClick(order.orderId)}
                      sx={{
                        margin:"5px 0px",
                        backgroundColor: "black",
                        color: "white",
                        "&:hover": { backgroundColor: "#66BB6A" },
                      }}
                    >
                      History
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={orders.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          sx={{ color: "#FF9800" }}
        />
      </TableContainer>

      {/* Edit Status Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          <Button
            onClick={() =>
              handleStatusChange(selectedOrder?.orderId, newStatus)
            }
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order History Modal */}
      <Dialog
        open={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "#121212", // Dark background
            color: "#ffffff", // White text
            borderRadius: "12px",
            padding: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.5rem",
            borderBottom: "1px solid #333",
            pb: 2,
          }}
        >
          Order History
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Paper
              elevation={3}
              sx={{
                backgroundColor: "#1e1e1e",
                color: "#ffffff",
                p: 3,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Order ID: {selectedOrder._id}
              </Typography>
              <Typography variant="body1">
                <b>Status:</b> {selectedOrder.orderStatus}
              </Typography>
              <Typography variant="body1">
                <b>Total Amount:</b> ₹{selectedOrder.totalAmount}
              </Typography>
              <Typography variant="body1">
                <b>Created At:</b>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </Typography>

              {/* Items Section */}
              <Typography
                variant="h6"
                sx={{
                  mt: 3,
                  fontWeight: "bold",
                  borderBottom: "1px solid #444",
                  pb: 1,
                }}
              >
                Items
              </Typography>
              {selectedOrder.items.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: "#2a2a2a",
                  }}
                >
                  <Typography variant="body1">
                    <b>Product:</b> {item.product?.name}
                  </Typography>
                  <Typography variant="body1">
                    <b>Color:</b> {item.variant?.color}
                  </Typography>
                  <Typography variant="body1">
                    <b>Size:</b> {item.sizeVariant?.size}
                  </Typography>
                  <Typography variant="body1">
                    <b>Quantity:</b> {item.quantity}
                  </Typography>
                  <Typography variant="body1">
                    <b>Price:</b> ₹{item.price}
                  </Typography>
                </Box>
              ))}

              {/* Shipping Address Section */}
              {/* <Typography
                variant="h6"
                sx={{
                  mt: 3,
                  fontWeight: "bold",
                  borderBottom: "1px solid #444",
                  pb: 1,
                }}
              >
                Shipping Address
              </Typography>
              <Typography variant="body1">
                {selectedOrder.shipping.address.fullName}
              </Typography>
              <Typography variant="body1">
                {selectedOrder.shipping.address.address}
              </Typography>
              <Typography variant="body1">
                {selectedOrder.shipping.address.city},{" "}
                {selectedOrder.shipping.address.state}{" "}
                {selectedOrder.shipping.address.pincode}
              </Typography>
              <Typography variant="body1">
                <b>Phone:</b> {selectedOrder.shipping.address.mobileNumber}
              </Typography> */}
            </Paper>
          )}
        </DialogContent>

        <DialogActions
          sx={{ justifyContent: "center", borderTop: "1px solid #333", pt: 2 }}
        >
          <Button
            onClick={() => setIsHistoryModalOpen(false)}
            variant="contained"
            sx={{
              backgroundColor: "#ffffff",
              color: "#121212",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Orders;
