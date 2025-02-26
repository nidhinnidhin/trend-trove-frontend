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
  height: 60px;
  display: flex;
  padding: 0.5rem 1.4rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  vertical-align: middle;
  align-items: center;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.25);
  gap: 0.75rem;
  color: rgb(65, 63, 63);
  background-color: #fff;
  cursor: pointer;
  transition: all 0.6s ease;

  &:hover {
    transform: scale(1.02);
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
    const form = e.target;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSnackbarMessage("Please enter a valid email address!");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    // Validate password
    const passwordRegex =
      /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) {
      setSnackbarMessage(
        "Password must be at least 8 characters long and include at least one special character!"
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const datas = {
      email: email,
      password: password,
    };

    setLoading(true);

    setTimeout(async () => {
      try {
        const response = await axiosInstance.post("/users/login", datas);
        setSnackbarMessage(response.data.message);
        setSnackbarSeverity("success");
        setOpenSnackbar(true);
        localStorage.setItem("usertoken", response.data.token);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (err) {
        setSnackbarMessage(err.response?.data?.message || "Login failed!");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center", 
        alignItems: "center", 
        width: 800,
        height: "100vh",
        position: "relative",
        backgroundImage:
          "url('https://images.pexels.com/photos/3353621/pexels-photo-3353621.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "10px",
        textAlign: "center",
      }}
      role="presentation"
    >
      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)", 
          padding: "20px",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "500px", 
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          <Typography
            variant="h4"
            gutterBottom
            style={{ color: "black", textAlign: "center" }}
          >
            Login
          </Typography>
          <Grid container spacing={2}>
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
                    "& fieldset": {
                      borderColor: "gray",
                    },
                    "&:hover fieldset": {
                      borderColor: "#FFA500", 
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#FFA500", 
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "gray",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#FFA500",
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
                value={password} // Ensure correct binding
                onChange={(e) => setPassword(e.target.value)} // Ensure correct binding
                InputProps={{
                  endAdornment: password && (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "gray",
                    },
                    "&:hover fieldset": {
                      borderColor: "#FFA500", // Orange border on hover
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#FFA500", // Orange border on focus
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
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  backgroundColor: "#FFA500", // Orange background
                  "&:hover": {
                    backgroundColor: "#FF8C00", // Darker orange on hover
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ marginRight: 1 }} />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="body2"
                sx={{
                  textAlign: "right",
                  cursor: "pointer",
                  color: "#FFA500",
                }}
                onClick={() => router.push("/forgotPassword/forgotpassword")}
              >
                Forgot Password?
              </Typography>
            </Grid>

            {/* Google Login Button */}
            <Grid item xs={12}>
              <StyledWrapper>
                <StyledButton
                  variant="outlined"
                  onClick={() => {
                    window.location.href =
                      "http://localhost:9090/api/users/auth/google"; // Replace with your backend Google auth URL
                  }}
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
