import { timeOfDay } from "@/lib/timeOfDay";

export default function DashboardHeader({ name }: { name: string }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ fontSize: 24, fontWeight: 750 }}>
        Good {timeOfDay()}, {name}.
      </div>
      <div style={{ color: "var(--ink-700)" }}>
        Find what you need fast — or post a job and let professionals come to
        you.
      </div>
    </div>
  );
}
