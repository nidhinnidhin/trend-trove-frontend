import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { FilterProvider } from '@/context/filterContext';
import Products from './components/products';
import Filter from './components/filter';
import Header from './components/header';
import Footer from './components/footer';
import Slider from './components/slider';
import { Box } from '@mui/material';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/products/get?page=1&limit=8');
        const data = await response.json();
        const transformedProducts = data.products.map(product => {
          const variant = product.variants[0];
          const firstSize = variant.sizes[0];
          return {
            id: product._id,
            image: variant.mainImage,
            title: product.name,
            description: product.description,
            rating: product.ratings || 0,
            price: firstSize.discountPrice || firstSize.price,
            originalPrice: firstSize.price,
            variantsCount: product.variants.length,
            category: product.category?.name,
            gender: product.gender,
            isDeleted: product.isDeleted
          };
        });
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Head>
        <title>E-Commerce Store</title>
        <meta name="description" content="Shop the latest products" />
      </Head>

      <FilterProvider>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <Slider />
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            <Filter />
            <Products products={products} />
          </Box>
          <Footer />
        </Box>
      </FilterProvider>
    </>
  );
}