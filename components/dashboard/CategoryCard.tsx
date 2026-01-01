export default function CategoryCard({
  name,
  domainSlug,
  categorySlug,
  scope,
}: {
  name: string;
  domainSlug: string;
  categorySlug: string;
  scope: "services" | "products" | "courses";
}) {
  const href = `/discovery?scope=${encodeURIComponent(
    scope
  )}&domain=${encodeURIComponent(domainSlug)}&category=${encodeURIComponent(
    categorySlug
  )}`;

  return (
    <a
      href={href}
      style={{
        display: "grid",
        gap: 8,
        padding: 14,
        borderRadius: 16,
        border: "1px solid var(--border)",
        background: "var(--grad-tile)",
        boxShadow: "var(--shadow-soft)",
        textDecoration: "none",
        color: "var(--ink-900)",
        minHeight: 92,
      }}
    >
      <div style={{ fontWeight: 800 }}>{name}</div>
      <div style={{ color: "var(--ink-700)", fontSize: 13 }}>
        Explore {name.toLowerCase()} options
      </div>
    </a>
  );
}
