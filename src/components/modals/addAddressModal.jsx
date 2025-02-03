import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const AddAddressModal = ({ open, onClose, onAddressAdded }) => {
  const [addressData, setAddressData] = useState({
    fullName: "",
    mobileNumber: "",
    pincode: "",
    locality: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    alternatePhone: "",
    addressType: "Home",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const INDIAN_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!addressData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }

    const mobileNumberRegex = /^\d{10}$/;
    if (!addressData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile Number is required";
    } else if (!mobileNumberRegex.test(addressData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile Number must be 10 digits";
    }

    if (!addressData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    }

    if (!addressData.locality.trim()) {
      newErrors.locality = "Locality is required";
    }

    const pincodeRegex = /^\d{6}$/;
    if (!addressData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!pincodeRegex.test(addressData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    if (!addressData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!addressData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!addressData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (addressData.alternatePhone.trim()) {
      if (!mobileNumberRegex.test(addressData.alternatePhone)) {
        newErrors.alternatePhone = "Alternate Phone must be 10 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("usertoken");
      const response = await axios.post(
        "http://localhost:9090/api/address/add-address",
        addressData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSnackbar({
        open: true,
        message: response.data.message || "Address added successfully",
        severity: "success",
      });

      onAddressAdded(response.data.address);

      setAddressData({
        fullName: "",
        mobileNumber: "",
        pincode: "",
        locality: "",
        address: "",
        city: "",
        state: "",
        landmark: "",
        alternatePhone: "",
        addressType: "Home",
      });
      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error adding address",
        severity: "error",
      });
      console.error("Error adding address:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={addressData.fullName}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.fullName}
                helperText={errors.fullName}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobileNumber"
                value={addressData.mobileNumber}
                onChange={handleChange}
                type="number"
                variant="outlined"
                error={!!errors.mobileNumber}
                helperText={errors.mobileNumber}
                required
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={addressData.pincode}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.pincode}
                helperText={errors.pincode}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Locality"
                name="locality"
                value={addressData.locality}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.locality}
                helperText={errors.locality}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={addressData.address}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={2}
                error={!!errors.address}
                helperText={errors.address}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={addressData.city}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.city}
                helperText={errors.city}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                variant="outlined"
                required
                error={!!errors.state}
              >
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={addressData.state}
                  onChange={handleChange}
                  label="State"
                >
                  {INDIAN_STATES.map((stateName) => (
                    <MenuItem key={stateName} value={stateName}>
                      {stateName}
                    </MenuItem>
                  ))}
                </Select>
                {errors.state && (
                  <FormHelperText error>{errors.state}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Landmark (Optional)"
                name="landmark"
                value={addressData.landmark}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Alternate Phone (Optional)"
                name="alternatePhone"
                value={addressData.alternatePhone}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.alternatePhone}
                helperText={errors.alternatePhone}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Address Type</InputLabel>
                <Select
                  name="addressType"
                  value={addressData.addressType}
                  onChange={handleChange}
                  label="Address Type"
                >
                  <MenuItem value="Home">Home</MenuItem>
                  <MenuItem value="Work">Work</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Add Address"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddAddressModal;
