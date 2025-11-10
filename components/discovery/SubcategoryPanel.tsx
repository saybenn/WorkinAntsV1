import { motion, AnimatePresence } from "framer-motion";

export type L2 = { slug: string; name: string };

export default function SubcategoryPanel({
  open,
  items,
  active,
  onSelect,
}: {
  open: boolean;
  items: L2[];
  active?: string | null;
  onSelect: (slug: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "tween", duration: 0.25 }}
          className="mt-3 overflow-hidden rounded-[var(--r-lg)] border border-[var(--border)] p-3"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items.map((it) => {
              const isActive = active === it.slug;
              return (
                <button
                  key={it.slug}
                  onClick={() => onSelect(it.slug)}
                  className={[
                    "rounded-lg border px-3 py-2 text-left transition",
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
