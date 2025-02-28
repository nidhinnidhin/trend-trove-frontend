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
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";
import GenderFilter from '../components/genderFilter';

const Filter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { filterState, updateFilters } = useFilter();
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
        const response = await axiosInstance.get(
          "/categories"
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

  const FilterContent = () => (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ marginBottom: 4 }}>
        {isMobile && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3 
          }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setIsDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}

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
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography>₹{filterState.priceRange[0]}</Typography>
          <Typography>₹{filterState.priceRange[1]}</Typography>
        </Box>
      </Box>

      <Box sx={{ width: "100%", bgcolor: "background.paper", mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sort By
        </Typography>
        <Select
          value={filterState.sortBy}
          onChange={handleSortChange}
          fullWidth
          size="small"
        >
          <MenuItem value="default">Default</MenuItem>
          <MenuItem value="asc">Name (A-Z)</MenuItem>
          <MenuItem value="desc">Name (Z-A)</MenuItem>
          <MenuItem value="popularity">Popularity</MenuItem>
        </Select>
      </Box>

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
        <Accordion 
          key={section.title} 
          defaultExpanded={!isMobile}
          sx={{
            '&.MuiAccordion-root': {
              backgroundColor: 'transparent',
              boxShadow: 'none',
              '&:before': {
                display: 'none',
              },
            }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              mb: 1,
              '&.Mui-expanded': {
                minHeight: '48px',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            }}
          >
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
                      sx={{
                        color: '#ff6f61',
                        '&.Mui-checked': {
                          color: '#ff6f61',
                        },
                      }}
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

      {isMobile && (
        <Button 
          fullWidth 
          variant="contained"
          sx={{ 
            mt: 3,
            backgroundColor: '#ff6f61',
            '&:hover': {
              backgroundColor: '#ff5c4d',
            }
          }}
          onClick={() => setIsDrawerOpen(false)}
        >
          Apply Filters
        </Button>
      )}
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <>
          <IconButton
            onClick={() => setIsDrawerOpen(true)}
            sx={{
              position: 'fixed',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#ff6f61',
              color: 'white',
              '&:hover': {
                backgroundColor: '#ff5c4d',
              },
              zIndex: 1000,
            }}
          >
            <FilterListIcon />
          </IconButton>

          <Drawer
            anchor="left"
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: '85%',
                maxWidth: '360px',
                backgroundColor: '#fff',
              }
            }}
          >
            <FilterContent />
          </Drawer>
        </>
      ) : (
        <Box
          sx={{
            width: "25%",
            minWidth: "250px",
            maxWidth: "300px",
            backgroundColor: "#fff",
            borderRight: "1px solid #e0e0e0",
            height: '100vh',
            position: 'sticky',
            top: 0,
            overflowY: 'auto',
          }}
        >
          <FilterContent />
        </Box>
      )}
    </>
  );
};

export default Filter;