// pages/index.tsx
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { site as siteStatic } from "../lib/siteConfig";
import { supabase } from "@/lib/supabaseClient";

import ExplainerSplit from "../components/home/ExplainerSplit";
import FeaturedTabs from "../components/home/FeaturedTabs";
import InPersonGrid from "../components/home/InPersonGrid";
import FAQSwitch from "../components/home/FAQSwitch";
import { SEO, getMeta, websiteJsonLd } from "../lib/seo";

import categoriesJson from "../data/categories.json";
import servicesJson from "../data/services.json";

import { HomeHero } from "@/components/home/Hero";
import type { ListingCardData, ListingKind } from "@/lib/types/listings";
import { SectionExplore } from "@/components/sections/SectionExplore";
import ModeSwitcherSection from "@/components/home/ModeSwitcher";
import { SectionTrustRail } from "@/components/sections/SectionTrustRail";
import { SectionStartSimple } from "@/components/sections/SectionStartSimple";
import { SectionTestimonials } from "@/components/sections/SectionTestimonials";

// ---------- Types ----------

type HomeProps = {
  services: ListingCardData[];
  courses: ListingCardData[];
  products: ListingCardData[];
};

type OfferingKindDb = ListingKind | "bundle";

type ProviderServiceRow = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price_from?: number | null;
  image_url?: string | null;
  kind: OfferingKindDb;
  type: "digital" | "in_person";
  provider: {
    slug: string;
    display_name: string;
    rating?: number | null;
  } | null;
};

// ---------- Page Component ----------

export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { services, courses, products } = props;

  const meta = getMeta({
    title: siteStatic?.meta?.title,
    description: siteStatic?.meta?.description,
    url: siteStatic?.meta?.url,
  });

  const jsonLd = [
    websiteJsonLd({
      name: siteStatic.brand,
      url: siteStatic?.meta?.url,
    }),
  ];
  console.log("SectionExplore counts", {
    services: services.length,
    courses: courses.length,
    products: products.length,
  });

  // Featured tabs derived from categories + mock services JSON
  const makeTab = (cat: (typeof categoriesJson)[number]) => ({
    id: cat.id,
    label: cat.name,
    items: servicesJson.filter((s) => s.category_id === cat.id && s.featured),
  });

  const tabs = categoriesJson.map(makeTab);

  const inPersonItems = servicesJson
    .filter((s) => s.type === "in_person")
    .slice(0, 6);

  const faqData = {
    customers: [
      {
        q: "How are payments handled for packages?",
        a: "Digital packages use a secure checkout. In-person requests do not require payment in the initial request.",
      },
      {
        q: "Can I choose a specific provider?",
        a: "Yes. You select a provider first, then choose one of their services.",
      },
    ],
    freelancers: [
      {
        q: "How do I get listed?",
        a: "Complete your profile and at least one active service, then submit for approval.",
      },
      {
        q: "Can I set my own schedule?",
        a: "Yes. Add weekly availability windows and update them anytime.",
      },
    ],
  };

  return (
    <>
      <SEO meta={meta} jsonLd={jsonLd} />

      <HomeHero />
      <ModeSwitcherSection />

      {/* Section 3 carousels */}
      <SectionExplore
        services={services}
        courses={courses}
        products={products}
      />
      <SectionTrustRail />
      <SectionStartSimple />
      <SectionTestimonials />

      {/* Legacy/demo sections (still wired to JSON, safe to keep or remove)
      <ExplainerSplit heading="Two systems, one place" />

      <FeaturedTabs
        heading="Featured"
        tabs={tabs}
        onCta={(item) => {
          if (typeof window !== "undefined") {
            console.log("Featured view", item);
          }
        }}
      />

      <InPersonGrid
        heading="In-person highlights"
        items={inPersonItems}
        onView={(it) => {
          if (typeof window !== "undefined") {
            console.log("In-person view", it);
          }
        }}
      />

      <FAQSwitch heading="Questions" tabs={faqData} />
      */}
    </>
  );
}

// ---------- Mapping helper ----------

function mapRowToCard(row: ProviderServiceRow): ListingCardData | null {
  const allowedKinds: ListingKind[] = ["service", "course", "product"];

  if (!allowedKinds.includes(row.kind as ListingKind)) {
    return null;
  }

  const kind = row.kind as ListingKind;
  const providerName = row.provider?.display_name ?? "WorkinAnts Provider";

  const priceUnitLabel =
    kind === "service"
      ? "/ session"
      : kind === "course"
      ? "/ course"
      : "/ download";

  return {
    id: row.id,
    kind,
    title: row.title,
    subtitle: `By ${providerName}`,
    priceFrom: row.price_from ?? null,
    priceUnitLabel,
    rating: row.provider?.rating ?? null,
    ratingCount: null,
    imageUrl: row.image_url ?? null,
    badgeLabel: null,
    href:
      kind === "service"
        ? `/services/${row.slug}`
        : kind === "course"
        ? `/courses/${row.slug}`
        : `/products/${row.slug}`,
  };
}

// ---------- SSR: one basket, split by kind ----------

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const { data, error } = await supabase
    .from("provider_services")
    .select(
      `
      id,
      slug,
      title,
      description,
      price_from,
      image_url,
      kind,
      type,
      provider:providers (
        slug,
        display_name,
        rating
      )
    `
    )
    .eq("is_active", true)
    .in("kind", ["service", "course", "product"])
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) {
    console.error("[Section 3] provider_services fetch error:", error);
  }

  const services: ListingCardData[] = [];
  const courses: ListingCardData[] = [];
  const products: ListingCardData[] = [];

  ((data as ProviderServiceRow[] | null) ?? []).forEach((row) => {
    const card = mapRowToCard(row);
    if (!card) return;

    switch (card.kind) {
      case "service":
        if (services.length < 20) services.push(card);
        break;
      case "course":
        if (courses.length < 20) courses.push(card);
        break;
      case "product":
        if (products.length < 20) products.push(card);
        break;
    }
  });

  return {
    props: {
      services,
      courses,
      products,
    },
  };
};

