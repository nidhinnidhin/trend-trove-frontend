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

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error:", errorData);
          throw new Error(errorData.message || "Error fetching products");
        }

        const data = await response.json();
        console.log("API response:", data);

        // const transformedProducts = data.products.map((product) => {
        //   let originalPrice = 0;
        //   let discountedPrice = 0;
        //   let discountPercentage = 0;
        
        //   if (product.variants && product.variants.length > 0) {
        //     const variant = product.variants[0];
        //     if (variant.sizes && variant.sizes.length > 0) {
        //       const firstSize = variant.sizes[0];
        //       originalPrice = firstSize.price || 0;
        //       discountedPrice = firstSize.discountPrice || originalPrice;
        
        //       // Check for active offer (either product or category)
        //       if (product.activeOffer) {
        //         discountPercentage = product.activeOffer._id.discountPercentage || 0;
        //         if (!firstSize.discountPrice) {
        //           discountedPrice = originalPrice * (1 - discountPercentage / 100);
        //         }
        //       }
        //     }
        //   }
        
        //   return {
        //     id: product._id,
        //     image: product.variants?.[0]?.mainImage || "",
        //     title: product.name || "Unknown Product",
        //     description: product.description || "",
        //     rating: product.ratings || 0,
        //     price: discountedPrice,
        //     originalPrice: originalPrice,
        //     discountPercentage: discountPercentage,
        //     variantsCount: product.variants?.length || 0,
        //     category: product.category?.name || "Uncategorized",
        //     gender: product.gender || "Unisex",
        //     isDeleted: product.isDeleted || false,
        //   };
        // });

        const transformedProducts = data.products.map((product) => {
          let originalPrice = 0;
          let discountedPrice = 0;
          let discountPercentage = 0;
          let isOfferActive = false;
        
          if (product.variants && product.variants.length > 0) {
            const variant = product.variants[0];
            if (variant.sizes && variant.sizes.length > 0) {
              const firstSize = variant.sizes[0];
              originalPrice = firstSize.price || 0;
              discountedPrice = firstSize.discountPrice || originalPrice;
        
              // Check if the offer is active
              if (product.activeOffer && product.activeOffer._id.isActive) {
                discountPercentage = product.activeOffer._id.discountPercentage || 0;
                isOfferActive = true;
                if (!firstSize.discountPrice) {
                  discountedPrice = originalPrice * (1 - discountPercentage / 100);
                }
              } else {
                discountedPrice = originalPrice;
              }
            }
          }
        
          return {
            id: product._id,
            image: product.variants?.[0]?.mainImage || "",
            title: product.name || "Unknown Product",
            description: product.description || "",
            rating: product.ratings || 0,
            price: discountedPrice,
            originalPrice: originalPrice,
            discountPercentage: isOfferActive ? discountPercentage : 0,
            variantsCount: product.variants?.length || 0,
            category: product.category?.name || "Uncategorized",
            gender: product.gender || "Unisex",
            isDeleted: product.isDeleted || false,
            isOfferActive, 
          };
        });
        
        setProducts(transformedProducts);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Show error to user
        alert("Failed to load products. Please try again later.");
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
