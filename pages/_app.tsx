import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { createEmotionCache, MantineProvider } from "@mantine/core";

import spoticordLogo from "@images/logo.webp";

const cache = createEmotionCache({ key: "css" });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <title>Spoticord Connect</title>

        <link rel="icon" href={spoticordLogo.src} />
      </Head>

      <MantineProvider
        emotionCache={cache}
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme: "dark", primaryColor: "teal" }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
}

export default MyApp;
