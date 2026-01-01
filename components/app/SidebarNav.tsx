// components/app/SidebarNav.tsx
import type { ReactNode } from "react";

export type DashboardView =
  | "home"
  | "search"
  | "categories"
  | "saved"
  | "orders"
  | "messages"
  | "postJob";

type Props = {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  children?: ReactNode; // inject ModeSwitcher
};

const NAV: { id: DashboardView; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "search", label: "Search" },
  { id: "categories", label: "Categories" },
  { id: "saved", label: "Saved" },
  { id: "orders", label: "Orders" },
  { id: "messages", label: "Messages" },
];

export default function SidebarNav({
  activeView,
  onViewChange,
  children,
}: Props) {
  return (
    <div
      style={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: 12,
      }}
    >
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>WORKING ANTS</div>
        <div style={{ color: "var(--ink-700)", fontSize: 12 }}>Dashboard</div>
      </div>

      <div
        role="navigation"
        aria-label="Dashboard views"
        style={{ display: "grid", gap: 6 }}
      >
        {NAV.map((item) => {
          const active = item.id === activeView;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              aria-current={active ? "page" : undefined}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 12,
                border: `1px solid ${
                  active ? "rgba(41,160,255,0.35)" : "transparent"
                }`,
                background: active ? "rgba(41,160,255,0.10)" : "transparent",
                color: active ? "var(--ink-900)" : "var(--ink-700)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        {children}
      </div>
    </div>
  );
}
