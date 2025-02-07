import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete"; // For the delete icon
import axios from "axios"; // Import axios for making API requests
import AddSizeVariantModal from "./addSizeVariantModal";

const AddVariantModal = ({ open, onClose, productId }) => {
  const [color, setColor] = useState("");
  const [colorImage, setColorImage] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [subImages, setSubImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [sizeVariantModalOpen, setSizeVariantModalOpen] = useState(false);
  const [variantId, setVariantId] = useState("");

  const handleImageChange = (event, setImage, isMain = false) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);

      if (isMain) {
        setMainImage(file);
      } else {
        setSubImages((prev) => [...prev, file]);
        setPreviewImages((prev) => [...prev, previewUrl]);
      }
    }
  };

  const handleColorImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setColorImage(file);
    }
  };

  const handleDeleteSubImage = (index) => {
    const updatedSubImages = [...subImages];
    const updatedPreviewImages = [...previewImages];
    updatedSubImages.splice(index, 1);
    updatedPreviewImages.splice(index, 1);
    setSubImages(updatedSubImages);
    setPreviewImages(updatedPreviewImages);
  };

  // Function to handle the Add Variant API request
  const handleAddVariant = async () => {
    const formData = new FormData();
    formData.append("color", color);
    formData.append("colorImage", colorImage);
    formData.append("mainImage", mainImage);
    formData.append("productId", productId);  
    
    subImages.forEach((img) => formData.append("subImages", img));
  
    try {
      const response = await axios.post(
        'http://localhost:9090/api/variants/color/add',  // Use the same URL as before (no need to pass productId in the URL)
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      // Handle success response
      console.log("Variant added successfully:", response.data);
      onClose(); // Close modal after adding variant
    } catch (error) {
      console.error("Error adding variant:", error.response ? error.response.data : error.message);
    }
  };
  
  
  

  const openSizeVariantModal = () => {
    const newVariantId = `variant-${Date.now()}`;
    setVariantId(newVariantId);
    setSizeVariantModalOpen(true);
  };

  const closeSizeVariantModal = () => {
    setSizeVariantModalOpen(false);
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            width: "60%",
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
            Add Variant
          </Typography>

          <Grid container spacing={3}>
            {/* Color Field */}
            <Grid item xs={12}>
              <TextField
                label="Color"
                fullWidth
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </Grid>

            {/* Color Image Upload */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  width: "100%",
                  textAlign: "center",
                }}
              >
                Upload Color Image
                <input
                  type="file"
                  accept="image/*"
                  name="colorImage"
                  onChange={handleColorImageChange}
                  hidden
                />
              </Button>
              {colorImage && (
                <img
                  src={URL.createObjectURL(colorImage)}
                  alt="Color"
                  width="100%"
                  height="150px"
                  style={{
                    marginTop: 10,
                    objectFit: "cover",
                    borderRadius: 8,
                    objectFit: "contain",
                  }}
                />
              )}
            </Grid>

            {/* Main Image Upload */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  width: "100%",
                  textAlign: "center",
                }}
              >
                Upload Main Image
                <input
                  type="file"
                  accept="image/*"
                  name="mainImage"
                  onChange={(e) => handleImageChange(e, setMainImage, true)}
                  hidden
                />
              </Button>
              {mainImage && (
                <img
                  src={URL.createObjectURL(mainImage)}
                  alt="Main"
                  width="100%"
                  height="150px"
                  style={{
                    marginTop: 10,
                    objectFit: "cover",
                    borderRadius: 8,
                    objectFit: "contain",
                  }}
                />
              )}
            </Grid>

            {/* Sub Images Upload */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  width: "100%",
                  textAlign: "center",
                }}
              >
                Upload Sub Images
                <input
                  type="file"
                  accept="image/*"
                  name="subImages"
                  multiple
                  onChange={(e) => handleImageChange(e, setSubImages)}
                  hidden
                />
              </Button>

              {/* Preview Images Grid */}
              <Grid container spacing={2} sx={{ marginTop: 2 }}>
                {previewImages.map((preview, index) => (
                  <Grid item xs={4} key={index}>
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100px",
                        objectFit: "contain",
                      }}
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        width="100%"
                        height="100px"
                        style={{
                          marginBottom: 10,
                          borderRadius: 8,
                          objectFit: "contain",
                        }}
                      />
                      <IconButton
                        onClick={() => handleDeleteSubImage(index)}
                        sx={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          backgroundColor: "white",
                          borderRadius: "50%",
                          padding: "5px",
                          "&:hover": {
                            backgroundColor: "#FF5722",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Add Size Button */}
            {/* <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                onClick={openSizeVariantModal}
                sx={{
                  backgroundColor: "#FF5722",
                  color: "white",
                  "&:hover": { backgroundColor: "#E64A19" },
                  padding: "8px 16px",
                }}
              >
                Add Sizes
              </Button>
            </Grid> */}

            {/* Add Variant Button */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleAddVariant}
                sx={{
                  backgroundColor: "#FF5722",
                  color: "white",
                  "&:hover": { backgroundColor: "#E64A19" },
                  padding: "8px 16px",
                }}
              >
                Add Variant
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      {/* Add Size Variant Modal */}
      <AddSizeVariantModal
        open={sizeVariantModalOpen}
        onClose={closeSizeVariantModal}
        variantId={variantId}
      />
    </>
  );
};

export default AddVariantModal;
