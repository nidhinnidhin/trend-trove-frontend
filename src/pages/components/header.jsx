import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import {
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Snackbar,
  Grid,
  Slide,
  TextField,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../../media/logo.png";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import ProfileModal from "@/components/modals/profileModal";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setCartLength } from "@/redux/features/cartSlice";
import { motion } from "framer-motion";
import LocalMallIcon from "@mui/icons-material/LocalMall"; // Custom cart icon
import { ShoppingCartIcon } from "lucide-react";

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useDispatch();
  const cartLength = useSelector((state) => state.cart.cartLength);

  useEffect(() => {
    const fetchCartLength = async () => {
      const token = localStorage.getItem("usertoken");
      if (token) {
        try {
          const response = await axios.get(
            "http://localhost:9090/api/cart/get-cart",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.cart) {
            dispatch(setCartLength(response.data.cart.items.length));
          }
        } catch (error) {
          if (error.response?.status === 404) {
            dispatch(setCartLength(0));
          } else {
            console.error("Error fetching cart length:", error);
          }
        }
      }
    };

    fetchCartLength();
  }, [dispatch]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("usertoken");
      setToken(storedToken);
      if (storedToken) {
        setIsLoggedIn(true);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const response = await axiosInstance.get("users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserProfile(response.data.user.image || "");
          setUser(response.data.user);
        } catch (error) {
          if (error.response?.status === 404) {
            setUserProfile(response.data.user.image || "");
          } else {
            console.error("Error fetching Profile:", error);
          }
          setIsLoading(false);
          setSnackbarOpen(true);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleProfileClick = () => {
    router.push("/profile/userprofile");
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("usertoken");
    setToken(null);
    setIsLoggedIn(false);

    setTimeout(() => {
      router.push("/authentication/loginSignup");
    }, 1000);

    setSnackbarOpen(true);
    setOpenLogoutDialog(false);
  };

  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUserProfile(updatedUser.image);
    setUser(updatedUser);
  };

  const handleSearchToggle = () => {
    setIsSearchOpen((prev) => !prev);
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      try {
        const response = await axios.get(
          `http://localhost:9090/api/products/product/search`,
          {
            params: { query },
          }
        );
        setSearchResults(response.data.products);
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchItemClick = () => {
    router.push(`/productListing/searchResults?search=${searchQuery}`);
    setIsSearchOpen(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          width:"100%",
          backgroundColor: "#ffffff",
          color: "#333",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            width: {
              xs: "100%",
              md: "90%",
            },
            margin: "0 auto",
            paddingX: isMobile ? 2 : 0,
          }}
        >
          {/* Logo with Animation */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link href="/">
              <Image src={logo} height={50} width={150} alt="Logo" />
            </Link>
          </motion.div>

          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{
                position: "absolute",
                left: 10,
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                gap: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {["Explore", "Category", "Brands", "Cart", "Wishlist"].map(
                (item, index) => (
                  <Typography
                    key={index}
                    variant="body1"
                    sx={{
                      cursor: "pointer",
                      position: "relative",
                      "&:hover::after": {
                        content: '""',
                        position: "absolute",
                        bottom: "-5px",
                        left: 0,
                        width: "100%",
                        height: "2px",
                        backgroundColor: "orange",
                        transform: "scaleX(1)",
                        transition: "transform 0.3s ease",
                      },
                    }}
                  >
                    <Link
                      href={
                        item === "Explore"
                          ? "/productListing/explore"
                          : `/${item.toLowerCase()}`
                      }
                      style={{ textDecoration: "none", color: "#333" }}
                    >
                      {item}
                    </Link>
                  </Typography>
                )
              )}
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton color="inherit" onClick={handleSearchToggle}>
              <Tooltip title="Search products">
                <SearchIcon sx={{ fontSize: "30px", color: "#333" }} />
              </Tooltip>
            </IconButton>
            {isLoggedIn ? (
              <>
                <IconButton size="large" color="inherit">
                  <Link href="/cart/cartpage">
                    <Badge badgeContent={cartLength} color="error">
                      <ShoppingCartIcon sx={{fontSize: "30px", color: "#ff6f61" }} />
                    </Badge>
                  </Link>
                </IconButton>

                <IconButton size="large" color="inherit">
                  <Link href="/whishlist/whishlistPage">
                    <Badge badgeContent={cartLength} color="error">
                      <FavoriteIcon
                        sx={{ fontSize: "30px", color: "#ff6f61" }}
                      />
                    </Badge>
                  </Link>
                </IconButton>
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={handleMenuClick}
                  sx={{
                    "&:hover": {
                      transform: "scale(1.1)",
                      transition: "transform 0.3s ease",
                    },
                  }}
                >
                  <Avatar
                    alt="User Avatar"
                    src={userProfile || "/default-avatar.png"}
                  />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleProfileClick}>My Profile</MenuItem>
                  <Link
                    href="/orders/orders"
                    style={{ textDecoration: "none", color: "black" }}
                  >
                    <MenuItem>Orders</MenuItem>
                  </Link>
                  <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                sx={{
                  borderColor: "orange",
                  color: "orange",
                  "&:hover": {
                    backgroundColor: "orange",
                    color: "white",
                  },
                }}
                onClick={() => router.push("/authentication/loginSignup")}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>

        {/* Search Bar */}
        <Slide direction="down" in={isSearchOpen} mountOnEnter unmountOnExit>
          <Box
            sx={{
              width: "100%",
              p: 2,
              backgroundColor: "#ffffff",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              position: "absolute",
              top: 64,
              zIndex: 1100,
            }}
          >
            <TextField
              fullWidth
              placeholder="Search products..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{
                backgroundColor: "#f8f8f8",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#bdbdbd",
                  },
                  "&:hover fieldset": {
                    borderColor: "#757575",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#000",
                  },
                },
              }}
            />
            {searchResults.length > 0 && (
              <List
                sx={{
                  backgroundColor: "#ffffff",
                  mt: 1,
                  borderRadius: "8px",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                {searchResults.map((product) => (
                  <ListItem
                    key={product._id}
                    button
                    sx={{ borderBottom: "1px solid #f0f0f0" }}
                    onClick={handleSearchItemClick}
                  >
                    <SearchIcon sx={{ color: "gray", marginRight: "10px" }} />
                    <ListItemText primary={product.name} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Slide>
      </AppBar>

      {/* Drawer for Mobile */}
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={handleDrawerToggle}
        >
          <List>
            {["Products", "Category", "Brands", "Cart", "Wishlist"].map(
              (text, index) => (
                <ListItem button key={text}>
                  <ListItemText primary={text} />
                </ListItem>
              )
            )}
          </List>
        </Box>
      </Drawer>

      {/* Logout Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <Grid sx={{ backgroundColor: "transparent", color: "black" }}>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogContent>Are you sure you want to logout?</DialogContent>
          <DialogActions>
            <Button
              onClick={handleLogoutCancel}
              sx={{
                border: "1px solid orange",
                color: "black",
                "&:hover": {
                  backgroundColor: "darkorange",
                },
              }}
            >
              No
            </Button>
            <Button
              onClick={handleLogoutConfirm}
              sx={{
                border: "1px solid red",
                color: "black",
                "&:hover": {
                  backgroundColor: "darkred",
                },
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Grid>
      </Dialog>

      {/* Snackbar for Logout */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="You are logged out"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage("")}
        message={errorMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          backgroundColor: "black",
          color: "white",
        }}
      />

      <ProfileModal
        open={isProfileModalOpen}
        handleClose={() => setIsProfileModalOpen(false)}
        user={user}
        profileImage={userProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </Box>
  );
};

export default Header;
