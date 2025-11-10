// components/layout/Layout.jsx
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ title = "Wellvix", children }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <meta
          name="description"
          content="Provider-first marketplace for services."
        />
      </Head>

      <Header />
      {/* Spacer so content isn't hidden under fixed header */}
      <div className="h-16" />

      <main>{children}</main>

      <Footer />
    </>
  );
}
