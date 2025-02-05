import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  LocationOn as LocationOnIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";

const UserProfilePage = () => {
  const [selectedSection, setSelectedSection] = useState("profile");
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  useEffect(() => {
    const token = localStorage.getItem("usertoken");

    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(
          "http://localhost:9090/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(userResponse.data.user);

        const addressesResponse = await axios.get(
          "http://localhost:9090/api/address/get-address",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAddresses(addressesResponse.data.addresses || []);

        const ordersResponse = await axios.get(
          "http://localhost:9090/api/checkout/get-orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(ordersResponse.data.orders || []);

        const cartResponse = await axios.get(
          "http://localhost:9090/api/cart/get-cart",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCart(cartResponse.data.cart || null);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setSnackbarMessage("Failed to fetch user data");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleEditProfile = () => {
    // Implement edit profile functionality
  };

  const handleDeleteAddress = async (addressId) => {
    const token = localStorage.getItem("usertoken");
    try {
      await axios.delete(
        `http://localhost:9090/api/address/delete-address/${addressId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAddresses((prevAddresses) =>
        prevAddresses.filter((address) => address._id !== addressId)
      );
      setSnackbarMessage("Address deleted successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting address:", error);
      setSnackbarMessage("Error deleting address");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const renderContent = () => {
    switch (selectedSection) {
      case "profile":
        return (
          <Card
            sx={{
              backgroundColor: "#f5f5f5",
              p: 3,
              width: "100%",
              height: "80vh",
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  src={user?.profileImage || "/default-avatar.png"}
                  sx={{ width: 100, height: 100, mr: 2 }}
                />
                <Typography variant="h4" color="text.primary">
                  {user?.firstname} {user?.lastname}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                <strong>Username:</strong> {user?.username}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Email:</strong> {user?.email}
              </Typography>
              <CardActions>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
              </CardActions>
            </CardContent>
          </Card>
        );
      case "addresses":
        return (
          <Grid container sx={{ width: "100%" }}>
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  key={address._id}
                  sx={{
                    backgroundColor: "#f5f5f5",
                    height: "80vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Card
                    sx={{
                      backgroundColor: "white",
                      width: "90%",
                      margin: "5px 0px",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" color="text.primary">
                        {address.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {address.address}, {address.city}, {address.state} -{" "}
                        {address.pincode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {address.mobileNumber}
                      </Typography>
                      <Box display="flex" justifyContent="flex-end" mt={2}>
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteAddress(address._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography variant="body1" color="text.secondary">
                No addresses found
              </Typography>
            )}
          </Grid>
        );
      case "orders":
        return (
          <Table sx={{ backgroundColor: "#f5f5f5" }}>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>₹{order.totalPrice}</TableCell>
                    <TableCell>{order.orderStatus}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        );
      case "cart":
        return (
          <Table sx={{ backgroundColor: "#f5f5f5" }}>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cart?.items?.length > 0 ? (
                cart.items.map((item) => (
                  <TableRow key={item.product._id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.price * item.quantity}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No items in cart
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        );
      default:
        return null;
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ minHeight: "100vh", backgroundColor: "#ffffff", p: 6 }}
    >
      <Header />
      <Box display="flex" mt={4}>
        {/* Sidebar */}
        <Paper
          elevation={3}
          sx={{
            width: 250,
            height: "80vh",
            p: 2,
            mr: 3,
            backgroundColor: "#1e1e1e",
            color: "#ffffff",
          }}
        >
          <List>
            <ListItem
              button
              onClick={() => setSelectedSection("profile")}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon sx={{ color: "#ffffff" }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem
              button
              onClick={() => setSelectedSection("addresses")}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon sx={{ color: "#ffffff" }}>
                <LocationOnIcon />
              </ListItemIcon>
              <ListItemText primary="Addresses" />
            </ListItem>
            <ListItem
              button
              onClick={() => setSelectedSection("orders")}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon sx={{ color: "#ffffff" }}>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="Orders" />
            </ListItem>
            <ListItem
              button
              onClick={() => setSelectedSection("cart")}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon sx={{ color: "#ffffff" }}>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary="Cart" />
            </ListItem>
          </List>
        </Paper>

        {/* Main Content */}
        <Box flexGrow={1}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="50vh"
            >
              <CircularProgress />
            </Box>
          ) : (
            renderContent()
          )}
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Footer />
    </Container>
  );
};

export default UserProfilePage;
