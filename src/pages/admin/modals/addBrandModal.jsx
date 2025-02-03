import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

const AddBrandModal = ({ open, handleClose, addBrandToList}) => {
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "" });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBrandImage(file);
    }
  };

  const handleRemoveImage = () => {
    setBrandImage(null);
  };

  const handleSubmit = async () => {
    if (brandName.trim() === "") {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);

    const formData = new FormData();
    formData.append("name", brandName);
    if (brandImage) {
      formData.append("image", brandImage);
    }

    try {
      const response = await axios.post(
        "http://localhost:9090/api/brands/add", // Replace with your API endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      addBrandToList(response.data.brand);

      setSnackbar({
        open: true,
        message: response.data.message || "Brand added successfully!",
        type: "success",
      });
      setBrandName("");
      setBrandImage(null); // Clear image after successful submission
      handleClose(); // Close the modal
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to add brand. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", type: "" });
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2" mb={2}>
            Add New Brand
          </Typography>
          <TextField
            fullWidth
            label="Brand Name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            error={error}
            helperText={error ? "Brand name is required" : ""}
            required
            disabled={loading}
          />
          <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<AddPhotoAlternateIcon />}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            <Typography>
              {brandImage ? brandImage.name : "No image selected"}
            </Typography>
          </Box>
          {brandImage && (
            <Box sx={{ mt: 2, position: "relative", display: "inline-block" }}>
              <img
                src={URL.createObjectURL(brandImage)}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px" }}
              />
              <IconButton
                onClick={handleRemoveImage}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "rgba(255, 255, 255, 0.8)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              bgcolor: "orange",
              "&:hover": { bgcolor: "darkorange" },
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Adding Brand..." : "Add Brand"}
          </Button>
        </Box>
      </Modal>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.type}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddBrandModal;
