import React, { useState, useCallback } from "react";
import { 
  Box, 
  Typography,
  Slider,
  TextField,
  InputAdornment,
  Stack,
  useTheme
} from "@mui/material";

const PriceRangeFilter = ({ priceRange, onChange }) => {
  const theme = useTheme();
  const [localValue, setLocalValue] = useState(priceRange);
  // Use state to control when to update parent component
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle slider change during drag (only updates local state)
  const handleSliderChange = (event, newValue) => {
    setLocalValue(newValue);
    // Don't update the parent while dragging to prevent blinking
    if (!isDragging) {
      onChange(newValue);
    }
  };
  
  // Handle drag start
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  // Handle drag end - now update the parent
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    onChange(localValue);
  }, [localValue, onChange]);
  
  // Handle input change for min price
  const handleMinInputChange = (event) => {
    const minValue = event.target.value === '' ? 0 : Number(event.target.value);
    const newValue = [Math.min(minValue, localValue[1]), localValue[1]];
    setLocalValue(newValue);
  };
  
  // Handle input change for max price
  const handleMaxInputChange = (event) => {
    const maxValue = event.target.value === '' ? 0 : Number(event.target.value);
    const newValue = [localValue[0], Math.max(maxValue, localValue[0])];
    setLocalValue(newValue);
  };
  
  // Handle blur for input fields
  const handleBlur = () => {
    // Ensure values are within bounds
    let newValue = [...localValue];
    let changed = false;
    
    if (newValue[0] < 0) {
      newValue[0] = 0;
      changed = true;
    }
    
    if (newValue[1] > 10000) {
      newValue[1] = 10000;
      changed = true;
    }
    
    if (changed) {
      setLocalValue(newValue);
    }
    
    // Only update parent after input blur
    onChange(newValue);
  };
  
  // Mark key price points on the slider
  const marks = [
    { value: 0, label: '₹0' },
    { value: 2500, label: '₹2500' },
    { value: 5000, label: '₹5000' },
    { value: 7500, label: '₹7500' },
    { value: 10000, label: '₹10000' }
  ];
  
  return (
    <Box sx={{ width: "100%", mt: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Price Range
      </Typography>
      
      <Slider
        value={localValue}
        onChange={handleSliderChange}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        valueLabelDisplay="auto"
        min={0}
        max={10000}
        step={100}
        marks={marks}
        valueLabelFormat={(value) => `₹${value}`}
        disableSwap
        sx={{
          mt: 3,
          mb: 4,
          "& .MuiSlider-thumb": {
            height: 24,
            width: 24,
            backgroundColor: "#fff",
            border: "2px solid #ff6f61",
            "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
              boxShadow: "0 0 0 8px rgba(255, 111, 97, 0.16)",
            },
            "&:before": {
              display: "none",
            },
            "& .MuiSlider-valueLabel": {
              backgroundColor: "#ff6f61",
            },
          },
          "& .MuiSlider-track": {
            backgroundColor: "#ff6f61",
            border: "none",
            height: 6,
          },
          "& .MuiSlider-rail": {
            backgroundColor: "#e0e0e0",
            height: 6,
          },
          "& .MuiSlider-markLabel": {
            fontSize: "0.75rem",
            color: theme.palette.text.secondary,
          },
          "& .MuiSlider-mark": {
            backgroundColor: "#bdbdbd",
            height: 8,
            width: 1,
            "&.MuiSlider-markActive": {
              opacity: 1,
              backgroundColor: "#ff6f61",
            },
          },
        }}
      />
      
      <Stack 
        direction="row" 
        spacing={2} 
        justifyContent="space-between"
        alignItems="center"
      >
        <TextField
          label="Min"
          value={localValue[0]}
          onChange={handleMinInputChange}
          onBlur={handleBlur}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            inputProps: {
              min: 0,
              max: localValue[1],
              type: 'number',
              'aria-labelledby': 'price-range-slider',
            },
          }}
          sx={{ width: "45%" }}
        />
        
        <Typography variant="body2" color="text.secondary">to</Typography>
        
        <TextField
          label="Max"
          value={localValue[1]}
          onChange={handleMaxInputChange}
          onBlur={handleBlur}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            inputProps: {
              min: localValue[0],
              max: 10000,
              type: 'number',
              'aria-labelledby': 'price-range-slider',
            },
          }}
          sx={{ width: "45%" }}
        />
      </Stack>
    </Box>
  );
};

export default PriceRangeFilter;