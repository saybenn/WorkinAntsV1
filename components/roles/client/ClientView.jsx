import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "@/components/dashboard/Sidebar";

import ClientOverview from "./Overview";
import ClientBookings from "./Bookings";
import ClientPurchases from "./Purchases";
import ClientMessages from "./Messages";
import ClientBilling from "./Billing";
import ClientSaved from "./Saved";

const TABS = [
  { id: "overview", label: "Overview", component: ClientOverview },
  { id: "bookings", label: "Bookings", component: ClientBookings },
  { id: "purchases", label: "Purchases", component: ClientPurchases },
  { id: "messages", label: "Messages", component: ClientMessages },
  { id: "billing", label: "Billing", component: ClientBilling },
  { id: "saved", label: "Saved", component: ClientSaved },
];

export default function ClientView() {
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
    TABS.find((t) => t.id === active)?.component || ClientOverview;

  return (
    <div className="flex min-h-[70vh] transition-opacity duration-300">
      <Sidebar
        tabs={TABS}
        active={active}
        onSelect={handleSelect}
        role="Client"
      />
      <main className="flex-1 p-6 bg-[var(--bg-950)] text-[var(--ink-900)] fade-in">
        <ActiveComponent key={active} />
      </main>
    </div>
  );
}
