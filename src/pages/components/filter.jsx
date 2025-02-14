import React, { useEffect, useState } from "react";
import { useFilter } from "@/context/filterContext";
import {
  Box,
  Typography,
  Slider,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  MenuItem,
  Select,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "axios";

const Filter = () => {
  const { filterState, updateFilters } = useFilter();
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategories] = useState([]);

  const handleSortChange = (event) => {
    updateFilters({ sortBy: event.target.value });
  };

  const handlePriceChange = (event, newValue) => {
    updateFilters({ priceRange: newValue });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:9090/api/categories"
        );
        setCategories(response.data.categories.map((cat) => cat.name));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (category) => {
    const newCategories = filterState.categories.includes(category)
      ? filterState.categories.filter((c) => c !== category)
      : [...filterState.categories, category];
    updateFilters({ categories: newCategories });
  };

  const handleGenderChange = (gender) => {
    const newGenders = filterState.selectedGenders.includes(gender)
      ? filterState.selectedGenders.filter((g) => g !== gender)
      : [...filterState.selectedGenders, gender];
    updateFilters({ selectedGenders: newGenders });
  };

  const handleRatingChange = (rating) => {
    const newRatings = filterState.selectedRatings.includes(rating)
      ? filterState.selectedRatings.filter((r) => r !== rating)
      : [...filterState.selectedRatings, rating];
    updateFilters({ selectedRatings: newRatings });
  };

  const handleDiscountChange = (discount) => {
    const newDiscounts = filterState.selectedDiscounts.includes(discount)
      ? filterState.selectedDiscounts.filter((d) => d !== discount)
      : [...filterState.selectedDiscounts, discount];
    updateFilters({ selectedDiscounts: newDiscounts });
  };

  const genders = ["Men", "Women", "Unisex"];
  const ratings = [5, 4, 3, 2, 1];
  const discounts = ["10", "20", "30", "40", "50"];

  return (
    <Box
      sx={{
        width: "25%",
        minWidth: "250px",
        backgroundColor: "#fff",
        padding: 3,
        borderRight: "1px solid #e0e0e0",
      }}
    >
      <Box sx={{ marginBottom: 4, marginTop: 10 }}>
        <Typography variant="h6" gutterBottom>
          Price Range
        </Typography>
        <Slider
          value={filterState.priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={10000}
          sx={{ marginTop: 2, color: "#ff6f61" }}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 1,
          }}
        >
          <Typography>₹{filterState.priceRange[0]}</Typography>
          <Typography>₹{filterState.priceRange[1]}</Typography>
        </Box>
      </Box>

      <Box
        sx={{ width: "100%", bgcolor: "background.paper", marginTop: "20px" }}
      >
        <Typography variant="h6" gutterBottom>
          Sort By
        </Typography>
        <Select
          value={filterState.sortBy}
          onChange={handleSortChange}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        >
          <MenuItem value="default">Default</MenuItem>
          <MenuItem value="asc">Name (A-Z)</MenuItem>
          <MenuItem value="desc">Name (Z-A)</MenuItem>
          <MenuItem value="popularity">Popularity</MenuItem>
        </Select>
      </Box>

      {/* Categories, Gender, Rating, Discount sections */}
      {[
        {
          title: "Categories",
          items: categories,
          handler: handleCategoryChange,
          state: filterState.categories,
        },
        {
          title: "Gender",
          items: ["Men", "Women", "Unisex"],
          handler: handleGenderChange,
          state: filterState.selectedGenders,
        },
        {
          title: "Rating",
          items: [5, 4, 3, 2, 1],
          handler: handleRatingChange,
          state: filterState.selectedRatings,
        },
        {
          title: "Discount",
          items: ["10", "20", "30", "40", "50"],
          handler: handleDiscountChange,
          state: filterState.selectedDiscounts,
        },
      ].map((section) => (
        <Accordion key={section.title} defaultExpanded={true}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {section.items.map((item) => (
                <FormControlLabel
                  key={item}
                  control={
                    <Checkbox
                      checked={section.state.includes(item)}
                      onChange={() => section.handler(item)}
                    />
                  }
                  label={
                    section.title === "Rating"
                      ? `${item} Star${item === 1 ? "" : "s"}`
                      : section.title === "Discount"
                      ? `${item}% or more`
                      : item
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Filter;
