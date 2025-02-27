import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axiosInstance from "@/utils/adminAxiosInstance";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/adminlogin",
        { email, password },
      );
      Cookies.set("adminToken", response.data.token, { expires: 1 });
      localStorage.setItem('admin-logged', true)
      router.push("/admin/dashboard/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let admin_logged = localStorage.getItem('admin-logged')
    if(admin_logged){
      router.push('/admin/dashboard/dashboard')
    }
    else{
      router.push('/admin/authentication/login')
    }
  }, [])

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "85vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
        padding: "20px",
      }}
    >
      <Card
        sx={{
          width: { xs: "90%", sm: "70%", md: "40%", lg: "30%" },
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          background: "white",
          position: "relative",
          overflow: "visible",
          "&:before": {
            content: '""',
            position: "absolute",
            top: "-10px",
            left: "-10px",
            right: "-10px",
            bottom: "-10px",
            background: "linear-gradient(135deg, #000000 0%, #434343 100%)",
            zIndex: -1,
            borderRadius: "20px",
            opacity: 0.1,
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 1,
                fontFamily: "'Playfair Display', serif"
              }}
            >
              TREND TROVE
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                color: "#333",
                fontWeight: 500 
              }}
            >
              Admin Portal
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "#666",
                fontWeight: 400 
              }}
            >
              Access your administrative dashboard
            </Typography>
          </Box>

          {error && (
            <Typography
              variant="body2"
              sx={{
                color: "#d32f2f",
                textAlign: "center",
                p: 1,
                mb: 2,
                backgroundColor: "rgba(211, 47, 47, 0.1)",
                borderRadius: "4px",
              }}
            >
              {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#000000",
                  },
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000000",
                },
              }}
              required
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#000000",
                  },
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000000",
                },
              }}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.5,
                backgroundColor: "#000000",
                color: "white",
                fontWeight: 600,
                letterSpacing: "0.5px",
                "&:hover": {
                  backgroundColor: "#333333",
                },
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm;
