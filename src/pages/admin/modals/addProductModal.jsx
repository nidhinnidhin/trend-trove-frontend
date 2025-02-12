import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import AddVariantModal from "./addVariantModal";
import axiosInstance from "@/utils/adminAxiosInstance";

const AddProductModal = ({ open, onClose, onProductAdded }) => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpenVariantModal = () => {
    setShowVariantModal(true);
  };

  const handleCloseVariantModal = () => {
    setShowVariantModal(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchBrands();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:9090/api/categories");
      setCategories(response.data.categories);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching categories",
        severity: "error",
      });
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get("http://localhost:9090/api/brands");
      setBrands(response.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error fetching brands",
        severity: "error",
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      const productPayload = {
        name: data.productName,
        description: data.description,
        brand: brands.find((brand) => brand.name === data.brand)?._id,
        category: categories.find((category) => category.name === data.category)
          ?._id,
        gender: data.gender,
        pattern: data.pattern,
        material: data.material,
      };

      const response = await axiosInstance.post(
        "/products/add",
        productPayload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: "Product added successfully!",
          severity: "success",
        });

        // Call the callback to update parent component
        if (onProductAdded) {
          onProductAdded(response.data.product);
        }

        reset(); // Reset form
        onClose(); // Close modal
        setShowVariantModal(true);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to add product. Please try again.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            width: "80%",
            margin: "auto",
            backgroundColor: "white",
            padding: 4,
            borderRadius: 2,
            marginTop: "5%",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Box sx={{ fontSize: "24px", fontWeight: "bold", marginBottom: 2 }}>
            Add New Product
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              {/* Product Name */}
              <Grid item xs={12}>
                <Controller
                  name="productName"
                  control={control}
                  rules={{ required: "Product Name is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Product Name"
                      fullWidth
                      error={!!errors.productName}
                      helperText={errors.productName?.message}
                      placeholder="Enter product name"
                    />
                  )}
                />
              </Grid>

              {/* Product Description */}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      placeholder="Enter product description"
                    />
                  )}
                />
              </Grid>

              {/* Product Brand */}
              <Grid item xs={6}>
                <Controller
                  name="brand"
                  control={control}
                  rules={{ required: "Brand is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.brand}>
                      <InputLabel>Brand</InputLabel>
                      <Select {...field} label="Brand">
                        {brands.map((brand) => (
                          <MenuItem key={brand._id} value={brand.name}>
                            {brand.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.brand && <p>{errors.brand.message}</p>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Product Category */}
              <Grid item xs={6}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Category</InputLabel>
                      <Select {...field} label="Category">
                        {categories.map((category) => (
                          <MenuItem key={category._id} value={category.name}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.category && <p>{errors.category.message}</p>}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Product Gender */}
              <Grid item xs={6}>
                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: "Gender is required" }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.gender}>
                      <InputLabel>Gender</InputLabel>
                      <Select {...field} label="Gender">
                        <MenuItem value="Men">Men</MenuItem>
                        <MenuItem value="Women">Women</MenuItem>
                        <MenuItem value="Unisex">Unisex</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Product Pattern */}
              <Grid item xs={6}>
                <Controller
                  name="pattern"
                  control={control}
                  rules={{ required: "Pattern is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Pattern"
                      fullWidth
                      error={!!errors.pattern}
                      helperText={errors.pattern?.message}
                      placeholder="Enter product pattern"
                    />
                  )}
                />
              </Grid>

              {/* Product Material */}
              <Grid item xs={6}>
                <Controller
                  name="material"
                  control={control}
                  rules={{ required: "Material is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Material"
                      fullWidth
                      error={!!errors.material}
                      helperText={errors.material?.message}
                      placeholder="Enter product material"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  type="submit"
                  fullWidth
                  sx={{
                    backgroundColor: "orange",
                    "&:hover": { backgroundColor: "darkorange" },
                  }}
                >
                  Add Product
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddProductModal;
