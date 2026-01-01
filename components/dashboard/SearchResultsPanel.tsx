import { useState } from "react";
import SearchBar from "@/components/shared/SearchBar";
import { track } from "@/lib/analytics";

export default function SearchResultsPanel({ u }: { u: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function runSearch(query: string) {
    setStatus("loading");
    setResults([]);

    // v1 mock: replace with adapter to Supabase/Algolia later
    await new Promise((r) => setTimeout(r, 300));
    const mock = query
      ? [
          {
            id: "1",
            title: `Result for “${query}”`,
            href: `/discovery?q=${encodeURIComponent(query)}`,
          },
          {
            id: "2",
            title: `Another match for “${query}”`,
            href: `/discovery?q=${encodeURIComponent(query)}`,
          },
        ]
      : [];
    setResults(mock);
    setStatus("done");
  }

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 14,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 800 }}>Search</div>

        <SearchBar
          placeholder="Search services, products, courses…"
          onSubmit={(value) => {
            const cleaned = value.trim();
            setQ(cleaned);
            track("search_submit", {
              q_len: cleaned.length,
              scope: "services",
            });
            runSearch(cleaned);
          }}
        />

        {status === "loading" && (
          <div style={{ color: "var(--ink-700)" }}>Searching…</div>
        )}

        {status === "done" && q && results.length === 0 && (
          <div style={{ color: "var(--ink-700)" }}>
            No results. Try another query or post a job.
          </div>
        )}

        {results.length > 0 && (
          <>
            <div style={{ display: "grid", gap: 8 }}>
              {results.map((r) => (
                <a
                  key={r.id}
                  href={r.href}
                  style={{
                    textDecoration: "none",
                    color: "var(--ink-900)",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  {r.title}
                </a>
              ))}
            </div>

            <a
              href={`/discovery?q=${encodeURIComponent(q)}`}
              style={{
                color: "var(--aqua-300)",
                textDecoration: "none",
                marginTop: 6,
              }}
            >
              View all results →
            </a>
          </>
        )}
      </div>
    </div>
  );
}
