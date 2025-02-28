import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useEffect } from "react";
import { FilterProvider } from "@/context/filterContext";
import { Provider } from "react-redux";
import store from "../redux/store";
import '@/styles/globals.css';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../utils/createEmotionCache';
import { setupAxios } from '../utils/setupAxios';
import { useRouter } from "next/router";

const clientSideEmotionCache = createEmotionCache();

const theme = createTheme();

export default function App({ Component, pageProps, emotionCache = clientSideEmotionCache }) {
  const router = useRouter()
  useEffect(() => {
    // Setup global axios configuration
    setupAxios();

    // Remove JSS styles
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

   return (
    <CacheProvider value={emotionCache}>
      <Provider store={store}>
        <FilterProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        </FilterProvider>
      </Provider>
    </CacheProvider>
  );
}


