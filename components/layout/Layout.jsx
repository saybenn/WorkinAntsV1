// components/layout/Layout.jsx
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ title = "Wellvix", children }) {
  const router = useRouter();
  const isHome = router.pathname === "/";

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
      {!isHome && <Header />}
      {!isHome && <div className="h-16" />}

      <main>{children}</main>

      <Footer />
    </>
  );
}
