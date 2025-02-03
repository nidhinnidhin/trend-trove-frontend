import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Box,
  IconButton,
  Snackbar,
  CircularProgress,
  Alert,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import axiosInstance from "@/utils/axiosInstance";

const ProfileModal = ({ open, handleClose, user, profileImage, onProfileUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false); // for spinner
  const [snackbarOpen, setSnackbarOpen] = useState(false); // for snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstname || "",
        lastName: user.lastname || "",
        userName: user.username || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setFormData({ ...formData, image: file });
    }
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false); 
  };

  const handleSave = async () => {
    setEditMode(false);
    setLoading(true); // Show spinner
    const form = new FormData();
    form.append("firstname", formData.firstName);
    form.append("lastname", formData.lastName);
    form.append("username", formData.userName);
    form.append("email", formData.email);
    if (formData.image) {
      form.append("image", formData.image);
    }

    try {
      const response = await axiosInstance.put(
        `users/editProfile/${user._id}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSnackbarMessage(response.data.message );
      setSnackbarSeverity("success");

      onProfileUpdate(response.data.user);
      setSnackbarOpen(true)
      handleClose(); 
    } catch (error) {
      setSnackbarMessage(response.data.message );
      setSnackbarSeverity("error");
      setSnackbarOpen(true)
    } finally {
      setLoading(false); 
    }
  };


  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {editMode ? (
        <DialogTitle>Edit Profile</DialogTitle>
      ) : (
        <DialogTitle>User Profile</DialogTitle>
      )}
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box position="relative">
            <Avatar
              src={selectedImage || profileImage || "/default-avatar.png"}
              alt="Profile"
              sx={{ width: 100, height: 100 }}
            />
            {editMode && (
              <IconButton
                color="primary"
                component="label"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: "white",
                }}
              >
                <PhotoCamera />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </IconButton>
            )}
          </Box>
          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            fullWidth
            disabled={!editMode}
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            fullWidth
            disabled={!editMode}
          />
          <TextField
            label="User Name"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            fullWidth
            disabled={!editMode}
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            disabled={!editMode}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        {editMode ? (
          <Button onClick={handleSave} color="primary" variant="contained">
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Save"
            )}
          </Button>
        ) : (
          <Button
            onClick={() => setEditMode(true)}
            color="secondary"
            variant="contained"
          >
            Edit
          </Button>
        )}
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ProfileModal;
