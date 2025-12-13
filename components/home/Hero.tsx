// components/home/HomeHero.tsx
import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Briefcase, GraduationCap, Package, Wrench } from "lucide-react";

type TabId = "services" | "products" | "courses";

const SEARCH_TABS: Array<{ id: TabId; label: string }> = [
  { id: "services", label: "Services" },
  { id: "products", label: "Products" },
  { id: "courses", label: "Courses & Certs" },
];

export function HomeHero() {
  const [activeTab, setActiveTab] = useState<TabId>("services");
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Search", { query: query.trim(), kind: activeTab });
  };

  return (
    <section
      className="
        relative overflow-hidden
        bg-[var(--bg-950)] text-[var(--ink-900)]
        
      "
    >
      {/* Background video */}
      <div className="pointer-events-none absolute inset-0">
        <video
          className="h-full w-full object-cover opacity-30"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/video/providers-wall.mp4" type="video/mp4" />
        </video>

        {/* Dark veil */}
        <div className="absolute inset-0 bg-[var(--grad-hero)]" />
        <div className="absolute inset-0 bg-[rgba(6,20,46,0.55)]" />
      </div>

      {/* HERO LAYOUT WRAPPER
          - Mobile: comfortable top/bottom padding
          - Tablet: NOT full-screen; capped height so it doesn’t look like a giant poster
          - Desktop: can go tall again
      */}
      <div
        className="
          relative mx-auto max-w-full
          px-4 sm:px-6 lg:px-10
          pt-14 pb-10 sm:pt-16 sm:pb-12
          md:pt-14 md:pb-12
          lg:pt-20 lg:pb-16
        "
      >
        <div
          className="
            mx-auto w-full max-w-6xl
            rounded-[var(--r-lg)]
            bg-[var(--glass-bg)] ring-1 ring-[var(--glass-ring)]
            shadow-[var(--glass-shadow)] backdrop-blur-md
            px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10

            /* KEY UX FIXES */
            md:max-h-[640px] md:overflow-hidden
            lg:max-h-none
          "
        >
          <div className="grid gap-8 md:grid-cols-[1.1fr_3.9fr] md:gap-10">
            {/* LEFT RAIL */}
            <aside
              className="
                order-2 flex w-full flex-col
                rounded-[var(--r-md)]
                border border-[var(--border)]
                bg-[rgba(12,33,71,0.55)]
                p-5 shadow-[var(--shadow-soft)] backdrop-blur-2xl
                md:order-1
              "
            >
              <Link
                href="/"
                className="mb-6 flex items-center justify-center gap-2 md:justify-start"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[var(--r-sm)] bg-[var(--blue-600)]">
                  <span className="text-xs font-semibold tracking-tight text-[var(--bg-950)]">
                    WA
                  </span>
                </div>
                <span className="text-lg font-semibold tracking-tight text-[var(--ink-900)]">
                  WorkinAnts
                </span>
              </Link>

              <div>
                <h2 className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-700)] md:text-left">
                  Browse by Category
                </h2>

                <div className="mt-4 space-y-3 text-sm">
                  <CategoryRow
                    icon={GraduationCap}
                    label="Courses & Certs"
                    href="/discovery?q=courses"
                  />
                  <CategoryRow
                    icon={Briefcase}
                    label="Jobs"
                    href="/discovery?q=jobs"
                  />
                  <CategoryRow
                    icon={Package}
                    label="Products"
                    href="/discovery?q=products"
                  />
                  <CategoryRow
                    icon={Wrench}
                    label="Services"
                    href="/discovery?q=services"
                  />
                </div>
              </div>
            </aside>

            {/* MAIN */}
            <div className="order-1 flex flex-col md:order-2">
              {/* Nav (tablet/desktop only) */}
              <header className="mb-6 hidden flex-wrap items-center justify-center gap-6 text-sm md:flex">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/about">About</NavLink>
                <NavLink href="/how-it-works">How It Works</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>
                <NavLink href="/legal/user-agreement">User Agreement</NavLink>
              </header>

              {/* Content: remove “full height centering” on tablet; it caused the giant poster feel */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <h1 className="mt-1 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                    Any Service
                  </h1>
                  <p className="mt-2 text-lg font-medium text-[var(--ink-900)]/90 sm:text-xl">
                    Anytime, Anywhere
                  </p>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--ink-700)] sm:text-base">
                    Discover services, products, jobs, and courses from
                    providers across the map — all in one place.
                  </p>
                </div>

                <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-[var(--ink-700)]">
                  {SEARCH_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={[
                          "flex items-center gap-2 rounded-full border px-3 py-1.5 transition",
                          isActive
                            ? "border-[var(--aqua-300)] bg-[rgba(41,160,255,0.14)] text-[var(--ink-900)] shadow-[0_0_0_1px_rgba(125,211,252,0.35)]"
                            : "border-[var(--border)] bg-[rgba(6,20,46,0.35)] text-[var(--ink-700)] hover:border-[var(--border-strong)]",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "flex h-3 w-3 items-center justify-center rounded-full border transition",
                            isActive
                              ? "border-[var(--aqua-300)] bg-[var(--aqua-300)]"
                              : "border-[var(--border-strong)] bg-transparent",
                          ].join(" ")}
                          aria-hidden
                        >
                          {isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--bg-950)]" />
                          )}
                        </span>
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-2 flex w-full flex-col items-center gap-2"
                >
                  <label className="sr-only" htmlFor="hero-search">
                    Search WorkinAnts
                  </label>

                  <div
                    className="
                      flex w-full max-w-2xl overflow-hidden
                      rounded-[var(--r-md)]
                      border border-[var(--border)]
                      bg-[rgba(6,20,46,0.55)]
                      shadow-[0_25px_60px_rgba(0,0,0,0.45)]
                      backdrop-blur
                    "
                  >
                    <input
                      id="hero-search"
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="What can we help you with?"
                      className="
                        flex-1 border-0 bg-transparent px-4 py-3.5
                        text-sm text-[var(--ink-900)]
                        placeholder:text-[var(--ink-700)]
                        focus:outline-none focus:ring-0
                      "
                    />
                    <button
                      type="submit"
                      className="
                        bg-[var(--blue-600)] px-6 py-3.5 text-sm
                        font-semibold text-[var(--ink-900)]
                        transition hover:brightness-110
                      "
                    >
                      Search
                    </button>
                  </div>

                  <button
                    type="button"
                    className="
                      mx-auto w-full max-w-2xl self-start text-left
                      text-xs font-medium text-[var(--ink-700)]
                      underline-offset-2 hover:underline
                    "
                  >
                    Advanced Search
                  </button>
                </form>

                <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--ink-700)]">
                  <span className="rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.04)] px-3 py-1">
                    Verified providers
                  </span>
                  <span className="rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.04)] px-3 py-1">
                    Secure payments
                  </span>
                  <span className="rounded-full border border-[var(--border)] bg-[rgba(255,255,255,0.04)] px-3 py-1">
                    Transparent reviews
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-[var(--ink-700)] md:hidden">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/how-it-works">How It Works</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
            <NavLink href="/legal/user-agreement">Agreement</NavLink>
          </div>
        </div>

        {/* Subtle scroll cue (tablet/desktop) */}
      </div>
    </section>
  );
}

type CategoryRowProps = {
  icon: LucideIcon;
  label: string;
  href: string;
};

function CategoryRow({ icon: Icon, label, href }: CategoryRowProps) {
  return (
    <Link
      href={href}
      className="
        flex w-full items-center gap-3 rounded-[var(--r-sm)]
        border border-[var(--border)]
        bg-[rgba(6,20,46,0.35)]
        px-3 py-2.5
        text-left text-[var(--ink-900)]
        transition
        hover:bg-[rgba(16,48,98,0.35)]
        hover:border-[var(--border-strong)]
      "
    >
      <span
        className="
          flex h-4 w-4 items-center justify-center rounded-[6px]
          border border-[rgba(125,211,252,0.55)]
          bg-[rgba(41,160,255,0.16)]
          text-[10px] text-[var(--aqua-300)]
        "
        aria-hidden
      >
        ✓
      </span>

      <Icon className="h-4 w-4 text-[var(--ink-900)]" aria-hidden />
      <span className="text-xs font-medium text-[var(--ink-900)]/90">
        {label}
      </span>
    </Link>
  );
}

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="relative text-sm font-medium text-[var(--ink-700)] hover:text-[var(--ink-900)]"
    >
      <span className="after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[var(--muted-400)] after:transition-all hover:after:w-full">
        {children}
      </span>
    </Link>
  );
}
