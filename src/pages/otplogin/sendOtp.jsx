import React, { useState } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/router"; // Import useRouter for navigation
import Header from "../components/header";
import Footer from "../components/footer";

const SendOtp = () => {
  const [email, setEmail] = useState(""); // Changed from mobileNumber to email
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const router = useRouter(); // Initialize router

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", type: "" });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Ensure the email is valid
    const trimmedEmail = email.trim();

    // Validate email format
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(trimmedEmail)) {
      setSnackbar({
        open: true,
        message: "Please enter a valid email address.",
        type: "error",
      });
      setIsFormSubmitted(true); // Trigger form validation
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:9090/api/otp/send-otp",
        {
          email: trimmedEmail, // Send email instead of phoneNumber
        }
      );

      setLoading(false);

      // Handle successful response
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: "OTP sent successfully!",
          type: "success",
        });
        // Navigate to the verify OTP page
        router.push("/otplogin/verifyOtp");
        localStorage.setItem("email", email); // Store email in localStorage
      }
    } catch (error) {
      setLoading(false);

      // Handle error response
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Failed to send OTP. Try again.",
        type: "error",
      });
    }
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          backgroundColor: "#f4f4f4",
        }}
      >
        <Box
          sx={{
            maxWidth: 400,
            padding: 4,
            border: "1px solid #ddd",
            borderRadius: 2,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h5" textAlign="center" gutterBottom>
            Send OTP
          </Typography>
          <form onSubmit={handleSendOtp} noValidate>
            <TextField
              label="Email Address"
              variant="outlined"
              type="email" // Use type="email" instead of number
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={
                isFormSubmitted &&
                !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
              }
              helperText={
                isFormSubmitted &&
                !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
                  ? "Please enter a valid email address."
                  : ""
              }
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#FFA500",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FFA500",
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                backgroundColor: "#FFA500",
                "&:hover": { backgroundColor: "#FF8C00" },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{ marginRight: 1, color: "white" }}
                  />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
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
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default SendOtp;
