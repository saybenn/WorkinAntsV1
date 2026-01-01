// components/app/SidebarModeSwitcher.tsx
import { useEffect, useMemo, useState } from "react";
import type { DbUserRole, UIMode } from "../../lib/role";
import { getDefaultModeFromRoleSet } from "../../lib/role";

type Props = {
  role_set: DbUserRole[];
  activeMode?: UIMode;
  onModeChange: (mode: UIMode) => void;
  onStartOnboarding: (mode: UIMode) => void;
};

const MODES: {
  mode: UIMode;
  label: string;
  dbRole: Exclude<DbUserRole, "admin">;
}[] = [
  { mode: "client", label: "Client", dbRole: "client" },
  { mode: "professional", label: "Professional", dbRole: "provider" },
  { mode: "job_seeker", label: "Job Seeker", dbRole: "candidate" },
  { mode: "organization", label: "Organization", dbRole: "employer" },
];

export default function SidebarModeSwitcher({
  role_set,
  activeMode,
  onModeChange,
  onStartOnboarding,
}: Props) {
  // unlocked: all roles except admin
  const unlocked = useMemo(
    () => new Set(role_set.filter((r) => r !== "admin")),
    [role_set]
  );

  const defaultMode = useMemo(
    () => getDefaultModeFromRoleSet(role_set),
    [role_set]
  );

  const [localMode, setLocalMode] = useState<UIMode>(activeMode ?? defaultMode);

  // restore + persist
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("wa_mode") as UIMode | null;
      const valid = saved && MODES.some((m) => m.mode === saved);
      const next = valid ? (saved as UIMode) : defaultMode;

      setLocalMode(next);
      onModeChange(next);
    } catch {
      setLocalMode(defaultMode);
      onModeChange(defaultMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultMode]);

  useEffect(() => {
    if (activeMode) setLocalMode(activeMode);
  }, [activeMode]);

  const pick = (m: UIMode, isUnlocked: boolean) => {
    if (!isUnlocked) return onStartOnboarding(m);

    setLocalMode(m);
    onModeChange(m);
    try {
      window.localStorage.setItem("wa_mode", m);
    } catch {}
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ color: "var(--ink-700)", fontSize: 12 }}>Switch Mode</div>

      <div style={{ display: "grid", gap: 6 }}>
        {MODES.map((m) => {
          // FIX: m.dbRole can never be "admin" (typed as Exclude<...,"admin">)
          const isUnlocked = unlocked.has(m.dbRole);
          const active = localMode === m.mode;

          return (
            <button
              key={m.mode}
              type="button"
              onClick={() => pick(m.mode, isUnlocked)}
              aria-disabled={!isUnlocked}
              title={
                !isUnlocked
                  ? "Not enabled on your account. Click to onboard."
                  : undefined
              }
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 12,
                border: `1px solid ${
                  active ? "rgba(125,211,252,0.35)" : "rgba(255,255,255,0.10)"
                }`,
                background: active
                  ? "rgba(125,211,252,0.10)"
                  : "rgba(255,255,255,0.03)",
                color: isUnlocked ? "var(--ink-900)" : "var(--muted-400)",
                cursor: "pointer",
                opacity: isUnlocked ? 1 : 0.75,
              }}
            >
              {m.label}
              {!isUnlocked && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: "var(--muted-400)",
                  }}
                >
                  Locked
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
