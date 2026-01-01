import RecommendationCard from "@/components/dashboard/RecommendationCard";

export default function RecommendationsSection({
  u,
  items,
}: {
  u: string;
  items: any[];
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
        <div style={{ fontWeight: 800 }}>Best Matches for You</div>
        <a
          href="/discovery?sort=popular"
          style={{ color: "var(--aqua-300)", textDecoration: "none" }}
        >
          View all →
        </a>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {items.map((x) => (
          <RecommendationCard key={x.id} item={x} />
        ))}
      </div>
    </section>
  );
}
