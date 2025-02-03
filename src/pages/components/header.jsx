import React, { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
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
} from "@mui/material";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../../media/logo.png";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import ProfileModal from "@/components/modals/profileModal";

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("usertoken");
        if (token) {
          const response = await axiosInstance.get("users/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("User Profile:", response.data.user);
          setUserProfile(response.data.user.image);
          setUser(response.data.user);
        } else {
          console.log("No token found.");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setIsLoading(false);
        setSnackbarOpen(true); // Show an error snackbar to the user
      }
    };
  
    fetchProfile();
  }, []);
  

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
    handleMenuClose();
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

  const handleAddressClick = () => {
    
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("usertoken");
      if (token) {
        setIsLoggedIn(true);
      }
    }
  }, []);
  const handleProfileUpdate = (updatedUser) => {
    setUserProfile(updatedUser.image);  // Update the user profile image
    setUser(updatedUser);  // Update the user details if necessary
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "white",
          color: "gray",
          boxShadow: "none",
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
          <Link href="/">
            <Image src={logo} height={50} width={150} />
          </Link>

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
              <Typography variant="body1" sx={{ cursor: "pointer" }}>
                Products
              </Typography>
              <Typography variant="body1" sx={{ cursor: "pointer" }}>
                Category
              </Typography>
              <Typography variant="body1" sx={{ cursor: "pointer" }}>
                Brands
              </Typography>
              <Typography variant="body1" sx={{ cursor: "pointer" }}>
                Cart
              </Typography>
              <Typography variant="body1" sx={{ cursor: "pointer" }}>
                Wishlist
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isLoggedIn ? (
              <>
              <Link href="/cart/cartpage">
                <IconButton size="large" color="black">
                  <Badge badgeContent={4} color="error">
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
              </Link>
                <IconButton size="large" color="inherit">
                  <Badge badgeContent={2} color="error">
                    <FavoriteIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  size="large"
                  color="inherit"
                  onClick={handleMenuClick}
                >
                  <Avatar alt="Remy Sharp" src={userProfile || "/default-avatar.png"} />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleProfileClick}>My Profile</MenuItem>
                    <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
                  </Menu>
                </Menu>
              </>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                sx={{ borderColor: "orange", color: "orange" }}
                onClick={() => router.push("/authentication/loginSignup")}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={handleDrawerToggle}
        >
          <List>
            <ListItem button>
              <ListItemText primary="Products" />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemText primary="Category" />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemText primary="Brands" />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemText primary="Cart" />
            </ListItem>
            <Divider />
            <ListItem button>
              <ListItemText primary="Wishlist" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        sx={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <Grid sx={{ backgroundColor: "transparant", color: "black" }}>
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

      <ProfileModal
        open={isProfileModalOpen}
        handleClose={() => setIsProfileModalOpen(false)}
        user={user}
        profileImage = {userProfile}
        onProfileUpdate={handleProfileUpdate}
      />
    </Box>
  );
};

export default Header;
