import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Header from "./components/header";
import Slider from "./components/slider";
import Footer from "./components/footer";
import Products from "./components/products";
import Filter from "./components/filter";
// import NewArrival from "./components/newArivals";

export default function Home() {
  return (
    <>
      <Header />
      <Slider />
      {/* <NewArrival/> */}
      <div style={{display:"flex"}}>
        <Filter />
        <Products />
      </div>
      <Footer />
    </>
  );
}
