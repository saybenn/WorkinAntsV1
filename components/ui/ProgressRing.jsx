export default function ProgressRing({ value = 0 }) {
  const r = 18,
    c = 2 * Math.PI * r,
    off = c * (1 - value / 100);
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle
        cx="22"
        cy="22"
        r={r}
        stroke="var(--muted-400)"
        strokeWidth="6"
        fill="none"
      />
      <circle
        cx="22"
        cy="22"
        r={r}
        stroke="var(--blue-600)"
        strokeWidth="6"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
      />
      <text x="22" y="26" textAnchor="middle" fontSize="11" fill="currentColor">
        {value}%
      </text>
    </svg>
  );
}
