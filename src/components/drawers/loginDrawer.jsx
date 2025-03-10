import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  TextField,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Image from "next/image";
import axios from "axios";
import google from "../../media/google.png";
import { useRouter } from "next/router";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { styled } from "@mui/system";
import axiosInstance from "@/utils/axiosInstance";

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

const LoginDrawer = ({ onClose }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Client-side validations
      if (!email.trim() || !password.trim()) {
        setSnackbarMessage("Email and password are required");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        return;
      }

      const response = await axiosInstance.post("/users/login", {
        email: email.trim(),
        password: password,
      }
    )
      
      .catch((error) => {
        // Handle specific error cases
        if (error.response) {
          // Server responded with error status
          const errorMessage = error.response.data.message || "Invalid credentials";
          setSnackbarMessage(errorMessage);
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
          throw new Error(errorMessage); // Stop execution here
        }
        // Network or other errors
        setSnackbarMessage("Connection error. Please try again.");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        throw error;
      });

      // Handle successful login
      if (response && response.data) {
        setSnackbarMessage("Login successful!");
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        localStorage.setItem("usertoken", response.data.token);
        
        setTimeout(() => {
          router.push("/");
          if (onClose) onClose();
        }, 2000);
      }

    } catch (error) {
      // This will only log to console, not show to user
      console.log("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleGoogleLogin = () => {
    // Use the complete URL
    window.location.href = 'http://13.126.18.175:9090/api/users/auth/google';
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 600,
        height: "100vh",
        position: "relative",
        backgroundColor: "#ffffff",
        padding: "2rem",
        textAlign: "center",
      }}
      role="presentation"
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: "#1f2937",
              fontWeight: 600,
              marginBottom: "2rem",
              fontSize: "2rem",
            }}
          >
            Welcome Back
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.12)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#2563eb",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2563eb",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#6b7280",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2563eb",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: password && (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={togglePasswordVisibility}
                        edge="end"
                        sx={{ color: "#6b7280" }}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.12)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#2563eb",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2563eb",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#6b7280",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2563eb",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  height: "56px",
                  backgroundColor: "rgb(237, 161, 20)",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "rgb(237, 156, 7)",
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ color: "white", marginRight: 1 }} />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  textAlign: "right",
                  cursor: "pointer",
                  color: "#2563eb",
                  fontWeight: 500,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={() => router.push("/forgotPassword/forgotpassword")}
              >
                Forgot password?
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", margin: "1rem 0" }}>
                <Box sx={{ flex: 1, height: "1px", backgroundColor: "rgba(0, 0, 0, 0.12)" }} />
                <Typography sx={{ margin: "0 1rem", color: "#6b7280" }}>or</Typography>
                <Box sx={{ flex: 1, height: "1px", backgroundColor: "rgba(0, 0, 0, 0.12)" }} />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <StyledWrapper>
                <StyledButton
                  onClick={handleGoogleLogin}
                  startIcon={<GoogleIcon />}
                >
                  Continue with Google
                </StyledButton>
              </StyledWrapper>
            </Grid>
          </Grid>
        </form>
      </Box>

      {/* Snackbar for Success or Error */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
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

export default LoginDrawer;
