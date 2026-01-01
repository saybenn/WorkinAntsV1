import CategoryCard from "@/components/dashboard/CategoryCard";

export default function CategoryRail({
  title,
  items,
  u,
  scope,
}: {
  title: string;
  items: any[];
  u: string;
  scope: "services" | "products" | "courses";
}) {
  return (
    <section style={{ display: "grid", gap: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div style={{ fontWeight: 800 }}>{title}</div>
        <a
          href="/discovery"
          style={{ color: "var(--aqua-300)", textDecoration: "none" }}
        >
          View all
        </a>
      </div>

      <div
        style={{
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "minmax(220px, 1fr)",
          gap: 12,
          overflowX: "auto",
          paddingBottom: 6,
          scrollSnapType: "x mandatory",
        }}
      >
        {items.map((c: any) => (
          <div key={c.slug} style={{ scrollSnapAlign: "start" }}>
            <CategoryCard
              name={c.name}
              domainSlug={c.domain_slug}
              categorySlug={c.slug}
              scope={scope}
            />
          </div>
        ))}
        {/* Peek spacer */}
        <div style={{ width: 12 }} />
      </div>
    </section>
  );
}
