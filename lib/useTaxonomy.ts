import { useEffect, useState } from "react";

export type TaxonomyPayload = {
  domains: any[];
  categories: any[];
  tags: any[];
  categoriesByDomain: Record<string, any[]>;
  tagsByCategory: Record<string, any[]>;
};

export function useTaxonomy() {
  const [data, setData] = useState<TaxonomyPayload | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setStatus("loading");
      try {
        const res = await fetch("/api/taxonomy");
        if (!res.ok) throw new Error("taxonomy_fetch_failed");
        const json = await res.json();
        if (cancelled) return;
        setData(json);
        setStatus("success");
      } catch {
        if (cancelled) return;
        setStatus("error");
        setData(null);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, status };
}
