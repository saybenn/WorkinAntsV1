import { useRouter } from "next/router";
import { useMemo } from "react";

export default function RoleSwitcher() {
  const router = useRouter();

  // Current role from query (default client)
  const role = useMemo(
    () => (router.query.as ? String(router.query.as) : "client"),
    [router.query.as]
  );

  const roles = [
    { id: "client", label: "Client" },
    { id: "provider", label: "Provider" },
    { id: "candidate", label: "Candidate" },
  ];

  function switchTo(nextRole) {
    if (nextRole === role) return;
    // Preserve other query params (like ?tab=...), just swap ?as=
    const nextQuery = { ...router.query, as: nextRole };
    // Optional: reset tab per role
    if (
      router.query.tab &&
      !["overview", "orders", "services", "jobs", "bookings"].includes(
        String(router.query.tab)
      )
    ) {
      nextQuery.tab = "overview";
    }
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
      scroll: false,
    });
  }

  return (
    <div
      role="tablist"
      aria-label="Switch dashboard role"
      className="inline-flex rounded-xl overflow-hidden border border-[var(--border)]"
    >
      {roles.map((r) => {
        const active = r.id === role;
        return (
          <button
            key={r.id}
            role="tab"
            aria-selected={active}
            onClick={() => switchTo(r.id)}
            className={
              "px-3 py-1 capitalize transition-colors " +
              (active
                ? "bg-[var(--blue-600)] text-white"
                : "bg-[var(--card-800)] hover:bg-[var(--card-900)]")
            }
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
