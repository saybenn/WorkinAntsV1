import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type Domain = { id: string; name: string; slug: string; display_order?: number };
type Category = {
  id: string;
  name: string;
  slug: string;
  domain_id: string;
  domain_slug: string;
  icon?: string;
  description?: string;
  display_order?: number;
};
type Tag = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_slug: string;
  display_order?: number;
};

type Payload = {
  domains: Domain[];
  categories: Category[];
  tags: Tag[];
  // helpful maps
  categoriesByDomain: Record<string, Category[]>;
  tagsByCategory: Record<string, Tag[]>;
};

type CsvRow = Record<string, string | undefined>;

function withOpt<T extends object, K extends string, V>(
  key: K,
  value: V | undefined
): T | (T & Record<K, V>) {
  return value === undefined ? ({} as T) : ({ [key]: value } as any);
}
function slugify(s: string | undefined) {
  return (s ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s\-_]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function sanitizeSlug(s: string | undefined) {
  const v = (s ?? "").toLowerCase().trim();
  return /^[a-z0-9\-_]+$/.test(v) ? v : "";
}



function toNum(v: any) {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : undefined;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Expect these CSV files to exist in your repo under /data (recommended)
    // Copy your uploaded csvs into: /data/taxonomy_domains_rows.csv etc.
    const domainsCsv = readCsv("taxonomy_domains_rows (1).csv");
    const categoriesCsv = readCsv("taxonomy_categories_rows (1).csv");
    const tagsCsv = readCsv("taxonomy_tags_rows (1).csv");

const domainsRaw: CsvRow[] = parseCsv(domainsCsv);
const categoriesRaw: CsvRow[] = parseCsv(categoriesCsv);
const tagsRaw: CsvRow[] = parseCsv(tagsCsv);


// Normalize domains
const domains: Domain[] = domainsRaw
  .map((r) => {
    const display_order = toNum(r.display_order ?? r.order ?? r.rank);

    return {
      id: r.id ?? r.domain_id ?? r.uuid ?? r._id ?? "",
      name: r.name ?? r.domain ?? "",
      slug: r.slug ?? slugify(r.name ?? r.domain ?? ""),
      ...(display_order !== undefined ? { display_order } : {}),
    } satisfies Domain;
  })
  .filter((d) => d.id && d.slug && d.name);

    const domainById = new Map(domains.map((d) => [d.id, d]));
    const domainBySlug = new Map(domains.map((d) => [d.slug, d]));

    // Normalize categories
const categories: Category[] = categoriesRaw
  .map((r) => {
    const icon = r.icon ?? undefined;
    const description = r.description ?? undefined;
    const display_order = toNum(r.display_order ?? r.order ?? r.rank);

    const name = r.name ?? r.category ?? "";
    const slug = r.slug ?? slugify(name);

    const domain_slug = r.domain_slug ?? slugify(r.domain ?? "");

    return {
      id: r.id ?? r.category_id ?? r.uuid ?? r._id ?? "",
      name,
      slug,
      domain_id: r.domain_id ?? r.domain_uuid ?? "",
      domain_slug,
      ...(icon ? { icon } : {}),
      ...(description ? { description } : {}),
      ...(display_order !== undefined ? { display_order } : {}),
    } satisfies Category;
  })
  .filter((c) => c.id && c.name && c.slug && c.domain_id);


    const categoryById = new Map(categories.map((c) => [c.id, c]));
    const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

    // Normalize tags
const tags: Tag[] = tagsRaw
  .map((r) => {
    const display_order = toNum(r.display_order ?? r.order ?? r.rank);

    const name = r.name ?? r.tag ?? "";
    const slug = r.slug ?? slugify(name);

    const category_slug = r.category_slug ?? slugify(r.category ?? "");

    return {
      id: r.id ?? r.tag_id ?? r.uuid ?? r._id ?? "",
      name,
      slug,
      category_id: r.category_id ?? r.category_uuid ?? "",
      category_slug,
      ...(display_order !== undefined ? { display_order } : {}),
    } satisfies Tag;
  })
  .filter((t) => t.id && t.name && t.slug && t.category_id);


    // Build maps
    const categoriesByDomain: Record<string, Category[]> = {};
    for (const c of categories) {
      (categoriesByDomain[c.domain_slug] ??= []).push(c);
    }
    for (const k of Object.keys(categoriesByDomain)) {
      categoriesByDomain[k]?.sort((a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999));
    }

    const tagsByCategory: Record<string, Tag[]> = {};
    for (const t of tags) {
      (tagsByCategory[t.category_slug] ??= []).push(t);
    }
    for (const k of Object.keys(tagsByCategory)) {
      tagsByCategory[k]?.sort((a, b) => (a.display_order ?? 9999) - (b.display_order ?? 9999));
    }

    const payload: Payload = {
      domains,
      categories,
      tags,
      categoriesByDomain,
      tagsByCategory,
    };

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(payload);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "taxonomy_error" });
  }
}

function readCsv(filename: string) {
  // Put CSVs in /data at repo root. In Next.js, process.cwd() points to repo root.
  const p = path.join(process.cwd(), "data", filename);
  return fs.readFileSync(p, "utf8");
}

// Very small CSV parser (handles commas + quotes)
function parseCsv(csv: string): CsvRow[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // ✅ Tell TypeScript: this exists because lines.length > 0
  const headerLine = lines[0]!;
  const headers = splitCsvLine(headerLine).map((h) => h.trim());

  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // ✅ Tell TypeScript: this exists because i < lines.length
    const line = lines[i]!;
    const cols = splitCsvLine(line);

    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      const raw = cols[idx];
      row[h] = raw === undefined ? undefined : raw.trim();
    });

    rows.push(row);
  }

  return rows;
}


function splitCsvLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}


