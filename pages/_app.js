// pages/_app.js
import Layout from "@/components/layout/Layout";
import "@/styles/globals.css";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  // Example: simple first-party UTM capture (placeholder)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utm_source = params.get("utm_source");
      if (utm_source) {
        localStorage.setItem("utm_source", utm_source);
      }
    } catch {}
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

