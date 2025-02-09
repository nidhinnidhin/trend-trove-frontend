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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HistoryIcon from "@mui/icons-material/History";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
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

  const handleStatusChange = async (orderId, itemId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:9090/api/admin/checkout/update-order-status/${orderId}/${itemId}`,
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
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.itemId === itemId
                      ? { ...item, status: newStatus }
                      : item
                  ),
                  orderStatus: data.order.orderStatus,
                }
              : order
          )
        );
        setSnackbar({
          open: true,
          message: "Item status updated successfully",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error updating item status",
        severity: "error",
      });
    }
    setIsEditModalOpen(false);
  };

  const handleOrderDetailClick = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailModalOpen(true);
  };

  const handleEditClick = (order, item) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setNewStatus(item.status);
    setIsEditModalOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#3f51b5",
          borderRadius: 2,
          padding: 2,
          marginBottom: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
          Orders Management
        </Typography>
      </Box>

      {orders
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((order) => (
          <Accordion key={order.orderId} sx={{ mb: 2, boxShadow: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#3f51b5" }}
                  >
                    Order ID: {order.orderId}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#757575" }}>
                    Customer: {order.customer.name} {order.customer.email}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#757575" }}>
                    Total Amount: ₹{order.totalAmount}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOrderDetailClick(order);
                  }}
                  sx={{
                    backgroundColor: "#4caf50",
                    color: "white",
                    "&:hover": { backgroundColor: "#66bb6a" },
                  }}
                >
                  Order Details
                </Button>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#3f51b5" }}>
                      <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                        Product
                      </TableCell>
                      <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                        Quantity
                      </TableCell>
                      <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                        Price
                      </TableCell>
                      <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.itemId}>
                        <TableCell>
                          {item.productName} - {item.color} ({item.size})
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>{order.orderStatus}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => handleEditClick(order, item)}
                            sx={{
                              backgroundColor: "#ff9800",
                              color: "white",
                              "&:hover": { backgroundColor: "#ffb74d" },
                            }}
                          >
                            Edit Status
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}

      <TablePagination
        component="div"
        count={orders.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ mt: 2, color: "#3f51b5" }}
      />

      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <DialogTitle sx={{ backgroundColor: "#3f51b5", color: "#ffffff" }}>
          Update Item Status
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <FormControl fullWidth>
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
              handleStatusChange(
                selectedOrder?.orderId,
                selectedItem?.itemId,
                newStatus
              )
            }
            color="primary"
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isOrderDetailModalOpen}
        onClose={() => setIsOrderDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: "#3f51b5", color: "#ffffff" }}>
          Order Details
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", mb: 2, color: "#3f51b5" }}
              >
                Order ID: {selectedOrder.orderId}
              </Typography>
              <Typography variant="body1">
                <strong>Customer:</strong> {selectedOrder.customer.name} 
                {selectedOrder.customer.email}
              </Typography>
              <Typography variant="body1">
                <strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}
              </Typography>
              <Typography variant="body1">
                <strong>Ordered at:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 3, fontWeight: "bold", color: "#3f51b5" }}
              >
                Shipping Address
              </Typography>
              <Typography variant="body1">
                {selectedOrder.shippingAddress.fullName}
              </Typography>
              <Typography variant="body1">
                {selectedOrder.shippingAddress.address},{" "}
                {selectedOrder.shippingAddress.city},{" "}
                {selectedOrder.shippingAddress.state} -{" "}
                {selectedOrder.shippingAddress.pincode}
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong>{" "}
                {selectedOrder.shippingAddress.mobileNumber}
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 3, fontWeight: "bold", color: "#3f51b5" }}
              >
                Products
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#3f51b5" }}>
                      <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                        Product
                      </TableCell>
                      <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                        Quantity
                      </TableCell>
                      <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                        Price
                      </TableCell>
                      <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item) => {
                      console.log("Orderrrrr", item);
                      
                      return (
                        <TableRow key={item.itemId}>
                          <TableCell>
                            {item.productName} - {item.color} ({item.size})
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.price}</TableCell>
                          <TableCell>{selectedOrder.orderStatus}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOrderDetailModalOpen(false)}>
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
