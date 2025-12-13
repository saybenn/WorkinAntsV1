// components/home/HomeHero.tsx
import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Package,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const SEARCH_TABS = [
  { id: "services", label: "Services" },
  { id: "products", label: "Products" },
  { id: "courses", label: "Courses & Certs" },
] as const;

type SearchTabId = (typeof SEARCH_TABS)[number]["id"];

export function HomeHero() {
  const [activeTab, setActiveTab] = useState<SearchTabId>("services");
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: wire into real search route / API (Algolia)
    // router.push(`/search?kind=${activeTab}&q=${encodeURIComponent(query.trim())}`)
    console.log("Search", { query: query.trim(), activeTab });
  };

  return (
    <section
      className="
        relative overflow-hidden
        bg-[var(--bg-950)] text-[var(--ink-900)]
        min-h-[100svh] md:min-h-0
      "
    >
      {/* Background video */}
      <div className="pointer-events-none absolute inset-0">
        <video
          className="h-full w-full object-cover opacity-35"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/video/providers-wall.mp4" type="video/mp4" />
        </video>

        {/* Dark veil */}
        <div
          className="
            absolute inset-0
            bg-[radial-gradient(circle_at_top_left,rgba(41,160,255,0.22)_0,transparent_55%)]
            opacity-60
          "
        />
        <div className="absolute inset-0 bg-[var(--grad-hero)]" />
        <div className="absolute inset-0 bg-[color:var(--bg-950)]/70" />
      </div>

      {/* Content wrapper (safe-area aware; does NOT force full-screen on tablet/desktop) */}
      <div
        className="
          relative mx-auto max-w-6xl
          px-4 sm:px-6 lg:px-8

          pt-[calc(env(safe-area-inset-top)+5.5rem)]
          pb-10

          sm:pt-16 sm:pb-12
          md:pt-10 md:pb-12
          lg:pt-14 lg:pb-16
        "
      >
        {/* Hero card */}
        <div
          className="
            relative overflow-visible
            rounded-[var(--r-lg)]
            border border-[var(--border)]
            bg-[var(--glass-bg)]
            shadow-[var(--glass-shadow)]
            ring-1 ring-[rgba(255,255,255,0.08)]
            backdrop-blur-md
            px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10
          "
        >
          {/* Inner grid */}
          <div className="grid gap-6 md:grid-cols-5 md:gap-8">
            {/* Sidebar (mobile: below; md+: left) */}
            <aside
              className="
                order-2
                flex w-full flex-col
                rounded-[var(--r-md)]
                border border-[rgba(41,160,255,0.35)]
                bg-[rgba(17,59,116,0.45)]
                shadow-[0_20px_55px_rgba(6,20,46,0.75)]
                backdrop-blur-2xl
                px-5 py-5
                md:order-1 md:col-span-1
              "
            >
              {/* Logo */}
              <Link
                href="/"
                className="mb-5 flex items-center justify-center gap-2 md:justify-start"
              >
                <div
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-[var(--r-sm)]
                    bg-[var(--blue-500)]
                    text-[var(--bg-950)]
                    shadow-[0_12px_30px_rgba(41,160,255,0.25)]
                  "
                >
                  <span className="text-xs font-semibold tracking-tight">
                    WA
                  </span>
                </div>
                <span className="text-base font-semibold tracking-tight">
                  WorkinAnts
                </span>
              </Link>

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
            </aside>

            {/* Main (mobile: top; md+: right) */}
            <div className="order-1 flex flex-col md:order-2 md:col-span-4">
              {/* Top nav (show on md+, but keep subtle) */}
              <header className="mb-6 hidden items-center justify-center gap-6 text-sm text-[var(--ink-700)] md:flex">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/about">About</NavLink>
                <NavLink href="/how-it-works">How It Works</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>
                <NavLink href="/legal/user-agreement">User Agreement</NavLink>
              </header>

              {/* Copy */}
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-700)]">
                  WorkinAnts Marketplace
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  Any Service
                </h1>

                <p className="mt-2 text-base font-medium text-[rgba(255,255,255,0.9)] sm:text-lg">
                  Anytime, Anywhere
                </p>

                <p className="mt-3 max-w-xl text-sm text-[var(--ink-700)] sm:text-base">
                  Discover services, products, jobs, and courses from providers
                  across the map — all in one place.
                </p>
              </div>

              {/* Tabs */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
                {SEARCH_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={[
                        "flex items-center gap-2 rounded-[var(--r-pill)] border px-3 py-1.5 transition",
                        isActive
                          ? "border-[rgba(125,211,252,0.7)] bg-[rgba(41,160,255,0.18)] text-[var(--ink-900)] shadow-[0_0_0_1px_rgba(125,211,252,0.35)]"
                          : "border-[rgba(255,255,255,0.18)] bg-[rgba(6,20,46,0.55)] text-[var(--ink-700)] hover:border-[rgba(255,255,255,0.28)]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-3 w-3 items-center justify-center rounded-full border transition",
                          isActive
                            ? "border-[rgba(125,211,252,0.9)] bg-[var(--aqua-300)]"
                            : "border-[rgba(255,255,255,0.28)] bg-[rgba(6,20,46,0.9)]",
                        ].join(" ")}
                        aria-hidden="true"
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

              {/* Search */}
              <form
                onSubmit={handleSubmit}
                className="mt-5 flex w-full flex-col items-center gap-2"
              >
                <label className="sr-only" htmlFor="hero-search">
                  Search WorkinAnts
                </label>

                <div
                  className="
                    flex w-full max-w-2xl overflow-hidden
                    rounded-[var(--r-lg)]
                    border border-[rgba(255,255,255,0.18)]
                    bg-[rgba(6,20,46,0.72)]
                    shadow-[0_24px_60px_rgba(0,0,0,0.45)]
                  "
                >
                  <input
                    id="hero-search"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What can we help you with?"
                    className="
                      flex-1 border-0 bg-transparent
                      px-4 py-3.5 text-sm
                      text-[var(--ink-900)]
                      placeholder:text-[rgba(180,176,176,0.75)]
                      focus:outline-none focus:ring-0
                    "
                  />
                  <button
                    type="submit"
                    className="
                      bg-[var(--blue-600)]
                      px-6 py-3.5 text-sm font-semibold
                      text-[var(--bg-950)]
                      transition hover:brightness-110
                    "
                  >
                    Search
                  </button>
                </div>

                <button
                  type="button"
                  className="
                    w-full max-w-2xl text-left text-xs font-medium
                    text-[var(--ink-700)]
                    underline-offset-2 hover:underline
                  "
                >
                  Advanced Search
                </button>
              </form>
            </div>
          </div>
        </div>
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
        flex w-full items-center gap-3
        rounded-[var(--r-md)]
        border border-[rgba(255,255,255,0.14)]
        bg-[rgba(6,20,46,0.55)]
        px-3 py-2.5
        text-left
        text-[var(--ink-900)]
        transition
        hover:border-[rgba(125,211,252,0.45)]
        hover:bg-[rgba(6,20,46,0.7)]
      "
    >
      <span
        className="
          flex h-7 w-7 items-center justify-center
          rounded-[var(--r-sm)]
          border border-[rgba(125,211,252,0.45)]
          bg-[rgba(41,160,255,0.15)]
          text-[10px]
          text-[var(--ink-900)]
        "
        aria-hidden="true"
      >
        ✓
      </span>

      <Icon className="h-4 w-4 text-[rgba(255,255,255,0.9)]" aria-hidden />
      <span className="text-xs font-medium">{label}</span>
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
      className="
        relative text-sm font-medium
        text-[var(--ink-700)]
        hover:text-[var(--ink-900)]
      "
    >
      <span className="after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[rgba(255,255,255,0.55)] after:transition-all hover:after:w-full">
        {children}
      </span>
    </Link>
  );
}
