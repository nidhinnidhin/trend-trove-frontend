import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Typography,
  Modal,
} from "@mui/material";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";

const OtpVerificationModal = ({ open, onClose, email }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [timer, setTimer] = useState(60);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    let interval;
    if (open) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            setTimerExpired(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [open]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || isNaN(otp)) {
      setSnackbar({
        open: true,
        message: "Please enter a valid 6-digit OTP.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/otp/verify-otp", {
        otp,
        email,
      });
      setSnackbar({
        open: true,
        message: response.data.message,
        type: "success",
      });
      onClose(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to verify OTP.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/otp/resend-otp", { email });
      setSnackbar({
        open: true,
        message: response.data.message,
        type: "success",
      });
      setTimer(60);
      setTimerExpired(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to resend OTP.",
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
    <Modal open={open} onClose={() => onClose(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Verify OTP
        </Typography>
        <form onSubmit={handleVerifyOtp}>
          <TextField
            label="OTP"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : "Verify OTP"}
          </Button>
          {timerExpired ? (
            <Button
              variant="outlined"
              fullWidth
              onClick={handleResendOtp}
              disabled={loading}
            >
              Resend OTP
            </Button>
          ) : (
            <Typography variant="body2" align="center">
              OTP expires in: {timer} seconds
            </Typography>
          )}
        </form>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.type}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Modal>
  );
};

export default OtpVerificationModal;
