import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DiscoveryTabs from "@/components/dashboard/DiscoveryTabs";
import CategoryRail from "@/components/dashboard/CategoryRail";
import SearchResultsPanel from "@/components/dashboard/SearchResultsPanel";
import RecommendationsSection from "@/components/dashboard/RecommendationsSection";
import PostJobCTA from "@/components/dashboard/PostJobCTA";
import PostJobPanel from "@/components/dashboard/PostJobPanel";
import { useTaxonomy } from "@/lib/useTaxonomy";

type DbUserRole = "client" | "provider" | "candidate" | "employer" | "admin";
type UIMode = "client" | "professional" | "job_seeker" | "organization";

type DashboardView =
  | "home"
  | "search"
  | "categories"
  | "saved"
  | "orders"
  | "messages"
  | "postJob";

type Profile = {
  id: string;
  handle: string;
  full_name: string | null;
  avatar_url: string | null;
  role: DbUserRole | null;
  is_public?: boolean | null;
  role_set: DbUserRole[] | null;
};

export default function MainContentRouter({
  u,
  profile,
  activeView,
  activeMode,
  onModeChange,
  onViewChange,
}: {
  u: string;
  profile: Profile;
  activeView: DashboardView;
  activeMode: UIMode;
  onModeChange: (m: UIMode) => void;
  onViewChange: (v: DashboardView) => void;
}) {
  const { data: taxonomy, status: taxStatus } = useTaxonomy();

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <DashboardHeader name={profile.full_name ?? profile.handle} />

      {activeView === "home" && (
        <>
          <DiscoveryTabs
            taxonomy={taxonomy}
            taxonomyStatus={taxStatus}
            // v1: you’ll swap these with real personalization later
            getPersonalizedCategories={() =>
              taxonomy?.categories?.slice(0, 8) ?? []
            }
            getTopPicks={() => taxonomy?.categories?.slice(0, 8) ?? []}
          />

          <CategoryRail
            title="Explore Categories"
            items={taxonomy?.categories?.slice(0, 12) ?? []}
            u={u}
            scope="services"
          />

          <RecommendationsSection
            u={u}
            // v1: placeholder. Later: driven by personalization signals.
            items={[
              {
                id: "1",
                type: "service",
                title: "Website Landing Page",
                subtitle: "Top-rated professionals",
                rating: 4.8,
                price: 250,
                href: "/discovery?category=website&scope=services",
              },
              {
                id: "2",
                type: "professional",
                title: "Lighting Play",
                subtitle: "Professional",
                rating: 4.7,
                price: 120,
                href: "/discovery?q=lighting%20play&scope=services",
              },
            ]}
          />

          <PostJobCTA onClick={() => onViewChange("postJob")} />
        </>
      )}

      {activeView === "search" && <SearchResultsPanel u={u} />}

      {activeView === "categories" && (
        <CategoryRail
          title="Browse Categories"
          items={taxonomy?.categories ?? []}
          u={u}
          scope="services"
        />
      )}

      {activeView === "postJob" && <PostJobPanel taxonomy={taxonomy} />}

      {(activeView === "saved" ||
        activeView === "orders" ||
        activeView === "messages") && <PlaceholderView title={activeView} />}
    </div>
  );
}

function PlaceholderView({ title }: { title: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 16,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ fontWeight: 700, textTransform: "capitalize" }}>
        {title}
      </div>
      <div style={{ color: "var(--ink-700)", marginTop: 6 }}>
        Placeholder. Add real content + empty states.
      </div>
    </div>
  );
}
