import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import DashLineChart from "../components/dashboard/dashLineChart";
import RevenueCard from "../components/dashboard/revenueCard";
import Users from "../components/users/users";
import Category from "../components/category/category";
import Brand from "../components/brand/brand";
import { useRouter } from "next/router";
import Products from "../components/products/products";
import Orders from "../components/orders/orders";
import Cookies from "js-cookie";

const Dashboard = () => {
  const [selectedTopic, setSelectedTopic] = useState("Sales Summary");
  const [selectedDate, setSelectedDate] = useState("Last 7 days");
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const router = useRouter();

  // useEffect(() => {
  //   const getCookie = (name) => {
  //     const cookies = document.cookie.split("; ");
  //     for (let cookie of cookies) {
  //       const [key, value] = cookie.split("=");
  //       if (key === name) return value;
  //     }
  //     return null;
  //   };
  
  //   const token = getCookie("adminToken");
  
  //   if (!token) {
  //     router.push("/admin/authentication/login");
  //   } else {
  //     router.push("/admin/dashboard/dashboard");
  //   }
  // }, []);

  const handleLogout = () => {
    setOpenLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("admintoken");
    router.push("/admin/authentication/login");
  };

  const handleCancelLogout = () => {
    setOpenLogoutDialog(false);
  };

  return (
    <>
      {/* <AdminHeader /> */}
      <Box sx={{ display: "flex", width: "100%", height:"100vh" }}>
        {/* Sidebar */}
        <Drawer
          sx={{
            width: "25%", // Sidebar takes 25% of the width
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: "25%", // Ensures the drawer has a fixed width of 25%
              boxSizing: "border-box",
              backgroundColor: "#333", // Light Black background for sidebar
              paddingTop: "20px", // Add padding at the top
              borderRight: "1px solid #444", // Dark border between sidebar and content
            },
          }}
          variant="permanent"
          anchor="left"
        >
          {/* Wrapper Box for Sidebar */}
          <Box
            sx={{
              backgroundColor: "#333", // Sidebar dark background
              borderRadius: "10px", // Slight curve for the sidebar box
              margin: "10px", // Inner box spacing
              padding: "10px", // Inner padding
              // height: "calc(100% - 20px)", // Adjust for padding/margin
              // overflow: "auto", // Handle overflow if content is long
            }}
          >
            <List
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start", // Align items to the start
              }}
            >
              {[
                "Products",
                "Users",
                "Categories",
                "Brands",
                "Orders",
                "Coupons",
                "Offers",
                "Banner",
              ].map((text) => (
                <ListItem
                  button
                  key={text}
                  onClick={() => setSelectedTopic(text)}
                  sx={{
                    width: "100%",
                    cursor: "pointer",
                    justifyContent: "flex-start", // Align items to the start horizontally
                    padding: "10px 20px", // Adjust padding
                    borderBottom: "1px solid #444", // Subtle border between items
                    "&:hover": {
                      backgroundColor: "#FF9800", // Highlight on hover with orange
                    },
                    backgroundColor:
                      selectedTopic === text ? "#FF9800" : "transparent", // Highlight selected item with orange
                    color: selectedTopic === text ? "#212121" : "#ffffff", // White text, orange on selected
                    fontWeight: selectedTopic === text ? "bold" : "normal", // Bold the selected item
                  }}
                >
                  <ListItemText
                    primary={text}
                    sx={{
                      textAlign: "start", // Align text horizontally to the start
                      color: selectedTopic === text ? "#212121" : "#ffffff", // White for unselected, dark for selected
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        {/* Main content area (75% width) */}
        <Box
          sx={{
            flexGrow: 1,
            padding: 2,
            width: "75%",
            backgroundColor: "gray",
            height: "100vh",
            overflow:"auto"
          }}
        >
          {/* Sales Summary */}
          {selectedTopic === "Sales Summary" && (
            <Box>
              <Grid
                container
                spacing={3}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="date-filter" sx={{ color: "#212121" }}>
                      Select Date
                    </InputLabel>
                    <Select
                      labelId="date-filter"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      label="Select Date"
                      sx={{
                        backgroundColor: "#f5f5f5", // Light gray background for select box
                        color: "#212121", // Dark text color for contrast
                      }}
                    >
                      <MenuItem value="Last 7 days">Last 7 days</MenuItem>
                      <MenuItem value="Last 30 days">Last 30 days</MenuItem>
                      <MenuItem value="This Month">This Month</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid>
                  <Button
                    onClick={handleLogout}
                    variant="contained"
                    sx={{
                      backgroundColor: "red",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#d32f2f",
                      },
                    }}
                  >
                    Logout
                  </Button>
                </Grid>
              </Grid>

              {/* Download Summary Button */}
              <Box sx={{ marginTop: 2 }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#FF9800", // Orange button
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#FF5722", // Darker orange on hover
                    },
                  }}
                >
                  Download Summary
                </Button>
              </Box>

              <Divider sx={{ marginY: 3, borderColor: "#444" }} />

              {/* Revenue Cards */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                  <RevenueCard title="Revenue" amount="$5,000" percent="+15%" />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <RevenueCard title="Orders" amount="250" percent="+10%" />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <RevenueCard
                    title="Products Sold"
                    amount="1,500"
                    percent="+5%"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <RevenueCard
                    title="Total Customers"
                    amount="1,200"
                    percent="+8%"
                  />
                </Grid>
              </Grid>

              {/* Graph */}
              <Grid container spacing={3} sx={{ marginTop: 3 }}>
                <Grid item xs={12}>
                  <Card sx={{ backgroundColor: "#333", color: "white" }}>
                    <CardHeader
                      title="Orders Update"
                      action={
                        <Button
                          endIcon={<ArrowForward />}
                          sx={{
                            color: "#FF9800", // Orange for button text
                          }}
                        >
                          View Details
                        </Button>
                      }
                    />
                    <CardContent>
                      <DashLineChart />{" "}
                      {/* Assume you have a LineChart component */}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Show other selected topics */}
          {selectedTopic === "Products" && <Products/>}
          {selectedTopic === "Users" && <Users />}
          {selectedTopic === "Categories" && <Category />}
          {selectedTopic === "Brands" && <Brand />}
          {selectedTopic === "Orders" && <Orders />}
        </Box>
      </Box>

      {/* Confirmation Modal */}
      <Dialog open={openLogoutDialog} onClose={handleCancelLogout}>
        <DialogTitle>Are you sure you want to log out?</DialogTitle>
        <DialogContent>
          <Typography>Do you want to log out of your admin account?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmLogout} color="secondary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard;
