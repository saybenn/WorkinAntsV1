// components/home/HomeHero.tsx
import { useState } from "react";
import Link from "next/link";
import { Briefcase, GraduationCap, Package, Wrench } from "lucide-react";

const SEARCH_TABS = [
  { id: "services", label: "Services" },
  { id: "products", label: "Products" },
  { id: "courses", label: "Courses & Certs" },
];

export function HomeHero() {
  const [activeTab, setActiveTab] = useState<string>("services");
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire into your real search route / API or push to /discovery
    console.log("Search", { query, activeTab });
  };

  return (
    <section className="relative h-[var(--fill)] w-[var(--fill)] min-h-screen overflow-hidden bg-slate-950 text-slate-50">
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
        {/* Dark veil so the UI stays readable but video still shows */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/80 to-slate-900/85" />
      </div>

      {/* Hero card */}
      <div className="relative mx-auto flex min-h-screen max-w-full items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full rounded-[2rem] bg-slate-950/10 ring-1 ring-white/8 shadow-[0_30px_90px_rgba(15,23,42,0.9)] backdrop-blur-md px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 md:grid-cols-5 md:gap-10">
            {/* LEFT 1/5: Logo + Sidebar (below hero on mobile) */}
            <aside className="order-2 flex w-full flex-col rounded-2xl border border-sky-500/40 bg-sky-900/65 px-5 py-5 shadow-[0_20px_55px_rgba(8,47,73,0.9)] backdrop-blur-3xl md:order-1 md:col-span-1">
              {/* Logo block */}
              <Link
                href="/"
                className="mb-6 flex items-center gap-2 md:justify-start justify-center"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500">
                  <span className="text-xs font-semibold tracking-tight text-slate-950">
                    WA
                  </span>
                </div>
                <span className="text-lg font-semibold tracking-tight">
                  WorkinAnts
                </span>
              </Link>

              {/* Sidebar card */}
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-100/90 text-center md:text-left">
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

            {/* RIGHT 4/5: Nav + Hero content (on top on mobile) */}
            <div className="order-1 flex flex-col md:order-2 md:col-span-4">
              {/* Nav INSIDE the container, aligned to the right 4/5 — desktop only */}
              <header className="mb-8 hidden items-center justify-center gap-8 text-sm text-slate-100/85 md:flex">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/about">About</NavLink>
                <NavLink href="/how-it-works">How It Works</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>
                <NavLink href="/legal/user-agreement">User Agreement</NavLink>
              </header>

              {/* Main hero content, centered in remaining space */}
              <div className="flex flex-1 flex-col justify-center gap-6 pb-2 pt-2">
                <div className="flex flex-col items-center justify-center text-center">
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                    Any Service
                  </h1>
                  <p className="mt-2 text-lg font-medium text-slate-200/95 sm:text-xl">
                    Anytime, Anywhere
                  </p>
                  <p className="mt-4 max-w-xl text-sm text-slate-200/80">
                    Discover services, products, jobs, and courses from
                    providers across the map — all in one place.
                  </p>
                </div>

                {/* Search type toggle */}
                <div className="mt-1 flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-slate-100/80">
                  {SEARCH_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
                        activeTab === tab.id
                          ? "border-sky-400 bg-sky-500/20 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.5)]"
                          : "border-slate-600/80 bg-slate-900/70 text-slate-200/85 hover:border-slate-400/70"
                      }`}
                    >
                      <span
                        className={`flex h-3 w-3 items-center justify-center rounded-full border transition ${
                          activeTab === tab.id
                            ? "border-sky-400 bg-sky-400"
                            : "border-slate-500/80 bg-slate-900"
                        }`}
                      >
                        {activeTab === tab.id && (
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                        )}
                      </span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search bar */}
                <form
                  onSubmit={handleSubmit}
                  className="mt-2 flex w-full flex-col items-center gap-2"
                >
                  <label className="sr-only" htmlFor="hero-search">
                    Search WorkinAnts
                  </label>
                  <div className="flex w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/85 shadow-[0_25px_60px_rgba(15,23,42,0.95)] md:w-3/4">
                    <input
                      id="hero-search"
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="What can we help you with"
                      className="flex-1 border-0 bg-transparent px-4 py-3.5 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                    />
                    <button
                      type="submit"
                      className="bg-sky-500 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:brightness-110"
                    >
                      Search
                    </button>
                  </div>
                  <button
                    type="button"
                    className="mx-auto w-full max-w-2xl self-start text-left text-xs font-medium text-slate-200/80 underline-offset-2 hover:underline"
                  >
                    Advanced Search
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type CategoryRowProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
};

function CategoryRow({ icon: Icon, label, href }: CategoryRowProps) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-3 rounded-xl bg-slate-900/80 px-3 py-2.5 text-left text-slate-100/90 ring-1 ring-slate-700/90 transition hover:bg-slate-800 hover:ring-sky-400/70"
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-[6px] border border-sky-400/70 bg-sky-500/20 text-[10px] text-sky-100">
        ✓
      </span>
      <Icon className="h-4 w-4 text-slate-100/90" aria-hidden="true" />
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
      className="relative text-sm font-medium text-slate-100/85 hover:text-white"
    >
      <span className="after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-slate-100/80 after:transition-all hover:after:w-full">
        {children}
      </span>
    </Link>
  );
}
