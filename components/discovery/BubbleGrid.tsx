import { motion, AnimatePresence } from "framer-motion";

export type L1 = { slug: string; name: string };

export default function BubbleGrid({
  items,
  active,
  onSelect,
}: {
  items: L1[];
  active?: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((it) => {
        const isActive = active === it.slug;
        return (
          <button
            key={it.slug}
            onClick={() => onSelect(it.slug)}
            className={[
              "rounded-full border px-4 py-2 text-left transition",
              isActive
                ? "border-[var(--accent-500)] ring-2 ring-[var(--accent-500)]"
                : "border-[var(--border)] hover:border-[var(--muted-400)]",
            ].join(" ")}
          >
            {it.name}
          </button>
        );
      })}
    </div>
  );
}
