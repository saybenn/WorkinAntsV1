// components/ui/StarRating.tsx
import React from "react";

type Props = {
  value: number; // 0..5
  max?: number;
  showNumber?: boolean;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function StarRating({
  value,
  max = 5,
  showNumber = true,
  className = "",
}: Props) {
  const safe = clamp(value ?? 0, 0, max);
  const full = Math.floor(safe);
  const hasHalf = safe - full >= 0.5;

  return (
    <div className={["flex items-center gap-2", className].join(" ").trim()}>
      <div
        className="flex items-center gap-1"
        aria-label={`Rating ${safe} out of ${max}`}
      >
        {Array.from({ length: max }).map((_, i) => {
          const idx = i + 1;
          const filled = idx <= full;
          const half = !filled && hasHalf && idx === full + 1;

          return (
            <span key={idx} className="inline-flex">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={
                  filled || half ? "text-amber-400" : "text-neutral-200"
                }
              >
                {half ? (
                  <>
                    <defs>
                      <linearGradient id={`half-${idx}`}>
                        <stop offset="50%" stopColor="currentColor" />
                        <stop offset="50%" stopColor="#e5e5e5" />
                      </linearGradient>
                    </defs>
                    <path
                      fill={`url(#half-${idx})`}
                      d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    />
                  </>
                ) : (
                  <path
                    fill="currentColor"
                    d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    className={filled ? "" : "opacity-100"}
                  />
                )}
              </svg>
            </span>
          );
        })}
      </div>

      {showNumber && (
        <span className="text-sm font-medium text-ink-900">
          {safe.toFixed(1)}
        </span>
      )}
    </div>
  );
}
