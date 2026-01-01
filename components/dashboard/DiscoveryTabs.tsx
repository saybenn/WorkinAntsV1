import { useMemo, useState } from "react";

export default function DiscoveryTabs({
  taxonomy,
  taxonomyStatus,
  getPersonalizedCategories,
  getTopPicks,
}: {
  taxonomy: any;
  taxonomyStatus: "idle" | "loading" | "success" | "error";
  getPersonalizedCategories: () => any[];
  getTopPicks: () => any[];
}) {
  const [tab, setTab] = useState<"explore" | "top">("explore");

  const items = useMemo(() => {
    if (taxonomyStatus !== "success") return [];
    return tab === "explore" ? getPersonalizedCategories() : getTopPicks();
  }, [tab, taxonomyStatus, getPersonalizedCategories, getTopPicks]);

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 14,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <TabButton
            active={tab === "explore"}
            onClick={() => setTab("explore")}
          >
            Explore Categories
          </TabButton>
          <TabButton active={tab === "top"} onClick={() => setTab("top")}>
            Top Picks
          </TabButton>
        </div>

        <div style={{ color: "var(--ink-700)", fontSize: 13 }}>
          {tab === "explore" ? "Suggested" : "Most Popular"}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {taxonomyStatus === "loading" && (
          <div style={{ color: "var(--ink-700)" }}>Loading…</div>
        )}
        {taxonomyStatus === "error" && (
          <div style={{ color: "var(--ink-700)" }}>Taxonomy unavailable.</div>
        )}
        {taxonomyStatus === "success" && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {items.slice(0, 8).map((c: any) => (
              <span key={c.slug} style={chip}>
                {c.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${
          active ? "rgba(41,160,255,0.5)" : "var(--border)"
        }`,
        background: active ? "rgba(41,160,255,0.12)" : "rgba(255,255,255,0.03)",
        color: active ? "var(--ink-900)" : "var(--ink-700)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

const chip: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  color: "var(--ink-800)",
  fontSize: 13,
};
