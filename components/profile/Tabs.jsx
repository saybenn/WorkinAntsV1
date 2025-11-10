// /components/profile/Tabs.jsx
import { useRouter } from "next/router";

export default function Tabs({ handle, tabs }) {
  const router = useRouter();
  const active = router.query.tab || tabs[0].id;

  function select(id) {
    router.replace(
      { pathname: `/u/${handle}`, query: { ...router.query, tab: id } },
      undefined,
      { shallow: true }
    );
  }

  return (
    <div className="sticky top-[42px] z-10 bg-[var(--bg-950)]/90 backdrop-blur border-b border-[var(--border)]">
      <div className="max-w-3xl mx-auto px-4">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((t) => {
            const is = t.id === active;
            return (
              <button
                key={t.id}
                onClick={() => select(t.id)}
                className={
                  "py-3 border-b-2 -mb-[1px] whitespace-nowrap " +
                  (is
                    ? "border-[var(--green-500)] text-[var(--ink-900)]"
                    : "border-transparent text-[var(--ink-700)] hover:text-[var(--ink-900)]")
                }
              >
                {t.label} {t.count != null ? ` ${t.count}` : ""}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
