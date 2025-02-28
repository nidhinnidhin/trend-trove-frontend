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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ButtonGroup,
  TextField,
  Chip,
} from "@mui/material";
import {
  ArrowForward,
  AttachMoney,
  ShoppingBag,
  LocalShipping,
  AssignmentReturn,
  LocalOffer,
  Cancel,
  FileDownload,
  Person,
  Discount,
  Collections,
  Category as CategoryIcon,
} from "@mui/icons-material";
import DashLineChart from "../components/dashboard/dashLineChart";
import RevenueCard from "../components/dashboard/revenueCard";
import Users from "../components/users/users";
import CategoryManagement from "../components/category/category";
import BrandManagement from "../components/brand/brand";
import { useRouter } from "next/router";
import ProductManagement from "../components/products/products";
import Orders from "../components/orders/orders";
import Cookie from "js-cookie";
import Coupons from "../components/coupons/coupons";
import Offers from "../components/offers/offfers";
import axios from "axios";
import axiosInstance from "@/utils/adminAxiosInstance";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Banners from "../components/banners/banners";
import Cookies from "js-cookie";
import UserManagement from "../components/users/users";
import OrderManagement from "../components/orders/orders";
import CouponManagement from "../components/coupons/coupons";
import OfferManagement from "../components/offers/offfers";
import BannerManagement from "../components/banners/banners";

const Dashboard = () => {
  const [selectedTopic, setSelectedTopic] = useState("Sales Summary");
  const [selectedDate, setSelectedDate] = useState("Last 7 days");
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filterType, setFilterType] = useState("last7days");
  const [customDates, setCustomDates] = useState({
    startDate: "",
    endDate: "",
  });
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    returnedOrders: 0,
    cancelledOrders: 0,
    totalDiscount: 0,
  });

  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [filterType, customDates]);

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get(
        "/checkout/get-all-order-product"
      );
      if (response.data?.orders) {
        const filteredOrders = filterOrdersByDate(response.data.orders);
        setOrders(filteredOrders);
        calculateStats(filteredOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const filterOrdersByDate = (orders) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (filterType) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last7days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "last30days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "custom":
        if (customDates.startDate && customDates.endDate) {
          startDate = new Date(customDates.startDate);
          endDate = new Date(customDates.endDate);
        }
        break;
    }

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  const calculateStats = (orders) => {
    const newStats = orders.reduce(
      (acc, order) => {
        if (order.orderStatus !== "Cancelled") {
          acc.totalRevenue += order.totalAmount;
        }

        acc.totalOrders++;

        switch (order.orderStatus.toLowerCase()) {
          case "pending":
            acc.pendingOrders++;
            break;
          case "cancelled":
            acc.cancelledOrders++;
            break;
        }

        if (order.items.some((item) => item.status === "Returned")) {
          acc.returnedOrders++;
        }

        order.items.forEach((item) => {
          const originalPrice = item.price * item.quantity;
          const finalPrice = order.totalAmount;
          acc.totalDiscount += originalPrice - finalPrice;
        });

        return acc;
      },
      {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        returnedOrders: 0,
        cancelledOrders: 0,
        totalDiscount: 0,
      }
    );

    setStats(newStats);
  };

  const handleLogout = () => {
    setOpenLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await axiosInstance.get("/admin/logout");
      localStorage.removeItem("admin-logged");
      router.push("/admin/authentication/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    let admin_logged = localStorage.getItem("admin-logged");
    if (admin_logged) {
      router.push("/admin/dashboard/dashboard");
    } else {
      router.push("/admin/authentication/login");
    }
  }, []);

  const handleCancelLogout = () => {
    setOpenLogoutDialog(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Order Summary Report", 14, 22);

    doc.setFontSize(12);
    doc.text(
      `Period: ${filterType.replace(/([A-Z])/g, " $1").toLowerCase()}`,
      14,
      32
    );

    doc.autoTable({
      startY: 40,
      head: [["Metric", "Value"]],
      body: [
        ["Total Revenue", `₹${stats.totalRevenue.toLocaleString("en-IN")}`],
        ["Total Orders", stats.totalOrders],
        ["Pending Orders", stats.pendingOrders],
        ["Returned Orders", stats.returnedOrders],
        ["Cancelled Orders", stats.cancelledOrders],
        ["Total Discount", `₹${stats.totalDiscount.toLocaleString("en-IN")}`],
      ],
      theme: "grid",
      headStyles: { fillColor: [255, 152, 0] },
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [
        [
          "Order ID",
          "Date",
          "Customer",
          "Items",
          "Amount",
          "Status",
          "Payment",
        ],
      ],
      body: orders.map((order) => [
        order.orderId,
        new Date(order.createdAt).toLocaleDateString(),
        order.customer.email,
        order.items
          .map((item) => `${item.productName} x ${item.quantity}`)
          .join("\n"),
        `₹${order.totalAmount}`,
        order.orderStatus,
        order.payment.method,
      ]),
      theme: "grid",
      headStyles: { fillColor: [255, 152, 0] },
      styles: { overflow: "linebreak" },
      columnStyles: {
        3: { cellWidth: 50 },
      },
    });

    const fileName = `order_summary_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
  };

  return (
    <>
      <Box sx={{ display: "flex", width: "100%", height: "100vh" }}>
        <Drawer
          sx={{
            width: "25%",
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: "25%",
              boxSizing: "border-box",
              backgroundColor: "#333",
              paddingTop: "20px",
              borderRight: "1px solid #444",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Box
            sx={{
              backgroundColor: "#333",
              borderRadius: "10px",
              margin: "10px",
              padding: "10px",
            }}
          >
            <List
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
              }}
            >
              {[
                { text: "Sales Summary", icon: AttachMoney },
                { text: "Products", icon: ShoppingBag },
                { text: "Users", icon: Person },
                { text: "Categories", icon: CategoryIcon },
                { text: "Brands", icon: LocalOffer },
                { text: "Orders", icon: LocalShipping },
                { text: "Coupons", icon: Discount },
                { text: "Offers", icon: LocalOffer },
                { text: "Banners", icon: Collections },
              ].map(({ text, icon: Icon }) => (
                <ListItem
                  button
                  key={text}
                  onClick={() => setSelectedTopic(text)}
                  sx={{
                    width: "100%",
                    cursor: "pointer",
                    justifyContent: "flex-start",
                    padding: "10px 20px",
                    borderBottom: "1px solid #444",
                    "&:hover": {
                      backgroundColor: "#FF9800",
                    },
                    backgroundColor:
                      selectedTopic === text ? "#FF9800" : "transparent",
                    color: selectedTopic === text ? "#212121" : "#ffffff",
                    fontWeight: selectedTopic === text ? "bold" : "normal",
                  }}
                >
                  <ListItemText
                    primary={text}
                    sx={{
                      textAlign: "start",
                      color: selectedTopic === text ? "#212121" : "#ffffff",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box
          sx={{
            flexGrow: 1,
            padding: 2,
            width: "75%",
            backgroundColor: "gray",
            height: "100vh",
            overflow: "auto",
          }}
        >
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
                        backgroundColor: "#f5f5f5",
                        color: "#212121",
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

              <Box sx={{ marginTop: 2 }}>
                <Button
                  variant="contained"
                  onClick={generatePDF}
                  sx={{
                    backgroundColor: "#FF9800",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#FF5722",
                    },
                  }}
                >
                  Download Summary
                </Button>
              </Box>

              <Divider sx={{ marginY: 3, borderColor: "#444" }} />

              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <RevenueCard
                    title="Total Revenue"
                    amount={stats.totalRevenue}
                    icon={AttachMoney}
                    color="#4CAF50"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <RevenueCard
                    title="Total Orders"
                    amount={stats.totalOrders}
                    icon={ShoppingBag}
                    color="#2196F3"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <RevenueCard
                    title="Pending Orders"
                    amount={stats.pendingOrders}
                    icon={LocalShipping}
                    color="#FF9800"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <RevenueCard
                    title="Returns"
                    amount={stats.returnedOrders}
                    icon={AssignmentReturn}
                    color="#f44336"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <RevenueCard
                    title="Cancelled"
                    amount={stats.cancelledOrders}
                    icon={Cancel}
                    color="#9C27B0"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <RevenueCard
                    title="Total Discount"
                    amount={stats.totalDiscount}
                    icon={LocalOffer}
                    color="#607D8B"
                  />
                </Grid>
              </Grid>

              <Card sx={{ mb: 3, backgroundColor: "#333" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                    Sales Overview
                  </Typography>
                  <DashLineChart data={orders} />
                </CardContent>
              </Card>

              <Card sx={{ backgroundColor: "#333" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
                    Recent Orders
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: "white" }}>
                            Order ID
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>Date</TableCell>
                          <TableCell sx={{ color: "white" }}>
                            Customer
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>Items</TableCell>
                          <TableCell sx={{ color: "white" }}>
                            Total Amount
                          </TableCell>
                          <TableCell sx={{ color: "white" }}>Status</TableCell>
                          <TableCell sx={{ color: "white" }}>Payment</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.orderId}>
                            <TableCell sx={{ color: "white" }}>
                              {order.orderId}
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              {order.customer.email}
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              {order.items.map((item) => (
                                <div key={item.itemId}>
                                  {item.productName} x {item.quantity}
                                </div>
                              ))}
                            </TableCell>
                            <TableCell sx={{ color: "white" }}>
                              ₹{order.totalAmount}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={order.orderStatus}
                                color={
                                  order.orderStatus === "pending"
                                    ? "warning"
                                    : order.orderStatus === "Cancelled"
                                    ? "error"
                                    : order.orderStatus === "Returned"
                                    ? "info"
                                    : "success"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={order.payment.method}
                                color={
                                  order.payment.status === "completed"
                                    ? "success"
                                    : "warning"
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          )}

          {selectedTopic === "Products" && <ProductManagement />}
          {selectedTopic === "Users" && <UserManagement />}
          {selectedTopic === "Categories" && <CategoryManagement />}
          {selectedTopic === "Brands" && <BrandManagement />}
          {selectedTopic === "Orders" && <OrderManagement />}
          {selectedTopic === "Coupons" && <CouponManagement />}
          {selectedTopic === "Offers" && <OfferManagement />}
          {selectedTopic === "Banners" && <BannerManagement />}
        </Box>
      </Box>

      <Dialog
        open={openLogoutDialog}
        onClose={handleCancelLogout}
        aria-labelledby="logout-dialog-title"
        keepMounted={false}
        disablePortal
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          Are you sure you want to logout?
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelLogout}
            color="primary"
            autoFocus
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmLogout}
            color="error"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard;
