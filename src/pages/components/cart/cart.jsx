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

  useEffect(() => {
    const token = localStorage.getItem("usertoken");

    const fetchAddresses = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9090/api/address/get-address", // API to fetch addresses
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAddresses(response.data.addresses); // Set fetched addresses in state
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    fetchAddresses();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("usertoken");
    console.log("TOKENNNNNNNNNNNN", token);

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
        console.error("Error fetching cart data:", error);
        setCart(null);
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

      setCart(response.data.cart);
      handleCloseModal();
    } catch (error) {
      console.error("Error removing product from cart:", error);
    }
  };

  const handleQuantityChange = async (item, newQuantity) => {
    setQuantityError("");

    // Validate quantity
    if (newQuantity > 4) {
      setQuantityError("Maximum quantity allowed is 4 items per product");
      return;
    }

    if (newQuantity < 1) {
      setQuantityError("Minimum quantity allowed is 1 item");
      return;
    }

    const token = localStorage.getItem("usertoken");
    const { product, variant, sizeVariant } = item;

    const updatedCart = { ...cart };
    const itemIndex = updatedCart.items.findIndex(
      (i) =>
        i.product._id === product._id &&
        i.variant._id === variant._id &&
        i.sizeVariant._id === sizeVariant._id
    );

    if (itemIndex > -1) {
      updatedCart.items[itemIndex].quantity = newQuantity;
    }

    setCart(updatedCart);

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
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address); // Set the selected address
  };

  // Address
  const handleOpenAddAddressModal = () => {
    setIsAddAddressModalOpen(true);
  };

  const handleCloseAddAddressModal = () => {
    setIsAddAddressModalOpen(false);
  };

  const handleAddressAdded = (newAddress) => {
    setAddresses((prevAddresses) => [...prevAddresses, newAddress]);
  };

  // Edit address
  const handleEditAddress = (address) => {
    return (e) => {
      e.stopPropagation();
      setSelectedEditAddress(address);
      setIsEditAddressModalOpen(true);
    };
  };

  // const handleDeleteAddress = (addresId) => {
  //   return (e) => {
  //     e.stopPropagation();
  //   };
  // };

  const handleAddressUpdate = (updatedAddress) => {
    setAddresses((prevAddresses) =>
      prevAddresses.map((address) =>
        address._id === updatedAddress._id ? updatedAddress : address
      )
    );
  };

  // Delete address:

  const handleDeleteAddressClick = (e, addressId) => {
    e.stopPropagation();
    setSelectedAddressToDelete(addressId);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedAddressToDelete(null);
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

      // Update the addresses state by filtering out the deleted address
      setAddresses((prevAddresses) =>
        prevAddresses.filter(
          (address) => address._id !== selectedAddressToDelete
        )
      );

      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting address:", error);
      // You might want to show an error message to the user here
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!cart || cart.items.length === 0) {
    return <Typography>Your cart is empty.</Typography>;
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
                              style={{ width: 50, height: 50 }}
                            />
                          </Grid>
                          <Grid item>
                            <Typography variant="body1">
                              {item.product.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Size: {item.sizeVariant.size}, Color:{" "}
                              {item.variant.color}
                            </Typography>
                          </Grid>
                        </Grid>
                      </TableCell>
                      <TableCell>
                        <FormControl variant="outlined" size="small">
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
                        <Typography variant="body1">{`$${item.price}`}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {`$${item.price} each`}
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
              >
                Make Purchase
              </Button>
            </CardActions>
          </Card>

          <Box mt={3}>
            <Paper elevation={1}>
              <Box p={2}>
                <Typography variant="body1">
                  <LocalShippingIcon color="success" /> Free Delivery within 1-2
                  weeks
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
                    <Typography variant="body1">{`USD ${cart.totalPrice}`}</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Discount:" />
                    <Typography variant="body1">{`USD ${cart.discountAmount}`}</Typography>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText primary="Total:" />
                    <Typography variant="h6">{`USD ${
                      cart.totalPrice - cart.discountAmount
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
      {addresses.length > 0 ? (
        <>
          <Typography variant="h6">Choose Address</Typography>
          <Grid container spacing={3} my={2}>
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

      <Box my={4}>
        <Typography variant="h6" gutterBottom>
          Payment and refund policy
        </Typography>
        <Typography variant="body1" paragraph>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
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
    </Container>
  );
}

export default Cart;
