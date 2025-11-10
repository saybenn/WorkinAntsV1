// components/layout/Header.jsx
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-40 transition-all",
        "border-b",
        scrolled
          ? "backdrop-blur bg-[(--glass-900-80)] border-black/10"
          : "bg-transparent border-transparent",
      ].join(" ")}
    >
      <div className="container-px mx-auto flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-semibold tracking-tight text-[(--ink-900)]"
        >
          {process.env.NEXT_PUBLIC_APP_NAME || "Wellvix"}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/services" className="hover:opacity-80">
            Services
          </Link>
          <Link href="/providers" className="hover:opacity-80">
            Providers
          </Link>
          <Link href="/pricing" className="hover:opacity-80">
            Pricing
          </Link>
          <Link href="/login" className="hover:opacity-80">
            Login
          </Link>
        </nav>

        <div className="md:hidden">
          {/* keep minimal for now; add a menu later */}
          <span className="text-sm text-[(--muted-400)]">Menu</span>
        </div>
      </div>
    </header>
  );
}
