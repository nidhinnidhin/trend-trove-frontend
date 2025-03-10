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
import ChatBox from "@/components/modals/chatBox";

const clientSideEmotionCache = createEmotionCache();

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
      `
    }
  }
});

export default function App({ Component, pageProps, emotionCache = clientSideEmotionCache }) {
  const router = useRouter()
  const isAdminRoute = router.pathname.startsWith('/admin');

  useEffect(() => {
    setupAxios();

    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Provider store={store}>
        <FilterProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            <style jsx global>{`
              html,
              body {
                padding: 0;
                margin: 0;
                font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
                  Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
                  sans-serif;
              }
              * {
                box-sizing: border-box;
              }
            `}</style>
            <Component {...pageProps} />
            {!isAdminRoute && <ChatBox />}
          </ThemeProvider>
        </FilterProvider>
      </Provider>
    </CacheProvider>
  );
}


