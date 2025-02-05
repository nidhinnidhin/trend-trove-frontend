import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { FilterProvider } from "@/context/filterContext";


const theme = createTheme(); 

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const token = router.query.token;
    if (token) {
      localStorage.setItem("usertoken", token); 
    }
  }, [router.query]);
  
  return (
    <FilterProvider>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
    </FilterProvider>
  );
}
