// components/layout/Layout.jsx
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ title = "Workin Ants", children }) {
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
      {/* Only show global header on non-home pages */}
      <Header /> <div className="h-16"></div>
      <main>{children}</main>
      <Footer />
    </>
  );
}
