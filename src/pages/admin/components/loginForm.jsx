import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useRouter } from "next/router";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    // Basic form validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const userData = {
      email: email,
      password: password,
    };

    setLoading(true); // Show spinner while loading

    try {
      // Replace with your actual API endpoint
      const response = await axios.post(
        "http://localhost:9090/api/admin/adminlogin",
        userData
      );
      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      router.push("/admin/dashboard/dashboard");
      // Save token or user data to localStorage/sessionStorage here
      localStorage.setItem("admintoken", response.data.token);
    } catch (err) {
      setSnackbarMessage(err.response?.data?.message);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false); // Hide spinner after API call finishes
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "86vh",
        padding: 2,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{
          marginBottom: 4,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Admin Login
      </Typography>

      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: 400,
        }}
        onSubmit={handleSubmit}
      >
        <TextField
          label="Email"
          type="email"
          required
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{
            "& .MuiInputLabel-root": {
              color: "gray",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "gray",
              },
              "&:hover fieldset": {
                borderColor: "orange",
              },
              "&.Mui-focused fieldset": {
                borderColor: "orange",
              },
            },
            "& .MuiInputLabel-root": {
              color: "gray",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#FFA500", // Orange placeholder on focus
            },
          }}
        />

        <TextField
          label="Password"
          required
          fullWidth
          margin="normal"
          type={showPassword ? "text" : "password"} // Toggle between password and text
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: password.length > 0 && ( // Conditionally render eye icon if password length > 0
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword} // Toggle password visibility
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiInputLabel-root": {
              color: "gray",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "gray",
              },
              "&:hover fieldset": {
                borderColor: "orange",
              },
              "&.Mui-focused fieldset": {
                borderColor: "orange",
              },
            },
            "& .MuiInputLabel-root": {
              color: "gray",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#FFA500", // Orange placeholder on focus
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: "orange",
            color: "white",
            marginTop: 2,
            alignSelf: "center",
            width: "50%",
            "&:hover": {
              backgroundColor: "#ff8c00",
            },
          }}
          disabled={loading}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ marginRight: 1 }} /> Logging
              in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </Box>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginForm;
