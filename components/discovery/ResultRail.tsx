// /components/discovery/ResultRail.tsx
import { useEffect, useMemo, useRef, useState } from "react";

type DocType = "service" | "provider" | "job" | "candidate" | "organization";

type Doc = {
  id: string;
  type: DocType;
  // title fallbacks
  title?: string;
  name?: string;
  full_name?: string;
  handle?: string;

  description?: string;

  // taxonomy
  category?: string;
  subcategory?: string;
  tags?: string[];

  // meta
  price_min?: number;
  rating?: number;
  rating_count?: number;
  city?: string;
  state?: string;
};

export default function ResultRail({ query }: { query: URLSearchParams }) {
  // Convert URLSearchParams → stable string for deps
  const qs = useMemo(() => query.toString(), [query]);

  const [hits, setHits] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // abort previous
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(undefined);

    fetch(`/api/search?${qs}`, { signal: ctrl.signal })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.hint || j?.error || r.statusText);
        setHits(Array.isArray(j.hits) ? j.hits : []);
      })
      .catch((e) => {
        if (ctrl.signal.aborted) return;
        setHits([]);
        setError(String(e.message || e));
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [qs]);

  return (
    <div className="mt-4 space-y-3">
      {/* status row */}
      {loading && <div className="text-xs opacity-70">Searching…</div>}
      {error && (
        <div className="text-xs text-red-400">Search error: {error}</div>
      )}
      {!loading && !error && hits.length === 0 && (
        <div className="text-xs opacity-70">No results.</div>
      )}

      {/* results */}
      {hits.map((h, i) => (
        <Card key={h.id ?? `${i}`} doc={h} pos={i + 1} />
      ))}
    </div>
  );
}

function Card({ doc, pos }: { doc: Doc; pos: number }) {
  const title =
    doc.title ||
    doc.full_name ||
    doc.name ||
    (doc.handle ? `@${doc.handle}` : "Untitled");

  return (
    <a
      href={hrefFor(doc)}
      className="block rounded-[var(--r-lg)] border border-[var(--border)] p-3 hover:border-[var(--muted-400)]"
      onClick={() => {
        // @ts-ignore
        window.dataLayer?.push?.({
          event: "discovery_result_click",
          type: doc.type,
          id: doc.id,
          position: pos,
        });
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-medium text-[var(--ink-900)]">{title}</div>
          <div className="text-sm text-[var(--ink-700)]">
            {doc.city ? `${doc.city}${doc.state ? ", " + doc.state : ""}` : ""}
          </div>

          {doc.description && (
            <p className="mt-1 line-clamp-2 text-sm text-[var(--ink-700)]">
              {doc.description}
            </p>
          )}

          {!!doc.tags?.length && (
            <div className="mt-2 flex flex-wrap gap-2">
              {doc.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="text-right text-sm">
          {typeof doc.price_min === "number" && <div>${doc.price_min}</div>}
          {typeof doc.rating === "number" && (
            <div>
              ★ {doc.rating.toFixed(1)}{" "}
              {doc.rating_count ? `(${doc.rating_count})` : ""}
            </div>
          )}
          <div className="mt-1 rounded-full border px-3 py-1 text-xs">
            {doc.type}
          </div>
        </div>
      </div>
    </a>
  );
}

function hrefFor(doc: Doc) {
  switch (doc.type) {
    case "service":
      return `/product/${doc.id}`;
    case "provider":
      return `/u/${doc.id}`;
    case "job":
      return `/jobs/${doc.id}`;
    case "candidate":
      return `/candidates/${doc.id}`;
    case "organization":
      return `/org/${doc.id}`;
    default:
      return "#";
  }
}
