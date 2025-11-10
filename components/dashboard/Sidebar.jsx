// components/dashboard/Sidebar.jsx
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";

export default function Sidebar({ tabs, active, onSelect, role }) {
  const router = useRouter();
  const listRef = useRef(null);

  function handleSelect(id) {
    onSelect?.(id);
    const q = { ...router.query, tab: id };
    router.replace({ pathname: router.pathname, query: q }, undefined, {
      shallow: true,
    });
  }

  // Roving tab focus (left/right/up/down)
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const buttons = [...list.querySelectorAll("[role=tab]")];
    function onKey(e) {
      const idx = buttons.findIndex(
        (b) => b.getAttribute("data-id") === active
      );
      if (["ArrowDown", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        buttons[(idx + 1) % buttons.length]?.focus();
      } else if (["ArrowUp", "ArrowLeft"].includes(e.key)) {
        e.preventDefault();
        buttons[(idx - 1 + buttons.length) % buttons.length]?.focus();
      }
    }
    list.addEventListener("keydown", onKey);
    return () => list.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <aside
      className="w-56 border-r border-[var(--border)] p-3"
      aria-label="Sidebar"
    >
      <div className="mb-3 text-xs uppercase tracking-wide text-[var(--ink-500)]">
        {role}
      </div>
      <nav
        ref={listRef}
        role="tablist"
        aria-label={`${role} tabs`}
        className="grid gap-1"
      >
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              data-id={t.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${t.id}`}
              onClick={() => handleSelect(t.id)}
              className={`text-left px-3 py-2 rounded-lg focus:outline-none focus:ring ${
                isActive ? "bg-[var(--card-900)]" : "hover:bg-[var(--card-800)]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
