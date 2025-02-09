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
import Cookies from "js-cookie"; // Import Cookies for storing token securely

const LoginForm = () => {
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

    if (!email.trim() || !password.trim()) {
      setSnackbarMessage("Email and password are required.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:9090/api/admin/adminlogin",
        { email, password },
        { withCredentials: true }
      );

      setSnackbarMessage(response.data.message);
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      // Store token securely in cookies (httpOnly in backend)
      Cookies.set("adminToken", response.data.token, { expires: 1 });

      // Redirect to admin dashboard
      router.push("/admin/dashboard/dashboard");
    } catch (err) {
      setSnackbarMessage(err.response?.data?.message || "Login failed!");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
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
        sx={{ marginBottom: 4, fontWeight: "bold", textAlign: "center" }}
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
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "gray" },
              "&:hover fieldset": { borderColor: "orange" },
              "&.Mui-focused fieldset": { borderColor: "orange" },
            },
            "& .MuiInputLabel-root.Mui-focused": { color: "#FFA500" },
          }}
        />

        <TextField
          label="Password"
          required
          fullWidth
          margin="normal"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: password.length > 0 && (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "gray" },
              "&:hover fieldset": { borderColor: "orange" },
              "&.Mui-focused fieldset": { borderColor: "orange" },
            },
            "& .MuiInputLabel-root.Mui-focused": { color: "#FFA500" },
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
            "&:hover": { backgroundColor: "#ff8c00" },
          }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ marginRight: 1 }} />
          ) : (
            "Login"
          )}
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
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
