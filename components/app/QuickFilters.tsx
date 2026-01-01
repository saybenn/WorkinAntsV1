type Scope = "services" | "products" | "courses";

export default function QuickFilters({
  scope,
  onChange,
}: {
  scope: Scope;
  onChange: (scope: Scope) => void;
}) {
  const opts: { value: Scope; label: string }[] = [
    { value: "services", label: "Services" },
    { value: "products", label: "Products" },
    { value: "courses", label: "Courses & Certs" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Search scope"
      style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
    >
      {opts.map((o) => {
        const active = o.value === scope;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              border: `1px solid ${
                active ? "rgba(41,160,255,0.5)" : "var(--border)"
              }`,
              background: active
                ? "rgba(41,160,255,0.12)"
                : "rgba(255,255,255,0.03)",
              color: active ? "var(--ink-900)" : "var(--ink-700)",
              cursor: "pointer",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
