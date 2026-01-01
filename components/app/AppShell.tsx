// components/app/AppShell.tsx
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type Props = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
};

type BP = "mobile" | "tablet" | "desktop";

/**
 * AppShell responsibilities:
 * - grid layout using CSS vars for sidebar widths + topbar height
 * - responsive: desktop expanded, tablet collapsed, mobile hides sidebar (drawer stub)
 * - main is the scroll container; topbar is sticky
 * - accessible landmarks: nav, header, main
 */
export default function AppShell({ sidebar, topbar, children }: Props) {
  const [bp, setBp] = useState<BP>("desktop");

  useEffect(() => {
    const mMobile = window.matchMedia("(max-width: 767px)");
    const mTablet = window.matchMedia(
      "(min-width: 768px) and (max-width: 1023px)"
    );

    const apply = () => {
      if (mMobile.matches) return setBp("mobile");
      if (mTablet.matches) return setBp("tablet");
      return setBp("desktop");
    };

    apply();
    mMobile.addEventListener("change", apply);
    mTablet.addEventListener("change", apply);

    return () => {
      mMobile.removeEventListener("change", apply);
      mTablet.removeEventListener("change", apply);
    };
  }, []);

  const sidebarCol =
    bp === "desktop"
      ? "var(--sidebar-w, 280px)"
      : bp === "tablet"
      ? "var(--sidebar-w-collapsed, 88px)"
      : "1fr";

  return (
    <div
      data-bp={bp}
      style={{
        minHeight: "100vh",
        background: "var(--bg-950)",
        color: "var(--ink-900)",
      }}
    >
      <div
        style={{
          height: "100vh",
          display: "grid",
          gridTemplateColumns: bp === "mobile" ? "1fr" : `${sidebarCol} 1fr`,
          gridTemplateRows: "minmax(var(--topbar-h, 72px), auto) 1fr",
        }}
      >
        {/* Sidebar */}
        <nav
          aria-label="Primary navigation"
          style={{
            gridColumn: bp === "mobile" ? "1 / -1" : "1 / 2",
            gridRow: bp === "mobile" ? "2 / 3" : "1 / 3",
            borderRight: bp === "mobile" ? "none" : "1px solid var(--border)",
            padding: 12,
            overflow: "hidden",
            display: bp === "mobile" ? "none" : "block", // drawer stub
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {sidebar}
        </nav>

        {/* Topbar */}
        <header
          style={{
            gridColumn: bp === "mobile" ? "1 / -1" : "2 / 3",
            gridRow: "1 / 2",
            borderBottom: "1px solid var(--border)",
            padding: 12,
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "rgba(6, 20, 46, 0.72)",
            backdropFilter: "blur(10px)",
            overflow: "visible", // keep visible; row now grows so no overlap
          }}
        >
          {topbar}
        </header>

        {/* Main scroll container */}
        <main
          id="main"
          tabIndex={-1}
          style={{
            gridColumn: bp === "mobile" ? "1 / -1" : "2 / 3",
            gridRow: "2 / 3",
            overflowY: "auto",
            padding: 16,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
