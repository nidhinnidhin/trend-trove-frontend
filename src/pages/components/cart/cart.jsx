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
} from "@mui/icons-material";
import Header from "../header";
import Footer from "../footer";
import axios from "axios";
import { Delete as DeleteIcon } from "@mui/icons-material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddAddressModal from "@/components/modals/addAddressModal";

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [quantityError, setQuantityError] = useState("");
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);

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

  // Address
  const handleOpenAddAddressModal = () => {
    setIsAddAddressModalOpen(true);
  };

  const handleCloseAddAddressModal = () => {
    setIsAddAddressModalOpen(false);
  };

  const handleAddressAdded = (newAddress) => {
    setAddresses(prevAddresses => [...prevAddresses, newAddress]);
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
            <CardActions>
              <Button startIcon={<ChevronLeftIcon />}>Continue Shopping</Button>
              <Button
                endIcon={<ChevronRightIcon />}
                color="primary"
                variant="contained"
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
          <Grid sx={{display:"flex", alignItems:"center", justifyContent:"center", margin:"10px 0px"}}>

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
    </Container>
  );
}

export default Cart;
