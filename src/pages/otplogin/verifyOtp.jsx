// import React, { useState, useEffect } from "react";
// import {
//   TextField,
//   Button,
//   Snackbar,
//   Alert,
//   CircularProgress,
//   Box,
//   Typography,
// } from "@mui/material";
// import Header from "../components/header";
// import Footer from "../components/footer";
// import axios from "axios";
// import { useRouter } from "next/router";

// const VerifyOtp = () => {
//   const [otp, setOtp] = useState("");
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "" });
//   const [isFormSubmitted, setIsFormSubmitted] = useState(false);
//   const [timer, setTimer] = useState(60); // Default 60 seconds timer
//   const [timerExpired, setTimerExpired] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
//   const router = useRouter();

//   function refreshPage(){
//     window.location.reload();
// }

//   useEffect(() => {
//     const hasRefreshed = sessionStorage.getItem('hasRefreshed');

//     if (!hasRefreshed) {
//       sessionStorage.setItem('hasRefreshed', 'true');
//       refreshPage();
//     }
//     const savedEmail = localStorage.getItem("email");
//     if (savedEmail) {
//       setEmail(savedEmail);
//     } else {
//       setSnackbar({ open: true, message: "Email is missing.", type: "error" });
//     }

//     const storedTimer = localStorage.getItem("otp-timer");
//     let interval; // Define the interval variable in the same scope

//     if (storedTimer) {
//       const currentTime = Math.floor(Date.now() / 1000);
//       const remainingTime = Math.max(0, parseInt(storedTimer) - currentTime);
//       setTimer(remainingTime);
//       if (remainingTime === 0) {
//         setTimerExpired(true);
//       } else {
//         // If the timer hasn't expired, continue countdown
//         interval = setInterval(() => {
//           setTimer((prevTimer) => {
//             if (prevTimer <= 1) {
//               clearInterval(interval); // Clear the interval
//               setTimerExpired(true); // Set expired status when timer reaches 0
//               return 0;
//             }
//             return prevTimer - 1;
//           });
//         }, 1000);
//       }
//     } else {
//       // Set default timer if no stored timer exists
//       localStorage.setItem("otp-timer", Math.floor(Date.now() / 1000) + 60);
//     }

//     // Cleanup the interval on unmount
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     if (timer === 0) {
//       localStorage.removeItem("otp-timer");
//     } else {
//       localStorage.setItem("otp-timer", Math.floor(Date.now() / 1000) + timer);
//     }
//   }, [timer]);

//   const handleCloseSnackbar = () => {
//     setSnackbar({ open: false, message: "", type: "" });
//   };

//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();

//     if (otp.length !== 6 || isNaN(otp)) {
//       setSnackbar({ open: true, message: "Please enter a valid 6-digit OTP.", type: "error" });
//       setIsFormSubmitted(true);
//       return;
//     }

//     if (!email) {
//       setSnackbar({ open: true, message: "Email is missing.", type: "error" });
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await axios.post("http://localhost:9090/api/otp/verify-otp", {
//         otp,
//         email,
//       });

//       setLoading(false);
//       setSnackbar({ open: true, message: response.data.message, type: "success" });
//       localStorage.removeItem("email");
//       router.push("/"); // Redirect after successful OTP verification
//     } catch (error) {
//       setLoading(false);

//       if (error.response && error.response.data) {
//         setSnackbar({ open: true, message: error.response.data.message, type: "error" });
//       } else {
//         setSnackbar({ open: true, message: "Failed to verify OTP. Try again.", type: "error" });
//       }
//     }
//   };

//   const handleResendOtp = async () => {
//     setResendLoading(true);

//     try {
//       setLoading(true);

//       const response = await axios.post("http://localhost:9090/api/otp/resend-otp", {
//         email,
//       });

//       setLoading(false);
//       setSnackbar({ open: true, message: response.data.message, type: "success" });

//       // Reset timer to 60 seconds
//       setTimer(60); // Reset to 60 seconds
//       setTimerExpired(false); // Reset expired flag

//       // Store the new timer value
//       localStorage.setItem("otp-timer", Math.floor(Date.now() / 1000) + 60);

//       // Restart the countdown for the timer
//       const interval = setInterval(() => {
//         setTimer((prevTimer) => {
//           if (prevTimer <= 1) {
//             clearInterval(interval); // Clear the interval
//             setTimerExpired(true); // Set expired flag when timer reaches 0
//             return 0;
//           }
//           return prevTimer - 1;
//         });
//       }, 1000);

//       // Store the interval ID in the cleanup function (optional, for future reference)
//       return () => clearInterval(interval); // Cleanup on unmount

//     } catch (error) {
//       setLoading(false);
//       if (error.response && error.response.data) {
//         setSnackbar({ open: true, message: error.response.data.message, type: "error" });
//       } else {
//         setSnackbar({ open: true, message: "Failed to resend OTP. Try again.", type: "error" });
//       }
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   const formatTime = (time) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = time % 60;
//     return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
//   };

//   return (
//     <>
//       <Header />
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "70vh",
//           backgroundColor: "#f4f4f4",
//         }}
//       >
//         <Box
//           sx={{
//             maxWidth: 400,
//             padding: 4,
//             border: "1px solid #ddd",
//             borderRadius: 2,
//             boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
//           }}
//         >
//           <Typography variant="h5" textAlign="center" gutterBottom>
//             Verify OTP
//           </Typography>
//           <form onSubmit={handleVerifyOtp} noValidate>
//             <TextField
//               label="Email Address"
//               variant="outlined"
//               type="email"
//               fullWidth
//               required
//               value={email}
//               InputProps={{
//                 readOnly: true,
//               }}
//               sx={{
//                 mb: 3,
//                 "& .MuiOutlinedInput-root": {
//                   "&.Mui-focused fieldset": {
//                     borderColor: "#FFA500",
//                   },
//                 },
//                 "& .MuiInputLabel-root.Mui-focused": {
//                   color: "#FFA500",
//                 },
//               }}
//             />
//             <TextField
//               label="OTP"
//               variant="outlined"
//               type="number"
//               fullWidth
//               required
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               error={isFormSubmitted && (otp.length !== 6 || isNaN(otp))}
//               helperText={
//                 isFormSubmitted && (otp.length !== 6 || isNaN(otp))
//                   ? "OTP must be 6 digits."
//                   : ""
//               }
//               sx={{
//                 mb: 3,
//                 "& .MuiOutlinedInput-root": {
//                   "&.Mui-focused fieldset": {
//                     borderColor: "#FFA500",
//                   },
//                 },
//                 "& .MuiInputLabel-root.Mui-focused": {
//                   color: "#FFA500",
//                 },
//               }}
//             />
//             <Button
//               type="submit"
//               variant="contained"
//               fullWidth
//               disabled={loading}
//               sx={{
//                 backgroundColor: "#FFA500",
//                 "&:hover": { backgroundColor: "#FF8C00" },
//               }}
//             >
//               {loading ? (
//                 <>
//                   <CircularProgress size={20} sx={{ marginRight: 1, color: "white" }} />
//                   Verifying OTP...
//                 </>
//               ) : (
//                 "Verify OTP"
//               )}
//             </Button>
//           </form>

//           {timerExpired ? (
//             <Button
//               variant="contained"
//               color="warning"
//               fullWidth
//               sx={{ mt: 2 }}
//               onClick={handleResendOtp}
//               disabled={resendLoading}
//             >
//               {resendLoading ? (
//                 <>
//                   <CircularProgress size={20} sx={{ marginRight: 1, color: "white" }} />
//                   Resending OTP...
//                 </>
//               ) : (
//                 "Resend OTP"
//               )}
//             </Button>
//           ) : (
//             <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
//               OTP expires in: {formatTime(timer)}
//             </Typography>
//           )}

//           <Snackbar
//             open={snackbar.open}
//             autoHideDuration={3000}
//             onClose={handleCloseSnackbar}
//             anchorOrigin={{ vertical: "top", horizontal: "center" }}
//           >
//             <Alert onClose={handleCloseSnackbar} severity={snackbar.type} sx={{ width: "100%" }}>
//               {snackbar.message}
//             </Alert>
//           </Snackbar>
//         </Box>
//       </Box>
//       <Footer />
//     </>
//   );
// };

// export default VerifyOtp;

import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import Header from "../components/header";
import Footer from "../components/footer";
import axios from "axios";
import { useRouter } from "next/router";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false); // Loading state for verify OTP
  const [resendLoading, setResendLoading] = useState(false); // Loading state for resend OTP
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "",
  });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [timer, setTimer] = useState(60); // Default 60 seconds timer
  const [timerExpired, setTimerExpired] = useState(false);
  const router = useRouter();

  function refreshPage() {
    window.location.reload();
  }

  useEffect(() => {
    const hasRefreshed = sessionStorage.getItem("hasRefreshed");

    if (!hasRefreshed) {
      sessionStorage.setItem("hasRefreshed", "true");
      refreshPage();
    }
    const savedEmail = localStorage.getItem("email");
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      setSnackbar({ open: true, message: "Email is missing.", type: "error" });
    }

    const storedTimer = localStorage.getItem("otp-timer");
    let interval; // Define the interval variable in the same scope

    if (storedTimer) {
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = Math.max(0, parseInt(storedTimer) - currentTime);
      setTimer(remainingTime);
      if (remainingTime === 0) {
        setTimerExpired(true);
      } else {
        // If the timer hasn't expired, continue countdown
        interval = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer <= 1) {
              clearInterval(interval); // Clear the interval
              setTimerExpired(true); // Set expired status when timer reaches 0
              return 0;
            }
            return prevTimer - 1;
          });
        }, 1000);
      }
    } else {
      // Set default timer if no stored timer exists
      localStorage.setItem("otp-timer", Math.floor(Date.now() / 1000) + 60);
    }

    // Cleanup the interval on unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer === 0) {
      localStorage.removeItem("otp-timer");
    } else {
      localStorage.setItem("otp-timer", Math.floor(Date.now() / 1000) + timer);
    }
  }, [timer]);

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", type: "" });
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6 || isNaN(otp)) {
      setSnackbar({
        open: true,
        message: "Please enter a valid 6-digit OTP.",
        type: "error",
      });
      setIsFormSubmitted(true);
      return;
    }

    if (!email) {
      setSnackbar({ open: true, message: "Email is missing.", type: "error" });
      return;
    }

    try {
      setVerifyLoading(true); // Set loading state for verify OTP

      const response = await axios.post(
        "http://localhost:9090/api/otp/verify-otp",
        {
          otp,
          email,
        }
      );

      setVerifyLoading(false); // Reset loading state after verification
      setSnackbar({
        open: true,
        message: response.data.message,
        type: "success",
      });
      localStorage.removeItem("email");
      router.push("/"); // Redirect after successful OTP verification
    } catch (error) {
      setVerifyLoading(false); // Reset loading state on error

      if (error.response && error.response.data) {
        setSnackbar({
          open: true,
          message: error.response.data.message,
          type: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to verify OTP. Try again.",
          type: "error",
        });
      }
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true); // Set loading state for resend OTP

    try {
      const response = await axios.post(
        "http://localhost:9090/api/otp/resend-otp",
        {
          email,
        }
      );

      setResendLoading(false); // Reset loading state after resend
      setSnackbar({
        open: true,
        message: response.data.message,
        type: "success",
      });

      // Reset timer to 60 seconds
      setTimer(60); // Reset to 60 seconds
      setTimerExpired(false); // Reset expired flag

      // Store the new timer value
      localStorage.setItem("otp-timer", Math.floor(Date.now() / 1000) + 60);

      // Restart the countdown for the timer
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval); // Clear the interval
            setTimerExpired(true); // Set expired flag when timer reaches 0
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(interval); // Cleanup on unmount
    } catch (error) {
      setResendLoading(false); // Reset loading state on error

      if (error.response && error.response.data) {
        setSnackbar({
          open: true,
          message: error.response.data.message,
          type: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to resend OTP. Try again.",
          type: "error",
        });
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
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
            Verify OTP
          </Typography>
          <form onSubmit={handleVerifyOtp} noValidate>
            <TextField
              label="Email Address"
              variant="outlined"
              type="email"
              fullWidth
              required
              value={email}
              InputProps={{
                readOnly: true,
              }}
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
            <TextField
              label="OTP"
              variant="outlined"
              type="number"
              fullWidth
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={isFormSubmitted && (otp.length !== 6 || isNaN(otp))}
              helperText={
                isFormSubmitted && (otp.length !== 6 || isNaN(otp))
                  ? "OTP must be 6 digits."
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
            {email && (
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={verifyLoading}
                sx={{
                  backgroundColor: "#FFA500",
                  "&:hover": { backgroundColor: "#FF8C00" },
                }}
              >
                {verifyLoading ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{ marginRight: 1, color: "white" }}
                    />
                    Verifying OTP...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            )}
          </form>

          {email && timerExpired ? (
            <Button
              variant="contained"
              color="warning"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleResendOtp}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{ marginRight: 1, color: "white" }}
                  />
                  Resending OTP...
                </>
              ) : (
                "Resend OTP"
              )}
            </Button>
          ) : (
            email && <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              sx={{ mt: 2 }}
            >
              OTP expires in: {formatTime(timer)}
            </Typography>
          )}

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

export default VerifyOtp;
