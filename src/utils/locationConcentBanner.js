import { Box, Button, IconButton, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloseIcon from "@mui/icons-material/Close";

// Existing imports remain the same

// New component for location consent banner
const LocationConsentBanner = ({ onAccept, onDecline, onClose }) => {
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mb: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        borderLeft: '4px solid #4caf50'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <LocationOnIcon sx={{ mr: 1, color: '#4caf50' }} />
        <Typography variant="body2">
          Allow location access to get accurate delivery charges and faster checkout
        </Typography>
      </Box>
      <Box>
        <Button 
          size="small" 
          variant="contained" 
          sx={{ mr: 1, bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
          onClick={onAccept}
        >
          Allow
        </Button>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={onDecline}
          sx={{ mr: 1 }}
        >
          No thanks
        </Button>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default LocationConsentBanner;