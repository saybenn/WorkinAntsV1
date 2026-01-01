// components/app/TopNav.tsx
import { useEffect, useState } from "react";
import SearchBar from "../shared/SearchBar";
import UserMenu from "./UserMenu";

export type Scope = "services" | "products" | "courses";

type Props = {
  initialScope?: Scope;
  onScopeChange?: (scope: Scope) => void;
  onSearchSubmit: (payload: { q: string; scope: Scope }) => void;
};

/**
 * TopNav responsibilities:
 * - houses SearchBar + scope pills
 * - emits onSearchSubmit (dashboard can switch views without routing pages)
 * - accessible (aria labels handled by SearchBar)
 */
export default function TopNav({
  initialScope = "services",
  onScopeChange,
  onSearchSubmit,
}: Props) {
  const [scope, setScope] = useState<Scope>(initialScope);

  // optional persistence
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("wa_scope");
      if (saved === "services" || saved === "products" || saved === "courses")
        setScope(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("wa_scope", scope);
    } catch {}
    onScopeChange?.(scope);
  }, [scope, onScopeChange]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div style={{ display: "grid", gap: 10 }}>
        <SearchBar
          placeholder="Search services, products, courses…"
          categoryFilters={["services", "products", "courses"]}
          defaultCategory={scope}
          categoryLabelMap={{
            services: "Services",
            products: "Products",
            courses: "Courses",
          }}
          onCategoryChange={(c) => {
            if (c === "services" || c === "products" || c === "courses")
              setScope(c);
          }}
          onSubmit={(q, category) => {
            const nextScope: Scope =
              category === "products"
                ? "products"
                : category === "courses"
                ? "courses"
                : "services";
            onSearchSubmit({ q, scope: nextScope });
          }}
        />
      </div>

      <UserMenu />
    </div>
  );
}
