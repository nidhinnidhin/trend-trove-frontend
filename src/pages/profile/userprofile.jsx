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
    cancelledOrders: []
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
          const returnedOrders = orders.filter(order => 
            order.items.some(item => item.status === "Returned") || order.orderStatus === "returned"
          );
          
          const cancelledOrders = orders.filter(order => 
            order.items.some(item => item.status === "Cancelled") || order.orderStatus === "Cancelled"
          );

          const totalAmount = [...returnedOrders, ...cancelledOrders].reduce((sum, order) => 
            sum + order.payment.amount, 0
          );

          setWalletData({
            totalAmount,
            returnedOrders,
            cancelledOrders
          });
        };

        if (ordersResponse.status === "fulfilled" && ordersResponse.value.data) {
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
              backgroundColor: "#ffffff",
              p: 3,
              width: "100%",
              maxWidth: 500,
              mx: "auto",
              borderRadius: 3,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
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
                <CardActions sx={{ justifyContent: "center", pb: 2, gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEditProfile}
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
                  <Button
                    variant="contained"
                    startIcon={<LockReset />}
                    onClick={() => setIsResetPasswordModalOpen(true)}
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
                    Reset Password
                  </Button>
                </CardActions>
              </>
            )}
          </Card>
        );

      case "addresses":
        return (
          <Grid
            container
            spacing={2}
            sx={{ width: "100%", justifyContent: "center" }}
          >
            {addresses.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="h6" align="center">
                  No addresses found. Add your first address.
                </Typography>
              </Grid>
            ) : (
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
          <Card sx={{ bgcolor: '#1a1a1a', color: 'white', borderRadius: 2 }}>
            <CardContent>
              {/* Wallet Balance */}
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                borderRadius: 2,
                mb: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
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
              <TableContainer sx={{ 
                maxHeight: 400,
                bgcolor: '#262626',
                borderRadius: 2,
                '& .MuiTableCell-root': { 
                  borderColor: '#404040',
                  color: 'white'
                }
              }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: '#333' }}>Order Date</TableCell>
                      <TableCell sx={{ bgcolor: '#333' }}>Product</TableCell>
                      <TableCell sx={{ bgcolor: '#333' }}>Amount</TableCell>
                      <TableCell sx={{ bgcolor: '#333' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...walletData.returnedOrders, ...walletData.cancelledOrders]
                      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                      .map((order) => (
                        order.items.map((item, index) => (
                          <TableRow 
                            key={`${order.orderId}-${index}`}
                            sx={{ '&:hover': { bgcolor: '#333' } }}
                          >
                            <TableCell>
                              {new Date(order.orderDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <img 
                                  src={item.image} 
                                  alt={item.productName}
                                  style={{ 
                                    width: 40, 
                                    height: 40, 
                                    borderRadius: 4,
                                    objectFit: 'cover'
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
                                color={item.status === "Returned" ? "info" : "error"}
                                size="small"
                                sx={{ 
                                  bgcolor: item.status === "Returned" 
                                    ? 'rgba(33, 150, 243, 0.2)' 
                                    : 'rgba(244, 67, 54, 0.2)'
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                    ))}
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
            <ListItem
              button
              onClick={() => setSelectedSection("wallet")}
              sx={{ cursor: "pointer" }}
            >
              <ListItemIcon sx={{ color: "#ffffff" }}>
                <AccountBalanceWalletIcon />
              </ListItemIcon>
              <ListItemText primary="Wallet" />
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
