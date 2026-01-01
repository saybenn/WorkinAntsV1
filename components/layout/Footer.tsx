// components/layout/Footer.tsx
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "../../lib/cn";

type FooterAudience =
  | "Clients"
  | "Professionals"
  | "Candidates"
  | "Organizations";

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  title: FooterAudience | "WorkinAnts";
  links: FooterLink[];
};

type Props = {
  className?: string;
  cityLabel?: string; // e.g. "Virginia Beach, VA"
  year?: number; // override if needed
};

function FooterAccordionColumn({ col }: { col: FooterColumn }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-white/90">{col.title}</span>
        <span
          className={cn(
            "text-white/70 transition-transform",
            open ? "rotate-180" : "rotate-0"
          )}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      <div className={open ? "block" : "hidden"}>
        <ul className="px-4 pb-4">
          {col.links.map((l) => (
            <li key={l.href} className="py-1">
              <Link
                href={l.href}
                className="text-sm text-white/70 hover:text-white transition"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Footer({
  className = "",
  cityLabel = "Virginia Beach, VA",
  year,
}: Props) {
  const currentYear = year ?? new Date().getFullYear();

  const columns: FooterColumn[] = useMemo(
    () => [
      {
        title: "WorkinAnts",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Blog", href: "/blog" },
          { label: "Careers", href: "/careers" },
        ],
      },
      {
        title: "Clients",
        links: [
          { label: "Create Your Account", href: "/signup?mode=client" },
          { label: "Ant Stamp Rewards", href: "/rewards" },
          { label: "Client Dashboard", href: "/dashboard/client" },
          { label: "Browse Services", href: "/services" },
          { label: "Browse Courses", href: "/courses" },
          { label: "Browse Products", href: "/products" },
          { label: "Pricing & Fees", href: "/pricing" },
        ],
      },
      {
        title: "Professionals",
        links: [
          { label: "Create Your Account", href: "/signup?mode=professional" },
          { label: "Professional Rewards", href: "/rewards" },
          { label: "Pricing & Fees", href: "/pricing" },
          { label: "Sell Your Services", href: "/sell/services" },
          { label: "Sell Your Courses", href: "/sell/courses" },
          { label: "Sell Your Products", href: "/sell/products" },
        ],
      },
      {
        title: "Candidates",
        links: [
          { label: "Create Your Account", href: "/signup?mode=candidate" },
          { label: "Candidate Dashboard", href: "/dashboard/candidate" },
          { label: "Browse Jobs", href: "/jobs" },
          { label: "Career Resources", href: "/resources/careers" },
          { label: "Pricing & Fees", href: "/pricing" },
          { label: "Sign Up for Alerts", href: "/alerts" },
        ],
      },
      {
        title: "Organizations",
        links: [
          { label: "Create Your Account", href: "/signup?mode=org" },
          { label: "Organization Dashboard", href: "/dashboard/org" },
          { label: "Employer Solutions", href: "/organizations/solutions" },
          { label: "Post a Job", href: "/jobs/post" },
          { label: "Pricing & Fees", href: "/pricing" },
        ],
      },
    ],
    []
  );

  const supportLegal: FooterLink[] = useMemo(
    () => [
      { label: "Contact Us", href: "/contact" },
      { label: "Help Center / FAQ", href: "/help" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
    []
  );

  return (
    <footer className={cn("bg-ink-950 px-4 pb-10 pt-16 sm:pt-20", className)}>
      <div className="mx-auto max-w-6xl">
        <div
          className={cn(
            "rounded-[28px]",
            "border border-white/15",
            "bg-white/10",
            "shadow-[0_40px_120px_rgba(0,0,0,0.35)]",
            "backdrop-blur-xl"
          )}
        >
          {/* Top mission */}
          <div className="px-6 pt-10 text-center sm:px-10 sm:pt-12">
            <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Building a better ecosystem where talent thrives
              <br className="hidden sm:block" /> and trust comes standard.
            </p>
          </div>

          {/* Desktop columns */}
          <div className="hidden px-10 pb-10 pt-10 lg:block">
            <div className="grid grid-cols-5 gap-10">
              {columns.map((col) => (
                <div key={col.title}>
                  <p className="text-sm font-semibold text-white/90">
                    {col.title}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="text-sm text-white/70 hover:text-white transition"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <p className="text-xl font-semibold text-white/90">
                Support &amp; Legal
              </p>
              <div className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
                {supportLegal.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm text-white/70 hover:text-white transition"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter (desktop) */}
            <div className="mt-10 border-t border-white/10 pt-8">
              <div className="flex items-end justify-between gap-8">
                <div className="max-w-xl">
                  <p className="text-sm font-semibold text-white/90">
                    Newsletter
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    Get product updates, new releases, and platform
                    improvements. No spam.
                  </p>
                </div>

                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex w-full max-w-md items-center gap-2"
                >
                  <label className="sr-only" htmlFor="footer-email">
                    Email
                  </label>
                  <input
                    id="footer-email"
                    type="email"
                    placeholder="you@example.com"
                    className={cn(
                      "h-11 w-full rounded-xl",
                      "border border-white/15",
                      "bg-white/10 px-4 text-sm text-white",
                      "placeholder:text-white/50",
                      "outline-none focus:border-white/25"
                    )}
                  />
                  <button
                    type="submit"
                    className={cn(
                      "h-11 flex-shrink-0 rounded-xl",
                      "bg-black text-ink-950",
                      "px-4 text-sm font-semibold",
                      "hover:bg-white/30 transition hover:cursor-pointer"
                    )}
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-10 border-t border-white/10 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
                <p>© {currentYear} WorkinAnts, All rights reserved.</p>
                <p>Built in the USA, located in {cityLabel}.</p>
              </div>
            </div>
          </div>

          {/* Mobile / tablet: accordions + newsletter */}
          <div className="px-6 pb-10 pt-8 lg:hidden">
            <div className="grid gap-3">
              {columns.map((col) => (
                <FooterAccordionColumn key={col.title} col={col} />
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white/90">
                Support &amp; Legal
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {supportLegal.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-sm text-white/70 hover:text-white transition"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white/90">Newsletter</p>
              <p className="mt-2 text-sm text-white/70">
                Updates, new releases, and platform improvements. No spam.
              </p>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-4 flex items-center gap-2"
              >
                <label className="sr-only" htmlFor="footer-email-mobile">
                  Email
                </label>
                <input
                  id="footer-email-mobile"
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    "h-11 w-full rounded-xl",
                    "border border-white/15",
                    "bg-white/10 px-4 text-sm text-white",
                    "placeholder:text-white/50",
                    "outline-none focus:border-white/25"
                  )}
                />
                <button
                  type="submit"
                  className={cn(
                    "h-11 flex-shrink-0 rounded-xl",
                    "bg-black text-ink-950",
                    "px-4 text-sm font-semibold",
                    "hover:bg-white/30 transition"
                  )}
                >
                  Go
                </button>
              </form>
            </div>

            <div className="mt-8 border-t border-white/10 pt-5 text-sm text-white/70">
              <p>© {currentYear} WorkinAnts, All rights reserved.</p>
              <p className="mt-1">Built in the USA, located in {cityLabel}.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
