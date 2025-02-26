import React, { useState } from "react";
import { useRouter } from "next/router"; // Import the useRouter hook
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  TextField,
  Grid,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled, width } from "@mui/system";
import axios from "axios";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import OtpVerificationModal from "../modals/openOtpVerification";
import axiosInstance from "@/utils/axiosInstance";

const FileInput = styled("input")({
  display: "none",
});

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: 450,
  height: '100vh',
  backgroundColor: '#ffffff',
  padding: '2rem',
  position: 'relative',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#cbd5e1',
    borderRadius: '6px',
  },
}));

const StyledForm = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  width: '100%',
  maxWidth: '400px',
  margin: '0 auto',
});

const SignupDrawer = ({ open, onClose }) => {
  const router = useRouter();
  const [image, setImage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);

  const validateForm = () => {
    // Check if all fields are filled
    if (!image || !firstName || !lastName || !userName || !email || !password || !confirmPassword) {
      setSnackbarMessage("All fields are required");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return false;
    }

    // Validate image type
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(image.type)) {
      setSnackbarMessage("Invalid file type. Only JPEG or PNG images are allowed.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return false;
    }

    // Validate text fields (only letters)
    const textRegex = /^[A-Za-z]+$/;
    if (!textRegex.test(firstName)) {
      setSnackbarMessage("First name should only contain letters and no spaces or special characters");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return false;
    }

    if (!textRegex.test(lastName)) {
      setSnackbarMessage("Last name should only contain letters and no spaces or special characters");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return false;
    }

    if (!textRegex.test(userName)) {
      setSnackbarMessage("Username should only contain letters and no spaces or special characters");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return false;
    }

    // Username length validation
    if (userName.length <= 3) {
      setSnackbarMessage("Username must be more than 3 characters long");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return false;
    }

    // Email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      setSnackbarMessage("Please enter a valid email address");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return false;
    }

    // Password validation
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (password.length < 8 || !specialCharRegex.test(password)) {
      setSnackbarMessage("Password must be at least 8 characters long and contain at least one special character");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return false;
    }

    // Password match validation
    if (password !== confirmPassword) {
      setSnackbarMessage("Passwords do not match");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:9090/api/otp/send-otp", { email });
      setOtpModalOpen(true);
    } catch (err) {
      // Handle specific error messages from backend
      const errorMessage = err.response?.data?.message || "Failed to send OTP";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerificationSuccess = async () => {
    const formData = new FormData();
    formData.append("firstname", firstName);
    formData.append("lastname", lastName);
    formData.append("username", userName);
    formData.append("email", email);
    formData.append("image", image);
    formData.append("password", password);
    formData.append("confirmpassword", confirmPassword);

    setLoading(true);
    try {
      const response = await axiosInstance.post("/users/register", formData);
      setSnackbarMessage("Registration successful!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      localStorage.setItem("usertoken", response.data.token);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      // Handle specific backend error messages
      const errorMessage = err.response?.data?.message || "Registration failed";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <StyledBox role="presentation" sx={{width:"600px"}}>
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          color: '#64748b',
          '&:hover': {
            backgroundColor: 'rgba(100, 116, 139, 0.08)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ textAlign: 'center', mb: 4, mt: 2}}>
        <Typography
          variant="h4"
          sx={{
            color: '#1e293b',
            fontWeight: 600,
            fontSize: '1.875rem',
            lineHeight: 1.2,
          }}
        >
          Create Account
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#64748b',
            mt: 1,
          }}
        >
          Fill in your details to get started
        </Typography>
      </Box>

      <StyledForm onSubmit={handleSubmit} noValidate>
        <Box sx={{ width: '100%', textAlign: 'center' }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-image"
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <label htmlFor="profile-image">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                src={image ? URL.createObjectURL(image) : ''}
                sx={{
                  width: 100,
                  height: 100,
                  cursor: 'pointer',
                  border: '2px dashed #e2e8f0',
                  backgroundColor: '#f8fafc',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: '#2563eb',
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: '#64748b',
                  cursor: 'pointer',
                  '&:hover': { color: '#2563eb' },
                }}
              >
                {image ? 'Change Profile Picture' : 'Upload Profile Picture'}
              </Typography>
            </Box>
          </label>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="First Name"
              fullWidth
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              sx={textFieldStyle}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Last Name"
              fullWidth
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              sx={textFieldStyle}
            />
          </Grid>
        </Grid>

        <TextField
          label="Username"
          fullWidth
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          sx={textFieldStyle}
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={textFieldStyle}
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ color: '#64748b' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={textFieldStyle}
        />

        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  sx={{ color: '#64748b' }}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={textFieldStyle}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            height: '48px',
            backgroundColor: 'rgb(237, 161, 20)',
            fontSize: '1rem',
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'rgb(238, 169, 41)',
              boxShadow: 'none',
            },
            '&:disabled': {
              backgroundColor: '#94a3b8',
            },
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} sx={{ color: 'white' }} />
              <span>Creating Account...</span>
            </Box>
          ) : (
            'Create Account'
          )}
        </Button>
      </StyledForm>

      <OtpVerificationModal
        open={otpModalOpen}
        onClose={(success) => {
          setOtpModalOpen(false);
          if (success) {
            handleOtpVerificationSuccess();
          }
        }}
        email={email}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </StyledBox>
  );
};

// Common TextField styling
const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    '& fieldset': {
      borderColor: '#e2e8f0',
    },
    '&:hover fieldset': {
      borderColor: '#2563eb',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563eb',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#64748b',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#2563eb',
  },
  '& .MuiOutlinedInput-input': {
    color: '#1e293b',
  },
};

export default SignupDrawer;
