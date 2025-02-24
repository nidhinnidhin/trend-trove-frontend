import React from "react";
import { Box, Typography } from "@mui/material";

const AdminFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "gray",
        color: "white",
        textAlign: "center",
        padding: 2,
        position: "relative",
        bottom: 0,
        width: "100%",
        mt: "auto",
      }}
    >
      <Typography variant="body2" component="p">
        © {new Date().getFullYear()} Trend Trove. All Rights Reserved. |
        Privacy Policy
      </Typography>
    </Box>
  );
};

export default AdminFooter;
