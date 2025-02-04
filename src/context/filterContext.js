import React, { useState, useEffect } from 'react';
import { Box } from '@/components/ui/box';
import Products from '@/pages/components/products';

const FilterContext = React.createContext();

// Main Products Page Component
export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filterState, setFilterState] = useState({
    priceRange: [0, 1000],
    categories: [],
    gender: [],
    rating: [],
    discount: []
  });

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/products/get');
        const data = await response.json();
        const transformedProducts = transformProducts(data);
        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Transform API response into consistent format
  const transformProducts = (data) => {
    return data.map((product) => {
      const variant = product.variants[0];
      const firstSize = variant.sizes[0];
      
      return {
        id: product._id,
        image: variant.mainImage,
        title: product.name.slice(0, 50),
        description: product.description,
        rating: product.ratings || 0,
        price: firstSize.discountPrice || firstSize.price,
        variantsCount: product.variants.length,
        color: variant.color,
        isDeleted: product.isDeleted,
        category: product.category?.name,
        gender: product.gender
      };
    });
  };

  // Apply filters to products
  const applyFilters = () => {
    let filtered = [...products];

    // Price filter
    filtered = filtered.filter(product => 
      product.price >= filterState.priceRange[0] && 
      product.price <= filterState.priceRange[1]
    );

    // Category filter
    if (filterState.categories.length > 0) {
      filtered = filtered.filter(product => 
        filterState.categories.includes(product.category)
      );
    }

    // Gender filter
    if (filterState.gender.length > 0) {
      filtered = filtered.filter(product => 
        filterState.gender.includes(product.gender)
      );
    }

    // Rating filter
    if (filterState.rating.length > 0) {
      filtered = filtered.filter(product => 
        filterState.rating.includes(Math.floor(product.rating))
      );
    }

    // Discount filter - assuming discount is calculated from original and current price
    if (filterState.discount.length > 0) {
      filtered = filtered.filter(product => {
        const variant = product.variants?.[0];
        const size = variant?.sizes?.[0];
        if (!size) return false;
        
        const discount = ((size.price - size.discountPrice) / size.price) * 100;
        return filterState.discount.some(d => {
          const threshold = parseInt(d);
          return discount >= threshold;
        });
      });
    }

    setFilteredProducts(filtered);
  };

  // Update filters and trigger re-filtering
  const updateFilters = (newFilters) => {
    setFilterState(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  useEffect(() => {
    applyFilters();
  }, [filterState, products]);

  return (
    <FilterContext.Provider value={{ filterState, updateFilters }}>
      <Box>
        <Header />
        <Slider />
        <Box className="flex">
          <Filter />
          <Products products={filteredProducts} />
        </Box>
        <Footer />
      </Box>
    </FilterContext.Provider>
  );
}