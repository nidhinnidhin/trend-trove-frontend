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

const FileInput = styled("input")({
  display: "none",
});

const SignupDrawer = ({ open, onClose }) => {
  const router = useRouter(); // Initialize the router
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

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
      const response = await axios.post(
        "http://localhost:9090/api/users/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSnackbarMessage(response.data.message);
      localStorage.setItem("usertoken", response.data.token);
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setTimeout(() => {
        router.push("/otplogin/sendOtp"); 
      }, 2000);
    } catch (err) {
      setSnackbarMessage(err.response?.data?.message || "Registration failed");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 800,
        position: "relative",
        height: "100vh",
        backgroundImage:
          "url('https://images.pexels.com/photos/1233648/pexels-photo-1233648.jpeg?auto=compress&cs=tinysrgb&w=600')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "10px",
      }}
      role="presentation"
    >
      <Button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 10,
          color: "black",
        }}
      >
        <CloseIcon />
      </Button>
      <div
        className="card"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          padding: "20px",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Signup
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2} direction="column">
            <Grid item xs={12}>
              <label htmlFor="profileImage">
                <FileInput
                  id="profileImage"
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ mb: 1, border: "1px solid orange", color: "orange" }}
                >
                  Upload Profile Image
                </Button>
              </label>
              {image && (
                <Avatar
                  src={URL.createObjectURL(image)}
                  alt="Profile Preview"
                  sx={{ width: 80, height: 80, mt: 2, mx: "auto" }}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                required
                onChange={(e) => setFirstName(e.target.value)}
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
                label="Last Name"
                name="lastName"
                fullWidth
                required
                onChange={(e) => setLastName(e.target.value)}
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
                label="Username"
                name="username"
                fullWidth
                required
                onChange={(e) => setUserName(e.target.value)}
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
                label="Email"
                name="email"
                type="email"
                fullWidth
                required
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: confirmPassword && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff />
                        )}
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
                color="primary"
                fullWidth
                disabled={loading}
                sx={{
                  backgroundColor: "#FFA500", // Orange background
                  "&:hover": {
                    backgroundColor: "#FF8C00", // Darker orange on hover
                  },
                }}
                startIcon={loading && <CircularProgress size={20} color="orange"/>}
              >
                {loading ? "Signing..." : "Signup"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>

      {/* Snackbar for Feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
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

export default SignupDrawer;
