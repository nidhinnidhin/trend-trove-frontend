import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";
import { useDispatch } from "react-redux";
import { setWishlistLength } from "@/redux/features/wishlistSlice";

const Wishlist = () => {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("usertoken");
        if (!token) {
          window.location.href = "/authentication/loginSignup";
          return;
        }

        const response = await axiosInstance.get("/user/wishlist/get");

        if (response.data.Wishlist !== 0) {
          setItems(response.data.Wishlist);
          dispatch(setWishlistLength(response.data.Wishlist.length));
        }
      } catch (error) {
        console.error("Error fetching wishlist items:", error);
      }
    };

    fetchWishlist();
  }, [dispatch]);

  const handleRemoveItem = async () => {
    if (!selectedItem) return;

    try {
      await axiosInstance.delete("/user/wishlist/remove/wishlist", {
        data: {
          productId: selectedItem.product._id,
          variantId: selectedItem.variant._id,
          sizeVariantId: selectedItem.sizeVariant._id,
        },
      });

      setItems((prevItems) => {
        const newItems = prevItems.filter((i) => i._id !== selectedItem._id);
        dispatch(setWishlistLength(newItems.length));
        return newItems;
      });
      setOpenDialog(false);
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
    }
  };

  const handleOpenDialog = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  return (
    <div
      style={{
        padding: "100px",
        backgroundColor: "#F9F9F9",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {items.length !== 0 ? (
        <>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            style={{ color: "#333333", marginBottom: "30px" }}
          >
            Your Wishlist
          </Typography>
          <TableContainer
            component={Paper}
            style={{ overflowX: "auto", width: "90%" }}
          >
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: "#FF6F61" }}>
                  <TableCell style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                    Image
                  </TableCell>
                  <TableCell style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                    Product Name
                  </TableCell>
                  <TableCell style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                    Price
                  </TableCell>
                  <TableCell style={{ color: "#FFFFFF", fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell>
                        {item.variant.mainImage ? (
                          <img
                            src={item.variant.mainImage}
                            alt={item.product.name}
                            style={{
                              width: "70px",
                              height: "100px",
                              objectFit: "contain",
                              borderRadius: "5px",
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            style={{ color: "#777777" }}
                          >
                            No Image Available
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          style={{ color: "#333333" }}
                        >
                          {item.product.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body1"
                          style={{ color: "#777777" }}
                        >
                          {item.sizeVariant.price}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          startIcon={<ShoppingCartIcon />}
                          style={{
                            backgroundColor: "#FF6F61",
                            color: "#FFFFFF",
                            marginRight: "10px",
                          }}
                          onClick={() => handleMoveToCart(item)}
                        >
                          Move to Cart
                        </Button>
                        <IconButton
                          aria-label="delete"
                          style={{ color: "#FF6F61" }}
                          onClick={() => handleOpenDialog(item)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          style={{ color: "#333333", marginBottom: "30px" }}
        >
          Your Wishlist Is Empty
        </Typography>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this item from your wishlist?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleRemoveItem}
            color="secondary"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Wishlist;
