import React, { useEffect, useState } from "react";
import Head from "next/head";
import { FilterProvider } from "@/context/filterContext";
import Products from "./components/products";
import Filter from "./components/filter";
import Header from "./components/header";
import Footer from "./components/footer";
import Slider from "./components/slider";
import { Box, Container } from "@mui/material";
import TopBrands from "./components/topBrands";
import Image from "next/image";
import latestProductsBanner from "../media/new arivals banner.png";
import bannerFashion from "../media/bannerfashion.png";
import CategoryCarousel from "./components/categoryCarousal";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:9090/api/products/get?page=1&limit=8"
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
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ px: 2 }}>

      <Head>
        <title>E-Commerce Store</title>
        <meta name="description" content="Shop the latest products" />
      </Head>

      <FilterProvider>
        <Box
          sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
        >
          <Header />
          <Slider />
          {/* <div
            style={{
              // marginTop:"100px",
              width: "100%",
              // height: "30vh",
              margin: "0 auto", 
              display: "flex",
              justifyContent: "center",
              alignItems: "center", 
            }}
          >
            <Image
              src={bannerFashion}
              width={1920}
              // height={1080}
              style={{ width: "100%", objectFit: "contain" }}
              alt="Latest Products Banner"
            />
          </div> */}
          <TopBrands />
          <div
            style={{
              width: "100%",
              height: "100vh",
              margin: "0 auto", 
              display: "flex",
              justifyContent: "center",
              alignItems: "center", 
            }}
          >
            <Image
              src={latestProductsBanner}
              width={1920}
              height={1080}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              alt="Latest Products Banner"
            />
          </div>

          <Box sx={{ display: "flex", flexGrow: 1 }}>
            {/* <Filter /> */}
            <Products products={products} />
          </Box>
          <Footer />
        </Box>
      </FilterProvider>
    </Container>
  );
}
