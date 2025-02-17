import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axiosInstance from "@/utils/adminAxiosInstance";

const AddOfferModal = ({ open, handleClose, handleOfferAdded }) => {
  const [offerName, setOfferName] = useState("");
  const [offerType, setOfferType] = useState("product");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedItems, setSelectedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
      fetchProducts();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:9090/api/categories");
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9090/api/products/get"
      );
      setProducts(response.data.products);
      console.log(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const validateFields = () => {
    const newErrors = {};
    if (!offerName.trim()) newErrors.offerName = "Offer name is required";
    if (!discountValue) newErrors.discountValue = "Discount % is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (selectedItems.length === 0)
      newErrors.selectedItems = "At least one item must be selected";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleItemSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const newOffer = {
      offerName,
      offerType,
      discountValue: parseFloat(discountValue),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      items: selectedItems,
    };

    setLoading(true);
    try {
      console.log("Sending Offer:", newOffer);

      const response = await axiosInstance.post("/offer/add", newOffer, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Call handleOfferAdded to update the offers list
      handleOfferAdded(response.data.offer); // Pass the new offer to parent component

      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });
      handleClose();
    } catch (error) {
      console.error("Error response:", error.response?.data || error.response); // Log the error response
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to add offer",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-offer-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 550,
            bgcolor: "#fff",
            color: "#000",
            boxShadow: 24,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              bgcolor: "#222",
              color: "#fff",
              p: 2,
              textAlign: "center",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Add New Offer
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <TextField
              label="Offer Name"
              variant="outlined"
              fullWidth
              value={offerName}
              onChange={(e) => setOfferName(e.target.value)}
              error={!!errors.offerName}
              helperText={errors.offerName}
              sx={{ bgcolor: "#fff", mb: 2 }}
            />

            <TextField
              select
              label="Offer Type"
              variant="outlined"
              fullWidth
              value={offerType}
              onChange={(e) => {
                setOfferType(e.target.value);
                setSelectedItems([]); // Reset selected items
              }}
              sx={{ bgcolor: "#fff", mb: 2 }}
            >
              <MenuItem value="product">Product</MenuItem>
              <MenuItem value="category">Category</MenuItem>
            </TextField>

            <TextField
              label="Discount %"
              type="number"
              variant="outlined"
              fullWidth
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              error={!!errors.discountValue}
              helperText={errors.discountValue}
              sx={{ bgcolor: "#fff", mb: 2 }}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    sx={{ bgcolor: "#fff", width: "100%" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    sx={{ bgcolor: "#fff", width: "100%" }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>

            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Select {offerType === "product" ? "Products" : "Categories"}
            </Typography>

            {errors.selectedItems && (
              <Typography color="error" variant="caption">
                {errors.selectedItems}
              </Typography>
            )}

            <FormControl fullWidth>
              <InputLabel>
                {offerType === "product"
                  ? "Select Products"
                  : "Select Categories"}
              </InputLabel>
              <Select
                multiple
                value={selectedItems}
                onChange={(e) => setSelectedItems(e.target.value)}
                renderValue={(selected) =>
                  selected
                    .map(
                      (id) =>
                        (offerType === "product"
                          ? products.find((p) => p._id === id)
                          : categories.find((c) => c._id === id)
                        )?.name
                    )
                    .join(", ")
                }
              >
                {(offerType === "product" ? products : categories).map(
                  (item) => (
                    <MenuItem key={item._id} value={item._id}>
                      <Checkbox checked={selectedItems.includes(item._id)} />
                      {item.name}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{ bgcolor: "#222", color: "#fff", p: 2, textAlign: "center" }}
          >
            <Button
              variant="contained"
              fullWidth
              sx={{ bgcolor: "#fff", color: "#222", fontWeight: "bold" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Save Offer"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default AddOfferModal;
