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

const StyledWrapper = styled("div")`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledButton = styled(Button)`
  width: 100%;
  height: 56px;
  display: flex;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  text-transform: none;
  align-items: center;
  border-radius: 8px;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  gap: 1rem;
  color: #1f2937;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 256 262"
    style={{ height: 24 }}
  >
    <path
      fill="#4285F4"
      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
    />
    <path
      fill="#34A853"
      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
    />
    <path
      fill="#FBBC05"
      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
    />
    <path
      fill="#EB4335"
      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
    />
  </svg>
);

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
  const [referralCode, setReferralCode] = useState("");

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
      await axiosInstance.post("/otp/send-otp", { email });
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
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("firstname", firstName);
      formData.append("lastname", lastName);
      formData.append("username", userName);
      formData.append("email", email);
      formData.append("image", image);
      formData.append("password", password);
      formData.append("confirmpassword", confirmPassword);
      
      if (referralCode && referralCode.trim()) {
        formData.append("referralCode", referralCode.trim().toUpperCase());
      }

      const response = await axiosInstance.post("/users/register", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Registration response:', response.data);

      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      localStorage.setItem("usertoken", response.data.token);
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (err) {
      console.error("Registration error:", err);
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

  const handleGoogleSignup = () => {
    window.location.href = 'https://www.trendrove.shop/api/users/auth/google';
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

        <TextField
          label="Referral Code (Optional)"
          fullWidth
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          sx={textFieldStyle}
          placeholder="Enter referral code if you have one"
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

        <Box sx={{ display: "flex", alignItems: "center", margin: "1rem 0" }}>
          <Box sx={{ flex: 1, height: "1px", backgroundColor: "rgba(0, 0, 0, 0.12)" }} />
          <Typography sx={{ margin: "0 1rem", color: "#6b7280" }}>or</Typography>
          <Box sx={{ flex: 1, height: "1px", backgroundColor: "rgba(0, 0, 0, 0.12)" }} />
        </Box>

        <StyledWrapper>
          <StyledButton
            onClick={handleGoogleSignup}
            startIcon={<GoogleIcon />}
          >
            Continue with Google
          </StyledButton>
        </StyledWrapper>
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
