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
  TableContainer,
  Chip,
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
import Image from "next/image";
import ProfileModal from "@/components/modals/profileModal";

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
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("usertoken");
      if (token) {
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
          if (addressesResponse.data.addresses.length != 0) {
            setAddresses(addressesResponse.data.addresses || []);
          } else {
            setAddresses([]);
          }

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
          console.error(
            "Error details:",
            error.response?.data || error.message
          );
          setSnackbarMessage("Failed to fetch user data");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, []);
  console.log("Orderssssssss", orders);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleEditProfile = () => {
    setIsProfileModalOpen(true); // Open the modal
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser); // Update the user data in the parent component
    setSnackbarMessage("Profile updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "success"; // Green
      case "pending":
        return "warning"; // Orange
      case "cancelled":
        return "error"; // Red
      default:
        return "default"; // Grey
    }
  };

  const renderContent = () => {
    switch (selectedSection) {
      case "profile":
        return (
          <Card
            sx={{
              backgroundColor: "#ffffff",
              p: 3,
              width: "100%",
              maxWidth: 500,
              mx: "auto",
              borderRadius: 3,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  overflow: "hidden",
                  mb: 2,
                  border: "3px solid #222",
                }}
              >
                <Image
                  src={user?.image || "/default-avatar.png"}
                  width={120}
                  height={120}
                  style={{ objectFit: "cover" }}
                  alt="User Profile"
                />
              </Box>
              <Typography variant="h5" fontWeight={600} color="#222">
                {user?.firstname} {user?.lastname}
              </Typography>
              <Typography variant="body2" color="gray" mt={0.5}>
                @{user?.username}
              </Typography>
              <Typography variant="body2" color="gray">
                {user?.email}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", pb: 2 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditProfile} // Open modal on click
                sx={{
                  backgroundColor: "#222",
                  color: "white",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#444" },
                }}
              >
                Edit Profile
              </Button>
            </CardActions>
          </Card>
        );
      case "addresses":
        return (
          <Grid
            container
            spacing={2}
            sx={{ width: "100%", justifyContent: "center" }}
          >
            {addresses.length > 0 ? (
              addresses.map((address) => (
                <Grid item xs={12} sm={6} md={4} key={address._id}>
                  <Card
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: 3,
                      p: 2,
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                      transition: "0.3s",
                      "&:hover": {
                        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} color="#222">
                        {address.fullName}
                      </Typography>
                      <Typography variant="body2" color="gray" mt={1}>
                        {address.address}, {address.city}, {address.state} -{" "}
                        {address.pincode}
                      </Typography>
                      <Typography variant="body2" color="gray">
                        Phone: {address.mobileNumber}
                      </Typography>
                      <Box display="flex" justifyContent="flex-end" mt={2}>
                        <IconButton
                          sx={{
                            color: "#222",
                            "&:hover": { color: "#444" },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteAddress(address._id)}
                          sx={{
                            color: "red",
                            "&:hover": { color: "#d32f2f" },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: "center", mt: 2 }}
              >
                No addresses found
              </Typography>
            )}
          </Grid>
        );
      case "orders":
        return (
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "#fff",
              borderRadius: 3,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
            }}
          >
            <Table>
              {/* Table Header */}
              <TableHead>
                <TableRow sx={{ backgroundColor: "#222" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Order ID
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Payment
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>

              {/* Table Body */}
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow
                      key={order.orderId}
                      sx={{
                        "&:hover": { backgroundColor: "#f5f5f5" },
                        transition: "0.3s",
                      }}
                    >
                      <TableCell sx={{ color: "#222", fontWeight: 500 }}>
                        {order.orderId}
                      </TableCell>
                      <TableCell sx={{ color: "#444" }}>
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ color: "#000", fontWeight: 500 }}>
                        {order.payment.method}
                      </TableCell>
                      <TableCell sx={{ color: "#000", fontWeight: 600 }}>
                        ₹{order.totalAmount}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.orderStatus}
                          color={getStatusColor(order.orderStatus)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ color: "#888", py: 3 }}
                    >
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case "cart":
        return (
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "#fff",
              borderRadius: 3,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
            }}
          >
            <Table>
              {/* Table Head */}
              <TableHead>
                <TableRow sx={{ backgroundColor: "#222" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Product
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Quantity
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Price
                  </TableCell>
                </TableRow>
              </TableHead>

              {/* Table Body */}
              <TableBody>
                {cart?.items?.length > 0 ? (
                  cart.items.map((item) => (
                    <TableRow
                      key={item.product._id}
                      sx={{
                        "&:hover": { backgroundColor: "#f5f5f5" },
                        transition: "0.3s",
                      }}
                    >
                      <TableCell sx={{ color: "#222", fontWeight: 500 }}>
                        {item.product.name}
                      </TableCell>
                      <TableCell sx={{ color: "#444" }}>
                        {item.quantity}
                      </TableCell>
                      <TableCell sx={{ color: "#000", fontWeight: 600 }}>
                        ₹{item.price * item.quantity}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{ color: "#888", py: 3 }}
                    >
                      No items in cart
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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

      <ProfileModal
        open={isProfileModalOpen}
        handleClose={() => setIsProfileModalOpen(false)}
        user={user}
        profileImage={user?.image}
        onProfileUpdate={handleProfileUpdate} // Pass the update handler
      />
      <Footer />
    </Container>
  );
};

export default UserProfilePage;
