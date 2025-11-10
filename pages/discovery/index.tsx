import { useEffect, useMemo, useState } from "react";
import DiscoveryHeader from "@/components/discovery/DiscoveryHeader";
import FacetBarCompact from "@/components/discovery/FacetBarCompact";
import BubbleGrid, { type L1 } from "@/components/discovery/BubbleGrid";
import SubcategoryPanel, {
  type L2,
} from "@/components/discovery/SubcategoryPanel";
import TagCloud, { type L3 } from "@/components/discovery/TagCloud";
import ResultRail from "@/components/discovery/ResultRail";

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

// TEMP: you’ll fetch these from Supabase; using inline demo data to validate the flow.
const L1_DEMO: L1[] = [
  { slug: "education-mentorship", name: "Education & Mentorship" },
  { slug: "creative-design-media", name: "Creative, Design & Media" },
  { slug: "development-tech-data", name: "Development, Tech & Data" },
  { slug: "business-finance-legal", name: "Business, Finance & Legal" },
  { slug: "beauty-style-lifestyle", name: "Beauty, Style & Lifestyle" },
  { slug: "ai-automation", name: "AI & Automation" },
];

const L2_DEMO: Record<string, L2[]> = {
  "education-mentorship": [
    {
      slug: "academic-skills-instruction",
      name: "Academic & Skills Instruction",
    },
    {
      slug: "course-curriculum-development",
      name: "Course & Curriculum Development",
    },
    {
      slug: "professional-development-coaching",
      name: "Professional Development & Coaching",
    },
  ],
};

const L3_DEMO: Record<string, L3[]> = {
  "academic-skills-instruction": [
    { slug: "language-lessons", name: "Language Lessons" },
    { slug: "k12-tutoring", name: "K-12 Tutoring" },
    { slug: "test-prep", name: "Test Prep & Study Skills" },
  ],
  "course-curriculum-development": [
    { slug: "curriculum-design", name: "Curriculum Design" },
    { slug: "elearning-video", name: "E-Learning Video Production" },
  ],
  "professional-development-coaching": [
    { slug: "career-coaching", name: "Career Coaching & Interview Prep" },
  ],
};

export default function DiscoveryPage() {
  const [types, setTypes] = useState<string[]>([]);
  const [sort, setSort] = useState("best");

  const [q, setQ] = useState(""); // ← search text
  const [facet, setFacet] = useState<{
    radius?: number;
    isDigital?: boolean;
    priceMin?: number;
    priceMax?: number;
    geo?: { lat: number; lng: number } | null;
  }>({});

  const [activeL1, setActiveL1] = useState<string | null>(null);
  const [activeL2, setActiveL2] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const hasAnySignal = Boolean(
    q ||
      types.length ||
      activeL1 ||
      activeL2 ||
      activeTag ||
      facet.isDigital ||
      facet.priceMin != null ||
      facet.priceMax != null ||
      (facet.radius && facet.geo)
  );

  useEffect(() => {
    window.dataLayer?.push({ event: "discovery_view" });
  }, []);

  // Build query params for ResultRail when a tag or combo is active
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q); // ← include search text
    if (types.length) p.set("type", types.join(","));
    if (activeL1) p.set("category", activeL1);
    if (activeL2) p.set("subcategory", activeL2);
    if (activeTag) p.set("tags", activeTag);
    if (facet.isDigital) p.set("is_digital", "true");
    if (facet.priceMin != null) p.set("price_gte", String(facet.priceMin));
    if (facet.priceMax != null) p.set("price_lte", String(facet.priceMax));
    if (facet.radius && facet.geo) {
      p.set("radius", String(facet.radius));
      p.set("lat", String(facet.geo.lat));
      p.set("lng", String(facet.geo.lng));
    }
    if (sort) p.set("sort", sort);
    return p;
  }, [q, types, activeL1, activeL2, activeTag, facet, sort]);

  const l2Items = activeL1 ? L2_DEMO[activeL1] || [] : [];
  const l3Items = activeL2 ? L3_DEMO[activeL2] || [] : [];

  return (
    <main className="mx-auto max-w-screen-sm p-4">
      <DiscoveryHeader
        activeTypes={types}
        onTypesChange={setTypes}
        onQueryChange={setQ} // ← capture search input here
      />{" "}
      <div className="h-3" />
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <FacetBarCompact onChange={setFacet} />
        </div>
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
      <div className="h-3" />
      <BubbleGrid
        items={L1_DEMO}
        active={activeL1}
        onSelect={(slug) => {
          setActiveL1(slug === activeL1 ? null : slug);
          setActiveL2(null);
          setActiveTag(null);
          // @ts-ignore
          window.dataLayer?.push({
            event: "discovery_lvl1_click",
            category: slug,
          });
        }}
      />
      <SubcategoryPanel
        open={Boolean(activeL1)}
        items={l2Items}
        active={activeL2}
        onSelect={(slug) => {
          setActiveL2(slug);
          setActiveTag(null);
          // @ts-ignore
          window.dataLayer?.push({
            event: "discovery_lvl2_click",
            category: activeL1,
            subcategory: slug,
          });
        }}
      />
      {activeL2 && (
        <TagCloud
          active={activeTag}
          items={l3Items}
          onSelect={(slug) => {
            setActiveTag(slug);
            // @ts-ignore
            window.dataLayer?.push({
              event: "discovery_tag_click",
              category: activeL1,
              subcategory: activeL2,
              tag: slug,
            });
          }}
        />
      )}
      {hasAnySignal && <hr className="mt-4 border-[var(--border)]" />}
      {hasAnySignal && <ResultRail query={query} />}
    </main>
  );
}
