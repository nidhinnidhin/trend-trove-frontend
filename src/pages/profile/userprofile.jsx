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
  LockReset,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from "@mui/icons-material";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/footer";
import Image from "next/image";
import ProfileModal from "@/components/modals/profileModal";
import ResetPasswordModal from "@/components/modals/resetPasswordModal";

const UserProfilePage = () => {
  const [selectedSection, setSelectedSection] = useState("profile");
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [walletData, setWalletData] = useState({
    totalAmount: 0,
    returnedOrders: [],
    cancelledOrders: [],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("usertoken");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const axiosInstance = axios.create({
          headers: { Authorization: `Bearer ${token}` },
        });

        const [userResponse, addressesResponse, ordersResponse, cartResponse] =
          await Promise.allSettled([
            axiosInstance.get("http://localhost:9090/api/users/profile"),
            axiosInstance.get("http://localhost:9090/api/address/get-address"),
            axiosInstance.get("http://localhost:9090/api/checkout/get-orders"),
            axiosInstance.get("http://localhost:9090/api/cart/get-cart"),
          ]);

        if (userResponse.status === "fulfilled" && userResponse.value.data) {
          setUser(userResponse.value.data.user);
        }

        if (
          addressesResponse.status === "fulfilled" &&
          addressesResponse.value.data
        ) {
          setAddresses(addressesResponse.value.data.addresses || []);
        }

        if (
          ordersResponse.status === "fulfilled" &&
          ordersResponse.value.data
        ) {
          setOrders(ordersResponse.value.data.orders || []);
        }

        if (cartResponse.status === "fulfilled" && cartResponse.value.data) {
          setCart(cartResponse.value.data.cart || { items: [] });
        }

        const processOrdersData = (orders) => {
          const returnedOrders = orders.filter(
            (order) =>
              order.items.some((item) => item.status === "Returned") ||
              order.orderStatus === "returned"
          );

          const cancelledOrders = orders.filter(
            (order) =>
              order.items.some((item) => item.status === "Cancelled") ||
              order.orderStatus === "Cancelled"
          );

          const totalAmount = [...returnedOrders, ...cancelledOrders].reduce(
            (sum, order) => sum + order.payment.amount,
            0
          );

          setWalletData({
            totalAmount,
            returnedOrders,
            cancelledOrders,
          });
        };

        if (
          ordersResponse.status === "fulfilled" &&
          ordersResponse.value.data
        ) {
          const orders = ordersResponse.value.data.orders;
          processOrdersData(orders);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again later.");
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
    setIsProfileModalOpen(true);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
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

  const handlePasswordReset = (message) => {
    setSnackbarMessage(message);
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      );
    }

    switch (selectedSection) {
      case "profile":
        return (
          <Card
            sx={{
              backgroundColor: "#f8f9fa",
              width: "100%",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
            }}
          >
            {!user ? (
              <CardContent>
                <Typography variant="h6" align="center">
                  No profile information available
                </Typography>
              </CardContent>
            ) : (
              <>
                {/* Profile Header */}
                <Box
                  sx={{
                    backgroundColor: "#1a1a1a",
                    py: 6,
                    px: 3,
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      width: 150,
                      height: 150,
                      margin: "0 auto",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "4px solid #ffffff",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Image
                        src={user?.image || "/default-avatar.png"}
                        width={150}
                        height={150}
                        style={{ objectFit: "cover" }}
                        alt="User Profile"
                      />
                    </Box>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{ color: "white", mt: 2, fontWeight: 600 }}
                  >
                    {user?.firstname} {user?.lastname}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#9e9e9e", mt: 1 }}>
                    @{user?.username}
                  </Typography>
                </Box>

                {/* Profile Content */}
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={4}>
                    {/* Personal Information */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 4 }}>
                        <Typography
                          variant="h6"
                          sx={{ mb: 3, color: "#1a1a1a", fontWeight: 600 }}
                        >
                          Personal Information
                        </Typography>
                        <Box
                          sx={{
                            backgroundColor: "white",
                            p: 3,
                            borderRadius: 2,
                          }}
                        >
                          <Grid container spacing={3}>
                            <Grid item xs={12}>
                              <Typography
                                variant="subtitle2"
                                sx={{ color: "#666" }}
                              >
                                Email Address
                              </Typography>
                              <Typography variant="body1" sx={{ mt: 1 }}>
                                {user?.email}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="subtitle2"
                                sx={{ color: "#666" }}
                              >
                                First Name
                              </Typography>
                              <Typography variant="body1" sx={{ mt: 1 }}>
                                {user?.firstname}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant="subtitle2"
                                sx={{ color: "#666" }}
                              >
                                Last Name
                              </Typography>
                              <Typography variant="body1" sx={{ mt: 1 }}>
                                {user?.lastname}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography
                                variant="subtitle2"
                                sx={{ color: "#666" }}
                              >
                                Username
                              </Typography>
                              <Typography variant="body1" sx={{ mt: 1 }}>
                                {user?.username}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Account Settings */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 4 }}>
                        <Typography
                          variant="h6"
                          sx={{ mb: 3, color: "#1a1a1a", fontWeight: 600 }}
                        >
                          Account Settings
                        </Typography>
                        <Box
                          sx={{
                            backgroundColor: "white",
                            p: 3,
                            borderRadius: 2,
                          }}
                        >
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={handleEditProfile}
                            sx={{
                              mb: 2,
                              backgroundColor: "#1a1a1a",
                              color: "white",
                              py: 1.5,
                              "&:hover": {
                                backgroundColor: "#333",
                              },
                            }}
                          >
                            Edit Profile
                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<LockReset />}
                            onClick={() => setIsResetPasswordModalOpen(true)}
                            sx={{
                              borderColor: "#1a1a1a",
                              color: "#1a1a1a",
                              py: 1.5,
                              "&:hover": {
                                borderColor: "#333",
                                backgroundColor: "rgba(26,26,26,0.04)",
                              },
                            }}
                          >
                            Reset Password
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </>
            )}
          </Card>
        );

      case "addresses":
        return (
          <Box
            sx={{
              width: "100%",
              backgroundColor: "#fff",
              borderRadius: 3,
              p: 3,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "#1a1a1a" }}
              >
                My Addresses
              </Typography>
            </Box>

            {/* Addresses List */}
            <Grid container spacing={3}>
              {addresses.length === 0 ? (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      backgroundColor: "#f8f9fa",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6">
                      No addresses found. Add your first address.
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                addresses.map((address) => (
                  <Grid item xs={12} key={address._id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                        transition: "0.3s",
                        "&:hover": {
                          borderColor: "#1a1a1a",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      {/* Address Header */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                          pb: 2,
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: "#1a1a1a" }}
                          >
                            {address.fullName}
                          </Typography>
                          <Chip
                            label={address.addressType}
                            size="small"
                            sx={{
                              mt: 1,
                              backgroundColor: "#1a1a1a",
                              color: "white",
                            }}
                          />
                        </Box>
                        <Box>
                          <IconButton
                            onClick={() => handleEditAddress(address)}
                            sx={{
                              color: "#1a1a1a",
                              mr: 1,
                              "&:hover": { backgroundColor: "#f5f5f5" },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteAddress(address._id)}
                            sx={{
                              color: "#d32f2f",
                              "&:hover": {
                                backgroundColor: "#fff5f5",
                                color: "#b71c1c",
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Address Details */}
                      <Grid container spacing={2}>
                        {/* Contact Information */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Mobile Number
                          </Typography>
                          <Typography variant="body1">
                            {address.mobileNumber}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            PIN Code
                          </Typography>
                          <Typography variant="body1">
                            {address.pincode}
                          </Typography>
                        </Grid>

                        {/* Full Address */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Address
                          </Typography>
                          <Box
                            sx={{
                              backgroundColor: "#f8f9fa",
                              p: 2,
                              mt: 1,
                              borderRadius: 1,
                              border: "1px solid #eee",
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ lineHeight: 1.6 }}
                            >
                              {address.address}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* City and State */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            City
                          </Typography>
                          <Typography variant="body1">
                            {address.city}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="textSecondary">
                            State
                          </Typography>
                          <Typography variant="body1">
                            {address.state}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
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
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="h6">
                        No orders found. Start shopping to see your orders here.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
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
      case "wallet":
        return (
          <Card sx={{ bgcolor: "#1a1a1a", color: "white", borderRadius: 2 }}>
            <CardContent>
              {/* Wallet Balance */}
              <Box
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                  borderRadius: 2,
                  mb: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Wallet Balance
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ₹{walletData.totalAmount}
                  </Typography>
                </Box>
                <AccountBalanceWalletIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>

              {/* Transaction History */}
              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Order History
              </Typography>
              <TableContainer
                sx={{
                  maxHeight: 400,
                  bgcolor: "#262626",
                  borderRadius: 2,
                  "& .MuiTableCell-root": {
                    borderColor: "#404040",
                    color: "white",
                  },
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: "#333" }}>Order Date</TableCell>
                      <TableCell sx={{ bgcolor: "#333" }}>Product</TableCell>
                      <TableCell sx={{ bgcolor: "#333" }}>Amount</TableCell>
                      <TableCell sx={{ bgcolor: "#333" }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      ...walletData.returnedOrders,
                      ...walletData.cancelledOrders,
                    ]
                      .sort(
                        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
                      )
                      .map((order) =>
                        order.items.map((item, index) => (
                          <TableRow
                            key={`${order.orderId}-${index}`}
                            sx={{ "&:hover": { bgcolor: "#333" } }}
                          >
                            <TableCell>
                              {new Date(order.orderDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 4,
                                    objectFit: "cover",
                                  }}
                                />
                                <Typography variant="body2">
                                  {item.productName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>₹{item.finalPrice}</TableCell>
                            <TableCell>
                              <Chip
                                label={item.status}
                                color={
                                  item.status === "Returned" ? "info" : "error"
                                }
                                size="small"
                                sx={{
                                  bgcolor:
                                    item.status === "Returned"
                                      ? "rgba(33, 150, 243, 0.2)"
                                      : "rgba(244, 67, 54, 0.2)",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        p: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Header />
      <Box
        display="flex"
        mt={4}
        gap={3}
        flexDirection={{ xs: "column", md: "row" }}
      >
        {/* Sidebar */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: "100%", md: 280 },
            backgroundColor: "#1a1a1a",
            borderRadius: 2,
            p: 2,
          }}
        >
          <List>
            <ListItem
              button
              onClick={() => setSelectedSection("profile")}
              sx={{ cursor: "pointer", color: "#ffffff" }}
            >
              <ListItemIcon sx={{ color: "#ffffff" }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" sx={{ color: "#ffffff" }} />
            </ListItem>
            <ListItem
              button
              onClick={() => setSelectedSection("addresses")}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon sx={{ color: "#ffffff" }}>
                <LocationOnIcon />
              </ListItemIcon>
              <ListItemText primary="Addresses" sx={{ color: "#ffffff" }} />
            </ListItem>
            <ListItem
              button
              onClick={() => setSelectedSection("orders")}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon sx={{ color: "#ffffff" }}>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="Orders" sx={{ color: "#ffffff" }} />
            </ListItem>
            <ListItem
              button
              onClick={() => setSelectedSection("cart")}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon sx={{ color: "#ffffff" }}>
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText primary="Cart" sx={{ color: "#ffffff" }} />
            </ListItem>
            <ListItem
              button
              onClick={() => setSelectedSection("wallet")}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon sx={{ color: "#ffffff" }}>
                <AccountBalanceWalletIcon />
              </ListItemIcon>
              <ListItemText primary="Wallet" sx={{ color: "#ffffff" }} />
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
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          backgroundColor: "black",
          color: "white",
        }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <ResetPasswordModal
        open={isResetPasswordModalOpen}
        handleClose={() => setIsResetPasswordModalOpen(false)}
        onPasswordReset={handlePasswordReset}
      />

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
