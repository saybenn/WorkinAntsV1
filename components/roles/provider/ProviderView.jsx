import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/dashboard/Sidebar";

import ProviderOverview from "./Overview";
import ProviderOrders from "./Orders";
import ProviderAvailability from "./Availability";
import ProviderServices from "./Services";
import ProviderMessages from "./Messages";
import ProviderPayouts from "./Payouts";
import ProviderReviews from "./Reviews";
import ProviderAnalytics from "./Analytics";
import ProviderSettings from "./Settings";

const TABS = [
  { id: "overview", label: "Overview", component: ProviderOverview },
  { id: "orders", label: "Orders", component: ProviderOrders },
  {
    id: "availability",
    label: "Availability",
    component: ProviderAvailability,
  },
  { id: "services", label: "Services", component: ProviderServices },
  { id: "messages", label: "Messages", component: ProviderMessages },
  { id: "payouts", label: "Payouts", component: ProviderPayouts },
  { id: "reviews", label: "Reviews", component: ProviderReviews },
  { id: "analytics", label: "Analytics", component: ProviderAnalytics },
  { id: "settings", label: "Settings", component: ProviderSettings },
];

export default function ProviderView() {
  const router = useRouter();
  const tabFromUrl = router.query.tab;
  const [active, setActive] = useState(tabFromUrl || "overview");

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== active) setActive(tabFromUrl);
  }, [tabFromUrl]);

  function handleSelect(id) {
    setActive(id);
    router.replace({ query: { ...router.query, tab: id } }, undefined, {
      shallow: true,
    });
  }

  const ActiveComponent =
    TABS.find((t) => t.id === active)?.component || ProviderOverview;

  return (
    <div className="flex min-h-[70vh] transition-opacity duration-300">
      <Sidebar
        tabs={TABS}
        active={active}
        onSelect={handleSelect}
        role="Provider"
      />
      <main className="flex-1 p-6 bg-[var(--bg-950)] text-[var(--ink-900)] fade-in">
        <ActiveComponent key={active} />
      </main>
    </div>
  );
}
