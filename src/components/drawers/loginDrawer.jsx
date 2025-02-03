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
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
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
        const response = await axios.post(
          "http://localhost:9090/api/users/login",
          datas
        );
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
        display: "flex", // Flexbox to center
        justifyContent: "center", // Horizontal centering
        alignItems: "center", // Vertical centering
        width: 800,
        height: "100vh", // Full height
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
      {/* Form with slight white transparent background */}
      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)", // Light white with slight transparency
          padding: "20px",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "500px", // Limit form width for better mobile handling
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          {/* Centered Login Text */}
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
                onChange={(e) => setEmail(e.target.value)} // Ensure correct binding
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

            {/* Google Login Button */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  window.location.href =
                    "http://localhost:9090/api/users/auth/google"; // Replace with your backend Google auth URL
                }}
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  backgroundColor: "#fff",
                  color: "black",
                  border: "1px solid #ddd",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  ":hover": {
                    backgroundColor: "#f1f1f1",
                  },
                }}
              >
                <Image
                  src={google}
                  alt="Google Logo"
                  style={{ width: "40px", height: "40px", marginRight: "10px" }}
                />
                Login with Google
              </Button>
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
