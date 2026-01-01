// pages/discovery.tsx
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

/**
 * Query contract:
 * /discovery?q=&scope=services|products|courses
 *          &domain=<domainSlug>
 *          &category=<categorySlug>
 *          &tags=tag1,tag2
 *          &sort=popular|relevance|new
 *          &page=1
 */

type Scope = "services" | "products" | "courses";
type Sort = "popular" | "relevance" | "new";

type SearchParams = {
  q: string;
  scope: Scope;
  domain?: string;
  category?: string;
  tags: string[];
  sort: Sort;
  page: number;
};

type ResultType = "service" | "product" | "professional" | "course";

type SearchResult = {
  id: string;
  type: ResultType;
  title: string;
  subtitle?: string; // provider/org name, etc
  rating?: number;
  price?: number;
  href: string;
  badge?: string; // "Service", "Professional", etc
};

type SearchResponse = {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
};

type TaxonomyDomain = { id: string; name: string; slug: string };
type TaxonomyCategory = {
  id: string;
  name: string;
  slug: string;
  domain_slug: string;
};
type TaxonomyTag = {
  id: string;
  name: string;
  slug: string;
  category_slug: string;
};

// Replace with your actual taxonomy loader (CSV normalization)
import { taxonomy } from "@/data/taxonomy"; // expected: domains[], categories[], tags[]
import { searchAdapter } from "@/lib/searchAdapter"; // mock now, real later
import { track } from "@/lib/analytics"; // stub now

const PAGE_SIZE = 12;
const MAX_Q_LEN = 80;
const MAX_TAGS = 8;

export default function DiscoveryPage() {
  const router = useRouter();

  // ---------- Parse + sanitize query ----------
  const parsed: SearchParams = useMemo(() => {
    const qRaw = getQS(router.query.q);
    const scopeRaw = getQS(router.query.scope);
    const domainRaw = getQS(router.query.domain);
    const categoryRaw = getQS(router.query.category);
    const tagsRaw = getQS(router.query.tags);
    const sortRaw = getQS(router.query.sort);
    const pageRaw = getQS(router.query.page);

    const q = sanitizeQuery(qRaw);
    const scope = sanitizeScope(scopeRaw);
    const domain = sanitizeSlug(domainRaw);
    const category = sanitizeSlug(categoryRaw);
    const tags = sanitizeTags(tagsRaw);
    const sort = sanitizeSort(sortRaw);
    const page = sanitizePage(pageRaw);

    return { q, scope, domain, category, tags, sort, page };
  }, [router.query]);

  // ---------- Taxonomy lookups ----------
  const domains = taxonomy.domains as TaxonomyDomain[];
  const categories = taxonomy.categories as TaxonomyCategory[];
  const tags = taxonomy.tags as TaxonomyTag[];

  const categoriesForDomain = useMemo(() => {
    if (!parsed.domain) return [];
    return categories.filter((c) => c.domain_slug === parsed.domain);
  }, [categories, parsed.domain]);

  const tagsForCategory = useMemo(() => {
    if (!parsed.category) return [];
    return tags.filter((t) => t.category_slug === parsed.category);
  }, [tags, parsed.category]);

  // Normalize invalid domain/category/tag combinations (DISC-002)
  const normalizedParams: SearchParams = useMemo(() => {
    let domain = parsed.domain;
    let category = parsed.category;
    let tagSlugs = [...parsed.tags];

    if (domain && !domains.some((d) => d.slug === domain)) domain = undefined;

    if (category) {
      const cat = categories.find((c) => c.slug === category);
      if (!cat) category = undefined;
      if (cat && domain && cat.domain_slug !== domain) {
        // category dictates domain if mismatch
        domain = cat.domain_slug;
      }
      if (cat && !domain) domain = cat.domain_slug;
    }

    if (tagSlugs.length) {
      // keep only tags that exist; if category is selected, keep tags within category
      const allowed = new Set(
        (category
          ? tags.filter((t) => t.category_slug === category)
          : tags
        ).map((t) => t.slug)
      );
      tagSlugs = tagSlugs.filter((s) => allowed.has(s)).slice(0, MAX_TAGS);
    }

    return { ...parsed, domain, category, tags: tagSlugs };
  }, [parsed, domains, categories, tags]);

  // If normalization changed something, sync URL (no crash, deterministic)
  useEffect(() => {
    if (!router.isReady) return;

    const changed = !shallowEqualSearchParams(parsed, normalizedParams);
    if (!changed) return;

    router.replace(
      { pathname: "/discovery", query: toQuery(normalizedParams) },
      undefined,
      { shallow: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  // ---------- Search state ----------
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [data, setData] = useState<SearchResponse | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    let cancelled = false;
    async function run() {
      setStatus("loading");

      try {
        // DISC-006: adapter (mock now, swap later)
        const res = await searchAdapter.search({
          ...normalizedParams,
          pageSize: PAGE_SIZE,
        });

        if (cancelled) return;
        setData(res);
        setStatus("success");

        // DISC-007: analytics (one per param set)
        track("search_submit", {
          scope: normalizedParams.scope,
          q_len: normalizedParams.q.length,
          domain: normalizedParams.domain ?? null,
          category: normalizedParams.category ?? null,
          tags_count: normalizedParams.tags.length,
          sort: normalizedParams.sort,
          page: normalizedParams.page,
        });
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setData(null);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, normalizedParams]);

  // ---------- Handlers: filters update URL ----------
  const setParams = (patch: Partial<SearchParams>) => {
    const nextParams: SearchParams = {
      ...normalizedParams,
      ...patch,
      // whenever filters change, reset page
      page: patch.page ?? 1,
    };

    // If domain changes, clear category/tags unless still valid
    if (patch.domain !== undefined) {
      nextParams.category = undefined;
      nextParams.tags = [];
    }
    if (patch.category !== undefined) {
      nextParams.tags = [];
      // ensure domain matches category
      const cat = categories.find((c) => c.slug === patch.category);
      if (cat) nextParams.domain = cat.domain_slug;
    }

    router.push(
      { pathname: "/discovery", query: toQuery(nextParams) },
      undefined,
      {
        shallow: true,
      }
    );

    // DISC-007: filter change
    track("filter_change", {
      patch: Object.keys(patch),
    });
  };

  // ---------- SEO basics (DISC-008 scaffolding) ----------
  const canonical = useMemo(() => {
    const qs = toQuery(normalizedParams);
    const queryString = new URLSearchParams(qs as any).toString();
    return queryString ? `/discovery?${queryString}` : "/discovery";
  }, [normalizedParams]);

  const shouldNoIndex = useMemo(() => {
    // Conservative: noindex deep combos and high-cardinality tags while you’re still stabilizing.
    // You can relax this later.
    const tooManyTags = normalizedParams.tags.length > 2;
    const deepCombo = Boolean(
      normalizedParams.domain && normalizedParams.category && normalizedParams.q
    );
    const paged = normalizedParams.page > 1;
    return tooManyTags || deepCombo || paged;
  }, [normalizedParams]);

  // ---------- Render ----------
  return (
    <>
      <Head>
        <title>Discovery</title>
        <link rel="canonical" href={canonical} />
        {shouldNoIndex && <meta name="robots" content="noindex,follow" />}
      </Head>

      <div
        style={{
          minHeight: "100vh",
          padding: 24,
          background: "var(--grad-app)",
          color: "var(--ink-900)",
        }}
      >
        <div
          style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 16 }}
        >
          <HeaderBar params={normalizedParams} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "320px 1fr",
              gap: 16,
            }}
          >
            <aside style={panelStyle}>
              <h2 style={h2}>Filters</h2>

              <FilterGroup label="Scope">
                <Pills
                  value={normalizedParams.scope}
                  options={[
                    { value: "services", label: "Services" },
                    { value: "products", label: "Products" },
                    { value: "courses", label: "Courses" },
                  ]}
                  onChange={(v) => setParams({ scope: v as Scope })}
                />
              </FilterGroup>

              <FilterGroup label="Domain (Level 1)">
                <Select
                  value={normalizedParams.domain ?? ""}
                  placeholder="All domains"
                  options={domains.map((d) => ({
                    value: d.slug,
                    label: d.name,
                  }))}
                  onChange={(v) => setParams({ domain: v || undefined })}
                />
              </FilterGroup>

              <FilterGroup label="Category (Level 2)">
                <Select
                  value={normalizedParams.category ?? ""}
                  placeholder={
                    normalizedParams.domain
                      ? "All categories"
                      : "Select a domain first"
                  }
                  disabled={!normalizedParams.domain}
                  options={categoriesForDomain.map((c) => ({
                    value: c.slug,
                    label: c.name,
                  }))}
                  onChange={(v) => setParams({ category: v || undefined })}
                />
              </FilterGroup>

              <FilterGroup label="Tags (Level 3)">
                <TagMultiSelect
                  disabled={!normalizedParams.category}
                  options={tagsForCategory.map((t) => ({
                    value: t.slug,
                    label: t.name,
                  }))}
                  value={normalizedParams.tags}
                  onChange={(nextTags) => setParams({ tags: nextTags })}
                />
              </FilterGroup>

              <FilterGroup label="Sort">
                <Select
                  value={normalizedParams.sort}
                  options={[
                    { value: "popular", label: "Popular" },
                    { value: "relevance", label: "Relevance" },
                    { value: "new", label: "Newest" },
                  ]}
                  onChange={(v) => setParams({ sort: v as Sort })}
                />
              </FilterGroup>
            </aside>

            <main style={{ display: "grid", gap: 12 }}>
              <ResultsMeta
                status={status}
                total={data?.total ?? 0}
                page={normalizedParams.page}
                pageSize={PAGE_SIZE}
              />

              {status === "loading" && <ResultsSkeleton />}

              {status === "error" && (
                <div style={panelStyle}>
                  <h3 style={h3}>Couldn’t load results</h3>
                  <p style={muted}>Try adjusting filters or refreshing.</p>
                </div>
              )}

              {status === "success" && data && data.results.length === 0 && (
                <EmptyState
                  onClear={() =>
                    setParams({
                      q: "",
                      domain: undefined,
                      category: undefined,
                      tags: [],
                      page: 1,
                    })
                  }
                  onPostJob={() => router.push("/?postJob=1")}
                />
              )}

              {status === "success" && data && data.results.length > 0 && (
                <>
                  <ResultsGrid
                    results={data.results}
                    onResultClick={(r) =>
                      track("result_click", { type: r.type, id: r.id })
                    }
                  />
                  <Pagination
                    page={normalizedParams.page}
                    pageSize={PAGE_SIZE}
                    total={data.total}
                    onPageChange={(p) => setParams({ page: p })}
                  />
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

/* ----------------------------- UI bits (minimal, replace with components later) ----------------------------- */

function HeaderBar({ params }: { params: SearchParams }) {
  const router = useRouter();
  const [q, setQ] = useState(params.q);

  useEffect(() => setQ(params.q), [params.q]);

  return (
    <div
      style={{ ...panelStyle, display: "flex", gap: 12, alignItems: "center" }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ color: "var(--ink-700)", fontSize: 13 }}>Search</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(
              {
                pathname: "/discovery",
                query: toQuery({ ...params, q, page: 1 }),
              },
              undefined,
              { shallow: true }
            );
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search services, products, courses…"
            style={inputStyle}
            maxLength={MAX_Q_LEN}
          />
        </form>
      </div>
    </div>
  );
}

function ResultsMeta({
  status,
  total,
  page,
  pageSize,
}: {
  status: string;
  total: number;
  page: number;
  pageSize: number;
}) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ color: "var(--ink-700)" }}>
        {status === "loading"
          ? "Searching…"
          : total
          ? `Showing ${start}-${end} of ${total}`
          : "No results"}
      </div>
    </div>
  );
}

function ResultsGrid({
  results,
  onResultClick,
}: {
  results: SearchResult[];
  onResultClick: (r: SearchResult) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      {results.map((r) => (
        <a
          key={r.id}
          href={r.href}
          onClick={() => onResultClick(r)}
          style={{
            ...panelStyle,
            textDecoration: "none",
            display: "grid",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <div
            style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
          >
            <div style={{ fontWeight: 600 }}>{r.title}</div>
            <span style={badge}>{r.badge ?? r.type}</span>
          </div>
          {r.subtitle && <div style={muted}>{r.subtitle}</div>}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {typeof r.rating === "number" && (
              <span style={{ color: "var(--ink-700)" }}>
                ★ {r.rating.toFixed(1)}
              </span>
            )}
            {typeof r.price === "number" && (
              <span style={{ color: "var(--ink-700)" }}>From ${r.price}</span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ ...panelStyle, opacity: 0.7 }}>
          <div
            style={{
              height: 14,
              width: "70%",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 8,
            }}
          />
          <div
            style={{
              height: 12,
              width: "45%",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 8,
              marginTop: 10,
            }}
          />
          <div
            style={{
              height: 12,
              width: "55%",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 8,
              marginTop: 12,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  onClear,
  onPostJob,
}: {
  onClear: () => void;
  onPostJob: () => void;
}) {
  return (
    <div style={panelStyle}>
      <h3 style={h3}>No matches found</h3>
      <p style={muted}>
        Try widening filters, removing tags, or posting a job so professionals
        can come to you.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button onClick={onClear} style={btnSecondary}>
          Clear filters
        </button>
        <button onClick={onPostJob} style={btnPrimary}>
          Post a job
        </button>
      </div>
    </div>
  );
}

function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 10,
        marginTop: 8,
      }}
    >
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        style={btnSecondary}
      >
        Prev
      </button>
      <div style={{ color: "var(--ink-700)", alignSelf: "center" }}>
        Page {page} / {totalPages}
      </div>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        style={btnSecondary}
      >
        Next
      </button>
    </div>
  );
}

/* ----------------------------- Filters UI ----------------------------- */

function FilterGroup({ label, children }: { label: string; children: any }) {
  return (
    <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
      <div style={{ color: "var(--ink-700)", fontSize: 13 }}>{label}</div>
      {children}
    </div>
  );
}

function Select({
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...inputStyle,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <option value="">{placeholder ?? "All"}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Pills({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              border: `1px solid ${
                active ? "rgba(41,160,255,0.5)" : "var(--border)"
              }`,
              background: active
                ? "rgba(41,160,255,0.12)"
                : "rgba(255,255,255,0.03)",
              color: active ? "var(--ink-900)" : "var(--ink-700)",
              cursor: "pointer",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function TagMultiSelect({
  options,
  value,
  disabled,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string[];
  disabled?: boolean;
  onChange: (next: string[]) => void;
}) {
  const toggle = (slug: string) => {
    if (value.includes(slug)) onChange(value.filter((t) => t !== slug));
    else onChange([...value, slug].slice(0, MAX_TAGS));
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {disabled ? (
        <div style={muted}>Select a category first.</div>
      ) : (
        options.map((o) => {
          const active = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              style={{
                padding: "7px 10px",
                borderRadius: 999,
                border: `1px solid ${
                  active ? "rgba(125,211,252,0.35)" : "var(--border)"
                }`,
                background: active
                  ? "rgba(125,211,252,0.12)"
                  : "rgba(255,255,255,0.03)",
                color: active ? "var(--ink-900)" : "var(--ink-700)",
                cursor: "pointer",
              }}
            >
              {o.label}
            </button>
          );
        })
      )}
    </div>
  );
}

/* ----------------------------- Utils ----------------------------- */

function getQS(v: any): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return "";
}

function sanitizeQuery(q: string) {
  const trimmed = q.trim().slice(0, MAX_Q_LEN);
  // Remove control chars; basic safety
  return trimmed.replace(/[\u0000-\u001F\u007F]/g, "");
}

function sanitizeScope(s: string): Scope {
  if (s === "products" || s === "courses") return s;
  return "services";
}

function sanitizeSort(s: string): Sort {
  if (s === "relevance" || s === "new") return s;
  return "popular";
}

function sanitizePage(p: string): number {
  const n = Number.parseInt(p || "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 500);
}

function sanitizeSlug(s: string) {
  const v = s.trim().toLowerCase();
  if (!v) return undefined;
  // allow a-z0-9-_
  if (!/^[a-z0-9\-_]+$/.test(v)) return undefined;
  return v;
}

function sanitizeTags(tags: string) {
  const raw = tags.trim();
  if (!raw) return [];
  const arr = raw
    .split(",")
    .map((t) => sanitizeSlug(t))
    .filter(Boolean) as string[];
  // de-dupe
  return Array.from(new Set(arr)).slice(0, MAX_TAGS);
}

function toQuery(p: SearchParams) {
  const q: Record<string, any> = {};
  if (p.q) q.q = p.q;
  if (p.scope) q.scope = p.scope;
  if (p.domain) q.domain = p.domain;
  if (p.category) q.category = p.category;
  if (p.tags?.length) q.tags = p.tags.join(",");
  if (p.sort) q.sort = p.sort;
  if (p.page && p.page !== 1) q.page = String(p.page);
  return q;
}

function shallowEqualSearchParams(a: SearchParams, b: SearchParams) {
  return (
    a.q === b.q &&
    a.scope === b.scope &&
    a.domain === b.domain &&
    a.category === b.category &&
    a.sort === b.sort &&
    a.page === b.page &&
    a.tags.join(",") === b.tags.join(",")
  );
}

/* ----------------------------- Styles ----------------------------- */

const panelStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: 14,
  boxShadow: "var(--shadow-soft)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--ink-900)",
  outline: "none",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(125,211,252,0.22)",
  background:
    "linear-gradient(180deg, rgba(41,160,255,.22), rgba(41,160,255,.12))",
  color: "var(--ink-900)",
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.03)",
  color: "var(--ink-800)",
  cursor: "pointer",
};

const badge: React.CSSProperties = {
  fontSize: 12,
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid rgba(125,211,252,0.22)",
  background: "rgba(125,211,252,0.10)",
  color: "var(--ink-800)",
  height: "fit-content",
};

const h2: React.CSSProperties = { margin: 0, fontSize: 16 };
const h3: React.CSSProperties = { margin: 0, fontSize: 16 };
const muted: React.CSSProperties = {
  margin: "8px 0 0",
  color: "var(--ink-700)",
};
