import React, { useEffect, useState } from "react";
import Head from "next/head";
import { FilterProvider, useFilter } from "@/context/filterContext";
import Products from "../components/products";
import Filter from "../components/filter";
import Header from "../components/header";
import Footer from "../components/footer";
import Slider from "../components/slider";
import { Box } from "@mui/material";
import ListProducts from "./listProducts";

export default function Explore() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { filterState } = useFilter();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:9090/api/products/get?page=${currentPage}&limit=8`
        );
        const data = await response.json();

        const transformedProducts = data.products.map((product) => {
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
            isDeleted: product.isDeleted,
          };
        });

        setProducts(transformedProducts);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, filterState]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Head>
        <title>E-Commerce Store</title>
        <meta name="description" content="Shop the latest products" />
      </Head>

      <FilterProvider>
        <Box
          sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
        >
          <Header />
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            <Filter />
            <ListProducts
              products={products}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </Box>
          <Footer />
        </Box>
      </FilterProvider>
    </>
  );
}
