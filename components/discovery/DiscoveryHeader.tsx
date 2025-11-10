import { useEffect, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

export default function DiscoveryHeader({
  activeTypes,
  onTypesChange,
  onQueryChange,
}: {
  activeTypes: string[];
  onTypesChange: (types: string[]) => void;
  onQueryChange: (q: string) => void;
}) {
  const [q, setQ] = useState("");
  const debounced = useDebouncedValue(q, 350);

  useEffect(() => {
    onQueryChange(debounced);
    if (debounced) {
      window.dataLayer?.push({
        event: "discovery_search_typing",
        q: debounced,
      });
    }
  }, [debounced, onQueryChange]);

  return (
    <header className="mb-4">
      <h1 className="h2">Explore Our Community</h1>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search providers, services, jobs, candidates…"
            className="w-full rounded-[var(--r-lg)] border border-[var(--border)] bg-[color:color-mix(in_oklab,var(--card-900) 85%,transparent)] backdrop-blur-[6px] px-4 py-2 text-[var(--ink-900)] outline-none focus:ring-2 focus:ring-[var(--accent-500)]"
          />
        </div>
        <TypeChips active={activeTypes} onChange={onTypesChange} />
      </div>
    </header>
  );
}

function Chip({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1 text-sm transition",
        active
          ? "border-[var(--accent-500)] ring-2 ring-[var(--accent-500)]"
          : "border-[var(--border)] hover:border-[var(--muted-400)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function TypeChips({
  active,
  onChange,
}: {
  active: string[];
  onChange: (v: string[]) => void;
}) {
  const opts = ["service", "provider", "job", "candidate", "organization"];
  return (
    <div className="flex gap-2">
      {opts.map((o) => (
        <Chip
          key={o}
          active={active.includes(o)}
          onClick={() => {
            const next = active.includes(o)
              ? active.filter((x) => x !== o)
              : [...active, o];
            onChange(next);
            window.dataLayer?.push({
              event: "discovery_search_type_toggle",
              types: next,
            });
          }}
        >
          {o[0].toUpperCase() + o.slice(1)}
        </Chip>
      ))}
    </div>
  );
}
