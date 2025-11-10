export type L3 = { slug: string; name: string };

export default function TagCloud({
  items,
  active,
  onSelect,
}: {
  items: L3[];
  active?: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((t) => (
        <button
          key={t.slug}
          onClick={() => onSelect(t.slug)}
          className={[
            "rounded-full border px-3 py-1 text-sm transition",
            active === t.slug
              ? "border-[var(--accent-500)] ring-2 ring-[var(--accent-500)]"
              : "border-[var(--border)] hover:border-[var(--muted-400)]",
          ].join(" ")}
        >
          {t.name}
        </button>
      ))}
    </div>
  );
}
