export default function RecommendationCard({
  item,
}: {
  item: {
    id: string;
    type: "service" | "product" | "professional" | "course";
    title: string;
    subtitle?: string;
    rating?: number;
    price?: number;
    href: string;
  };
}) {
  const badge = labelFor(item.type);

  return (
    <a
      href={item.href}
      style={{
        textDecoration: "none",
        color: "var(--ink-900)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 14,
        background: "rgba(255,255,255,0.03)",
        boxShadow: "var(--shadow-soft)",
        display: "grid",
        gap: 10,
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
      >
        <div style={{ fontWeight: 800 }}>{item.title}</div>
        <span
          style={{
            fontSize: 12,
            padding: "4px 8px",
            borderRadius: 999,
            border: "1px solid rgba(125,211,252,0.22)",
            background: "rgba(125,211,252,0.10)",
            color: "var(--ink-800)",
            height: "fit-content",
          }}
        >
          {badge}
        </span>
      </div>

      {item.subtitle && (
        <div style={{ color: "var(--ink-700)" }}>{item.subtitle}</div>
      )}

      <div style={{ display: "flex", gap: 10, color: "var(--ink-700)" }}>
        {typeof item.rating === "number" && (
          <span>★ {item.rating.toFixed(1)}</span>
        )}
        {typeof item.price === "number" && <span>From ${item.price}</span>}
      </div>
    </a>
  );
}

function labelFor(t: string) {
  if (t === "professional") return "Professional";
  if (t === "course") return "Course";
  if (t === "product") return "Product";
  return "Service";
}
