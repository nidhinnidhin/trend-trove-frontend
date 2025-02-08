import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  IconButton,
  Badge,
  Card,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Container,
  Box,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  LocalShipping as LocalShippingIcon,
  DeleteForever,
  DeleteForeverRounded,
} from "@mui/icons-material";
import Header from "../header";
import Footer from "../footer";
import axios from "axios";
import { Delete as DeleteIcon } from "@mui/icons-material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddAddressModal from "@/components/modals/addAddressModal";
import EditIcon from "@mui/icons-material/Edit";
import { styled } from "@mui/material/styles";
import EditAddressModal from "@/components/modals/editAddressModal";
import { Delete } from "lucide-react";
import { Router, useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setCartLength } from "@/redux/features/cartSlice";

const EditButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.grey[800],
  "&:hover": {
    backgroundColor: theme.palette.grey[200],
  },
  border: `1px solid ${theme.palette.grey[300]}`,
  textTransform: "none",
  padding: "8px 16px",
  "&:focus": {
    boxShadow: `0 0 0 2px ${theme.palette.grey[200]}`,
  },
}));

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [quantityError, setQuantityError] = useState("");
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
  const [selectedEditAddress, setSelectedEditAddress] = useState(null);
  const [selectedAddressToDelete, setSelectedAddressToDelete] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const router = useRouter();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("usertoken");

    const fetchAddresses = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9090/api/address/get-address",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAddresses(response.data.addresses || []);
      } catch (error) {
        if (error.response?.status === 404) {
          setAddresses([]);
        } else {
          console.error("Error fetching addresses:", error);
        }
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("usertoken");

    const fetchCartData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9090/api/cart/get-cart",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCart(response.data.cart);
      } catch (error) {
        if (error.response?.status === 404) {
          setCart(null);
        } else {
          setCartError("Error fetching cart data");
          console.error("Error fetching cart data:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const handleOpenModal = (item) => {
    setItemToDelete(item);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Close the modal
    setItemToDelete(null); // Clear the item to delete
  };

  const handleDeleteProduct = async () => {
    if (!itemToDelete) return;

    const token = localStorage.getItem("usertoken");
    const { product, variant, sizeVariant } = itemToDelete;

    try {
      // Call the API to delete the product
      const response = await axios.delete(
        "http://localhost:9090/api/cart/delete-product",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            productId: product._id,
            variantId: variant._id,
            sizeVariantId: sizeVariant._id,
          },
        }
      );

      const cartResponse = await axios.get(
        "http://localhost:9090/api/cart/get-cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(setCartLength(cartResponse.data.cart.items.length));

      setCart((prevCart) => {
        const updatedItems = prevCart.items.filter(
          (item) =>
            item.product._id !== product._id ||
            item.variant._id !== variant._id ||
            item.sizeVariant._id !== sizeVariant._id
        );

        return {
          ...prevCart,
          items: updatedItems,
          totalPrice: response.data.cart.totalPrice,
          discountAmount: response.data.cart.discountAmount,
        };
      });

      handleCloseModal();
    } catch (error) {
      console.error("Error removing product from cart:", error);
    }
  };

  const handleQuantityChange = async (item, newQuantity) => {
    console.log("StockCounttttttttttttt", item.sizeVariant.stockCount);

    setQuantityError("");

    if (newQuantity > 4 || newQuantity > item.sizeVariant.stockCount) {
      setQuantityError(
        `Maximum quantity allowed is ${item.sizeVariant.stockCount} items per product only ${item.sizeVariant.stockCount} available`
      );
      return;
    }

    if (newQuantity < 1) {
      setQuantityError("Minimum quantity allowed is 1 item");
      return;
    }

    const token = localStorage.getItem("usertoken");
    const { product, variant, sizeVariant } = item;

    const updatedItems = cart.items.map((cartItem) =>
      cartItem.product._id === product._id &&
      cartItem.variant._id === variant._id &&
      cartItem.sizeVariant._id === sizeVariant._id
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );

    const newTotalPrice = updatedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    setCart({
      ...cart,
      items: updatedItems,
      totalPrice: newTotalPrice,
    });

    try {
      await axios.put(
        "http://localhost:9090/api/cart/update-quantity",
        {
          productId: product._id,
          variantId: variant._id,
          sizeVariantId: sizeVariant._id,
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const cartResponse = await axios.get(
        "http://localhost:9090/api/cart/get-cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(setCartLength(cartResponse.data.cart.items.length));
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handleOpenAddAddressModal = () => {
    setIsAddAddressModalOpen(true);
  };

  const handleCloseAddAddressModal = () => {
    setIsAddAddressModalOpen(false);
  };

  const handleAddressAdded = (newAddress) => {
    setAddresses((prevAddresses) => [...prevAddresses, newAddress]);
  };

  const handleEditAddress = (address) => {
    return (e) => {
      e.stopPropagation();
      setSelectedEditAddress(address);
      setIsEditAddressModalOpen(true);
    };
  };

  const handleAddressUpdate = (updatedAddress) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((address) =>
        address._id === updatedAddress._id ? updatedAddress : address
      )
    );
  };

  const handleDeleteAddressClick = (e, addressId) => {
    e.stopPropagation();
    setSelectedAddressToDelete(addressId);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedAddressToDelete(null);
  };

  const navigateToHome = () => {
    router.push("/");
  };

  const handleDeleteAddress = async () => {
    const token = localStorage.getItem("usertoken");

    try {
      await axios.delete(
        `http://localhost:9090/api/address/delete-address/${selectedAddressToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAddresses((prevAddresses) =>
        prevAddresses.filter(
          (address) => address._id !== selectedAddressToDelete
        )
      );

      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleCheckout = async () => {
    console.log("Clicked");

    if (!selectedAddress) {
      setSnackbarMessage("Please select a delivery address");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    const shippingCost = cart.totalPrice > 1000 ? 0 : 40;
    const finalTotal = cart.totalPrice - cart.discountAmount + shippingCost;
    const checkoutData = {
      cartId: cart._id,
      cartItems: cart.items,
      totalPrice: cart.totalPrice,
      finalTotal: finalTotal,
      deliveryCharge: shippingCost,
      discountAmount: cart.discountAmount,
      selectedAddress: selectedAddress,
    };

    router.push({
      pathname: "/checkout/checkout",
      query: { data: JSON.stringify(checkoutData) },
    });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Header />

      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Cart
        </Typography>
        {quantityError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {quantityError}
          </Alert>
        )}
      </Box>
      {!cart || cart.items.length === 0 ? (
        <>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Looks like you haven't added anything to your cart yet
          </Typography>
          <Button
            startIcon={<ChevronLeftIcon />}
            sx={{
              backgroundColor: "#333",
              color: "#fff",
              margin: "10px 0px",
              "&:hover": {
                backgroundColor: "#555",
              },
              textTransform: "none",
              padding: "6px 20px",
            }}
            onClick={navigateToHome}
          >
            Continue Shopping
          </Button>
        </>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={9}>
            <Card>
              <CardContent>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>
                        Quantity
                        <Typography
                          variant="caption"
                          display="block"
                          color="textSecondary"
                        >
                          Max 4 items per product
                        </Typography>
                      </TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item>
                              <img
                                src={item.variant.mainImage}
                                alt={item.product.name}
                                style={{
                                  width: 60,
                                  height: 60,
                                  objectFit: "contain",
                                }}
                              />
                            </Grid>
                            <Grid item>
                              <Typography
                                variant="body1"
                                sx={{
                                  height: "20px",
                                  width: "170px",
                                  overflowY: "hidden",
                                }}
                              >
                                {item.product.name}...
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Size: {item.sizeVariant.size}, Color:{" "}
                                {item.variant.color}
                              </Typography>
                            </Grid>
                          </Grid>
                        </TableCell>
                        <TableCell>
                          <FormControl
                            variant="outlined"
                            sx={{ width: "100px" }}
                            size="small"
                          >
                            <Select
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(item, e.target.value)
                              }
                              error={item.quantity > 4}
                            >
                              {[1, 2, 3, 4].map((num) => (
                                <MenuItem key={num} value={num}>
                                  {num}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1">{`₹${
                            item.price * item.quantity
                          }`}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {`₹${item.price} each`}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            color="error"
                            onClick={() => handleOpenModal(item)}
                          >
                            <IconButton
                              color="error"
                              onClick={() => handleOpenModal(item)}
                              aria-label="delete"
                            >
                              <DeleteIcon />
                            </IconButton>
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardActions
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  startIcon={<ChevronLeftIcon />}
                  onClick={navigateToHome}
                  sx={{
                    backgroundColor: "#333",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#555",
                    },
                    textTransform: "none",
                    padding: "6px 20px",
                  }}
                >
                  Continue Shopping
                </Button>

                <Button
                  endIcon={<ChevronRightIcon />}
                  color="primary"
                  variant="outlined"
                  sx={{
                    color: "#333",
                    borderColor: "#333",
                    textTransform: "none",
                    padding: "6px 20px",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      borderColor: "#333",
                    },
                  }}
                  onClick={handleCheckout}
                >
                  Checkout Cart
                </Button>
              </CardActions>
            </Card>

            <Box mt={3}>
              <Paper elevation={1}>
                <Box p={2}>
                  <Typography
                    variant="body1"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <LocalShippingIcon
                      color="success"
                      sx={{ marginRight: "10px" }}
                    />{" "}
                    Free Delivery within 1-2 weeks on purchases above ₹1000!
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Have coupon?
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      placeholder="Coupon code"
                    />
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="primary">
                      Apply
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box mt={3}>
              <Card>
                <CardContent>
                  <List>
                    <ListItem>
                      <ListItemText primary="Total price:" />
                      <Typography variant="body1">{`₹ ${cart.totalPrice}`}</Typography>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Discount:" />
                      <Typography variant="body1">{`₹ ${cart.discountAmount}`}</Typography>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Shiping:" />
                      {cart.totalPrice > 1000 ? (
                        <Typography variant="body1"> Free shiping</Typography>
                      ) : (
                        <Typography variant="body1">₹ 40</Typography>
                      )}
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Total:" />
                      <Typography variant="h6">{`₹ ${
                        cart.totalPrice -
                        cart.discountAmount +
                        (cart.totalPrice > 1000 ? 0 : 40)
                      }`}</Typography>
                    </ListItem>
                  </List>
                  <Box textAlign="center" mt={2}>
                    <img
                      src="https://t3.ftcdn.net/jpg/09/21/55/16/240_F_921551609_o84jc48ToVS69IZesWxn4F30svtbpepf.jpg"
                      alt="payments"
                      height="60"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "10px 0px",
              }}
            >
              <Button
                variant="outlined"
                startIcon={<LocationOnIcon />}
                sx={{
                  color: "gray",
                  borderColor: "black",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderColor: "black",
                    color: "black",
                  },
                  padding: "8px 16px",
                  borderRadius: "8px",
                }}
                onClick={handleOpenAddAddressModal}
              >
                + Addresses
              </Button>
            </Grid>
          </Grid>
        </Grid>
      )}
      {addresses.length > 0 ? (
        <>
          <Divider />
          <Typography variant="h6" my={2}>
            Choose Address
          </Typography>
          <Grid container spacing={3}>
            {addresses.map((address) => (
              <Grid item xs={12} sm={6} md={4} key={address._id}>
                <Card
                  variant="outlined"
                  sx={{
                    border:
                      selectedAddress && selectedAddress._id === address._id
                        ? "1px solid orange"
                        : "1px solid #ddd",
                    cursor: "pointer",
                    transition: "transform 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                  onClick={() => handleAddressSelect(address)}
                >
                  <CardContent>
                    <Grid
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="h6">{address.fullName}</Typography>
                      <Grid>
                        <EditButton
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={handleEditAddress(address)}
                          disableElevation
                        >
                          Edit Address
                        </EditButton>
                        <Tooltip title="Delete Address" arrow>
                          <IconButton
                            onClick={(e) =>
                              handleDeleteAddressClick(e, address._id)
                            }
                            sx={{ color: "brown", marginLeft: "5px" }}
                          >
                            <DeleteForeverRounded />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                    <Typography variant="h6" color="textSecondary">
                      Type: {address.addressType}
                    </Typography>
                    <Divider sx={{ margin: "10px 0px" }} />
                    <Typography variant="body2" color="textSecondary">
                      {address.address}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {address.locality}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {address.city}, {address.state}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pincode: {address.pincode}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Phone: {address.mobileNumber}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Alternate Phone: {address.alternatePhone || ""}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Typography>No Address Created</Typography>
      )}
      <Divider />
      <Box my={4}>
        <Typography variant="h6" gutterBottom>
          Payment and Refund Policy
        </Typography>
        <Typography variant="body1" paragraph>
          At TREND TROVE, we strive to provide a smooth and secure shopping
          experience for all our customers. Please read the following payment
          and refund policy carefully before making a purchase on our site.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Payment Policy</strong>
        </Typography>

        <Typography variant="body1" paragraph>
          1. <strong>Accepted Payment Methods:</strong> We accept payments via
          major credit and debit cards, including Visa, MasterCard, American
          Express, and Discover. PayPal, Apple Pay, and Google Pay are also
          available for your convenience. For local customers, we may accept COD
          (Cash on Delivery) as a payment option, depending on your location.
        </Typography>

        <Typography variant="body1" paragraph>
          2. <strong>Payment Security:</strong> All transactions are processed
          securely through an encrypted payment gateway. Your payment
          information is never stored on our servers. We utilize SSL encryption
          technology to ensure the confidentiality and security of your payment
          details.
        </Typography>

        <Typography variant="body1" paragraph>
          3. <strong>Order Confirmation:</strong> Once your payment is
          processed, you will receive an order confirmation email with your
          purchase details and order number. If the payment fails for any
          reason, your order will not be processed. Please check with your
          payment provider or try an alternative payment method.
        </Typography>

        <Typography variant="body1" paragraph>
          4. <strong>Currency:</strong> All prices displayed on our website are
          in [Your Currency]. If you are shopping from outside [Your Country],
          please note that currency conversion may apply based on your payment
          provider's exchange rates.
        </Typography>

        <Typography variant="body1" paragraph>
          5. <strong>Fraud Prevention:</strong> To protect both our customers
          and ourselves from fraudulent transactions, we reserve the right to
          request additional information or verification for large or suspicious
          orders. Failure to provide requested details may result in order
          cancellation.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Refund and Return Policy</strong>
        </Typography>

        <Typography variant="body1" paragraph>
          1. <strong>Returns:</strong> We accept returns on unworn, unwashed,
          and unused items within 30 days from the date of purchase. Items must
          be returned in their original condition, including all tags and
          packaging. Items that are damaged or altered cannot be accepted for
          returns. To initiate a return, please contact our customer support
          team at [Customer Support Email] to receive return instructions and
          authorization. Return shipping costs are the responsibility of the
          customer unless the return is due to a mistake on our part (such as a
          defective product or incorrect item).
        </Typography>

        <Typography variant="body1" paragraph>
          2. <strong>Refunds:</strong> Once we receive your returned item(s) and
          verify the condition, your refund will be processed. Refunds will be
          credited back to the original payment method used for the purchase.
          Please allow up to 7-10 business days for your refund to be reflected
          in your account, depending on your payment provider. If your order was
          paid via COD, we will issue a refund to the account details you
          provide during the return process.
        </Typography>

        <Typography variant="body1" paragraph>
          3. <strong>Exchanges:</strong> We currently do not offer direct
          exchanges. However, you may return your item for a refund and place a
          new order for the desired item. Please follow our return process and
          then place a new order for the correct size or style.
        </Typography>

        <Typography variant="body1" paragraph>
          4. <strong>Defective or Incorrect Items:</strong> If you receive a
          defective or incorrect item, please contact our customer support team
          immediately. We will provide you with a prepaid return label for the
          return and issue a full refund or replacement, as per your preference.
        </Typography>
      </Box>

      <Box py={3} borderTop={1} borderColor="divider">
        <Footer />
      </Box>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        PaperProps={{
          sx: {
            backgroundColor: "#212121", // dark background
            color: "white", // white text for contrast
          },
        }}
      >
        <DialogTitle sx={{ color: "white" }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "white" }}>
            Are you sure you want to delete this address?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteModal}
            color="primary"
            variant="outlined"
            sx={{ color: "white" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAddress}
            color="secondary"
            variant="contained"
            sx={{ backgroundColor: "#FF3D00", color: "white" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this product from your cart?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteProduct} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add the AddAddressModal component */}
      <AddAddressModal
        open={isAddAddressModalOpen}
        onClose={handleCloseAddAddressModal}
        onAddressAdded={handleAddressAdded}
      />

      {/* Edit address modal */}
      <EditAddressModal
        open={isEditAddressModalOpen}
        onClose={() => {
          setIsEditAddressModalOpen(false);
          setSelectedEditAddress(null);
        }}
        address={selectedEditAddress}
        onAddressUpdated={handleAddressUpdate}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Cart;
