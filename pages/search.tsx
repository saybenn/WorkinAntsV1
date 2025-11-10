// /pages/search.tsx
import { useMemo, useState } from "react";
import ResultRail from "@/components/discovery/ResultRail";
import { useRouter } from "next/router";

export default function SearchPage() {
  const router = useRouter();
  const [sort, setSort] = useState<string>(String(router.query.sort || "best"));

  const query = useMemo(() => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(router.query)) {
      if (Array.isArray(v)) p.set(k, v.join(","));
      else if (v != null) p.set(k, String(v));
    }
    if (sort) p.set("sort", sort);
    return p;
  }, [router.query, sort]);

  return (
    <main className="mx-auto max-w-screen-sm p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="h2">Search</h1>
        <label className="text-sm">
          Sort:&nbsp;
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded border bg-transparent px-2 py-1"
          >
            <option value="best">Best</option>
            <option value="price_low_to_high">Price ↑</option>
            <option value="rating">Rating</option>
            <option value="newest">Newest</option>
          </select>
        </label>
      </div>
      <hr className="border-[var(--border)]" />
      <ResultRail query={query} />
    </main>
  );
}
