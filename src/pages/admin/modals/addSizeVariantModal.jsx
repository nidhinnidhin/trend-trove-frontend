import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import axiosInstance from "@/utils/adminAxiosInstance";

const AddSizeVariantModal = ({ open, onClose, variantId }) => {
  console.log("variantIddddd", variantId);

  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [stockCount, setStockCount] = useState("");
  const [description, setDescription] = useState("");

  // Handle form submission
  const handleAddSizeVariant = () => {
    const sizeVariantData = {
      variantId,
      size,
      price,
      discountPrice,
      inStock,
      stockCount,
      description,
    };

    console.log("Size Variant Data:", sizeVariantData);

    axiosInstance
      .post("/sizes/size/add", sizeVariantData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("Server response:", response.data);
        onClose(); 
      })
      .catch((error) => {
        console.error("Error:", error.response?.data || error.message);
      });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: "50%",
          margin: "auto",
          backgroundColor: "white",
          padding: 4,
          borderRadius: 2,
          marginTop: "5%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Add Size Variant
        </Typography>

        <Grid container spacing={3}>
          {/* Variant ID */}
          <Grid item xs={12}>
            <TextField
              label="Variant ID"
              fullWidth
              value={variantId}
              disabled // Make variantId read-only
            />
          </Grid>

          {/* Size */}
          <Grid item xs={12}>
            <TextField
              label="Size"
              fullWidth
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </Grid>

          {/* Price */}
          <Grid item xs={12}>
            <TextField
              label="Price"
              type="number"
              fullWidth
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Grid>

          {/* Discount Price */}
          <Grid item xs={12}>
            <TextField
              label="Discount Price"
              type="number"
              fullWidth
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
            />
          </Grid>

          {/* In Stock */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                />
              }
              label="In Stock"
            />
          </Grid>

          {/* Stock Count */}
          <Grid item xs={12}>
            <TextField
              label="Stock Count"
              type="number"
              fullWidth
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value)}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>

          {/* Add Size Variant Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddSizeVariant}
              sx={{
                backgroundColor: "#FF5722", // Orange color
                color: "white",
                "&:hover": { backgroundColor: "#E64A19" }, // Dark orange
                padding: "8px 16px",
                textDecoration: "none",
              }}
            >
              Add Size Variant
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default AddSizeVariantModal;
