import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { FilterProvider } from "@/context/filterContext";
import { Provider } from "react-redux";
import store from "../redux/store";

const theme = createTheme();

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("usertoken");
    if (storedToken && (router.pathname === "/authentication/loginSignup" || router.pathname === "/authentication/login")) {
      router.push("/");
    }
  }, [router.pathname]);

  return (
    <Provider store={store}>
      <FilterProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </FilterProvider>
    </Provider>
  );
}
