import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Slider,
  Divider,
  Checkbox,
  Button,
  IconButton,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const Filter = () => {
  const [priceRange, setPriceRange] = useState([10, 500]);
  const [expanded, setExpanded] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:9090/api/categories");
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const toggleDropdown = (dropdown) => {
    setExpanded(expanded === dropdown ? "" : dropdown);
  };

  const genders = ["Men", "Women", "Unisex"];
  const ratings = [1, 2, 3, 4, 5];
  const discounts = ["10% and above", "20% and above", "30% and above"];

  return (
    <Box
      sx={{
        width: { xs: "100%", sm: "25%", md: "20%" },
        backgroundColor: "#fff",
        padding: 2,
        borderRight: "1px solid #e0e0e0",
      }}
    >
      {/* Price Range Slider */}
      <Box>
        <Typography variant="h6" sx={{ marginBottom: 1 }}>
          Price Range
        </Typography>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          sx={{ color: "black" }}
        />
        <Typography>
          ₹{priceRange[0]} - ₹{priceRange[1]}
        </Typography>
      </Box>

      {/* Divider */}
      <Divider sx={{ marginY: 2, borderColor: "#e0e0e0" }} />

      {/* Dropdowns */}
      {[
        { title: "Categories", items: categories.map((cat) => cat.name), type: "checkbox" },
        { title: "Gender", items: genders, type: "button" },
        { title: "Rating", items: ratings, type: "checkbox" },
        { title: "Discount", items: discounts, type: "button" },
      ].map((filter) => (
        <Box key={filter.title} sx={{ marginBottom: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => toggleDropdown(filter.title)}
          >
            <Typography variant="body1">{filter.title}</Typography>
            <IconButton size="small">
              {expanded === filter.title ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={expanded === filter.title} timeout="auto" unmountOnExit>
            <Box sx={{ paddingLeft: 2, marginTop: 1 }}>
              {filter.items.map((item, index) =>
                filter.type === "checkbox" ? (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #e0e0e0",
                      paddingY: 1,
                    }}
                  >
                    <Typography>{item}</Typography>
                    <Checkbox />
                  </Box>
                ) : (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #e0e0e0",
                      paddingY: 1,
                    }}
                  >
                    <Typography>{item}</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: "20px",
                        borderColor: "black",
                        textTransform: "none",
                        color: "black",
                      }}
                    >
                      Select
                    </Button>
                  </Box>
                )
              )}
            </Box>
          </Collapse>
        </Box>
      ))}
    </Box>
  );
};

export default Filter;
