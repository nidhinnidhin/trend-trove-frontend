import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
  const [filterState, setFilterState] = useState({
    priceRange: [0, 10000],
    categories: [],
    selectedGenders: [],
    selectedRatings: [],
    selectedDiscounts: []
  });

  const updateFilters = (newFilters) => {
    setFilterState(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  return (
    <FilterContext.Provider value={{ filterState, updateFilters }}>
      {children}
    </FilterContext.Provider>
  );
};