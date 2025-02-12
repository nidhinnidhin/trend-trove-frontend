import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import Image from "next/image";
import { Edit } from "@mui/icons-material";
import EditVariantModal from "./editVariantModel";
import axiosInstance from "@/utils/adminAxiosInstance";

const EditProductModal = ({
  open,
  handleClose,
  product,
  handleProductUpdated,
}) => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("");
  const [material, setMaterial] = useState("");
  const [pattern, setPattern] = useState("");
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openVariantModal, setOpenVariantModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (product) {
      setProductName(product.name || "");
      setDescription(product.description || "");
      setGender(product.gender || "");
      setMaterial(product.material || "");
      setPattern(product.pattern || "");
      fetchVariants(product._id);
    }
  }, [product]);

  const fetchVariants = async (productId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:9090/api/variants/variant/get/${productId}`
      );
      setVariants(response.data.variants || []);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching variants.",
        severity: "error",
      });
      console.error("Error fetching variants:", error);
    }
    setIsLoading(false);
  };

  const handleVariantEditClick = (variant) => {
    setSelectedVariant(variant);
    setOpenVariantModal(true);
  };

  const handleUpdateProduct = async () => {
    const updatedProductData = {
      name: productName,
      description: description,
      gender: gender,
      material: material,
      pattern: pattern,
    };

    try {
      const response = await axiosInstance.put(
        `/products/update/${product._id}`,
        updatedProductData
      );

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: "Product updated successfully!",
          severity: "success",
        });
        handleProductUpdated(response.data.product);
        handleClose();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error updating product.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="edit-product-modal"
      >
        <Box
          sx={{
            width: "60%",
            maxHeight: "90vh",
            overflowY: "auto",
            backgroundColor: "white",
            margin: "3% auto",
            padding: "2rem",
            borderRadius: "8px",
            boxShadow: 24,
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Edit Product
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              fullWidth
              label="Product Name"
              variant="outlined"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Product Description"
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Gender"
              variant="outlined"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Material"
              variant="outlined"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Pattern"
              variant="outlined"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              required
            />
          </Box>

          <FormControl fullWidth sx={{ marginTop: 3 }}>
            <InputLabel>Select Variant</InputLabel>
            <Select
              value={selectedVariant ? selectedVariant._id : ""}
              onChange={(e) => {
                const variant = variants.find((v) => v._id === e.target.value);
                setSelectedVariant(variant);
              }}
              label="Select Variant"
            >
              {isLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={24} />
                </MenuItem>
              ) : (
                variants.map((variant) => (
                  <MenuItem key={variant._id} value={variant._id}>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Grid item>
                        <Image
                          src={variant.colorImage}
                          alt="Color"
                          width={40}
                          height={40}
                        />
                      </Grid>
                      <Grid item xs>
                        <Typography variant="body1">{variant.color}</Typography>
                      </Grid>
                      <Grid item>
                        <Image
                          src={variant.mainImage}
                          alt="Main"
                          width={50}
                          height={50}
                        />
                      </Grid>
                      <Grid item>
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: "orange" }}
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleVariantEditClick(variant)}
                        >
                          Edit
                        </Button>
                      </Grid>
                    </Grid>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Box sx={{ marginTop: 3 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "orange",
                width: "100%",
                padding: "12px 0",
                fontSize: "16px",
              }}
              onClick={handleUpdateProduct}
            >
              Update Product
            </Button>
          </Box>
        </Box>
      </Modal>

      <EditVariantModal
        open={openVariantModal}
        onClose={() => setOpenVariantModal(false)}
        variant={selectedVariant}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditProductModal;
