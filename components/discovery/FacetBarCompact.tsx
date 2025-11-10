// /components/discovery/FacetBarCompact.tsx
import { useEffect, useState } from "react";
import { useGeo } from "@/hooks/useGeo";

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

export default function FacetBarCompact({
  onChange,
}: {
  onChange: (state: {
    radius?: number;
    isDigital?: boolean;
    priceMin?: number;
    priceMax?: number;
    geo?: { lat: number; lng: number } | null;
  }) => void;
}) {
  const [askGeo, setAskGeo] = useState(false);
  const { geo } = useGeo(askGeo);

  const [radius, setRadius] = useState<number | undefined>(undefined);
  const [isDigital, setIsDigital] = useState(false);

  // Budget
  const [quickMax, setQuickMax] = useState<number | undefined>(undefined);
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [budgetActive, setBudgetActive] = useState(false);
  const [showBudget, setShowBudget] = useState(false);

  // Emit only what’s active
  useEffect(() => {
    const payload: any = {
      radius,
      isDigital,
      geo: geo ?? null,
    };
    if (budgetActive) {
      if (priceMin != null) payload.priceMin = priceMin;
      if (priceMax != null) payload.priceMax = priceMax;
      // If user never opened detailed modal, allow quickMax to serve as priceMax
      if (priceMax == null && quickMax != null) payload.priceMax = quickMax;
    }
    onChange(payload);
  }, [
    radius,
    isDigital,
    geo,
    budgetActive,
    priceMin,
    priceMax,
    quickMax,
    onChange,
  ]);

  const clearBudget = () => {
    setBudgetActive(false);
    setQuickMax(undefined);
    setPriceMin(undefined);
    setPriceMax(undefined);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--r-lg)] border border-[var(--border)] bg-[color:color-mix(in_oklab,var(--card-900) 85%,transparent)] p-3 backdrop-blur-[6px]">
      {/* Location */}
      <button
        className="rounded-full border px-3 py-1 text-sm"
        onClick={() => setAskGeo(true)}
      >
        Use my location
      </button>

      <label className="flex items-center gap-2 text-sm">
        Radius (mi)
        <input
          type="number"
          min={1}
          max={200}
          placeholder="25"
          className="w-20 rounded border bg-transparent px-2 py-1"
          onChange={(e) => {
            const v = Number(e.target.value) || undefined;
            setRadius(v);
            window.dataLayer?.push({
              event: "discovery_radius_change",
              miles: v,
            });
          }}
        />
      </label>

      {/* Digital */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isDigital}
          onChange={(e) => setIsDigital(e.target.checked)}
        />
        Digital only
      </label>

      {/* Budget */}
      <div className="flex items-center gap-2 text-sm">
        <span>Budget</span>
        <input
          type="range"
          min={0}
          max={5000}
          step={50}
          value={quickMax ?? 0}
          onChange={(e) => {
            setQuickMax(Number(e.target.value));
            setBudgetActive(true);
          }}
        />
        <button
          className="rounded border px-2 py-1 text-xs"
          onClick={() => {
            setShowBudget(true);
            setBudgetActive(true);
          }}
        >
          set min–max
        </button>
        {budgetActive && (
          <button
            className="rounded border px-2 py-1 text-xs"
            onClick={clearBudget}
          >
            clear
          </button>
        )}
      </div>

      <div className="ml-auto text-xs opacity-70">
        {budgetActive ? "Budget: on" : "Budget: off"}
      </div>

      {showBudget && (
        <dialog
          open
          className="rounded-xl border bg-[var(--card-900)] p-4 backdrop:bg-black/30"
        >
          <h3 className="mb-2 text-sm font-medium">Budget range</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm">
              $ Min
              <input
                type="number"
                className="ml-2 w-24 rounded border bg-transparent px-2 py-1"
                value={priceMin ?? ""}
                onChange={(e) =>
                  setPriceMin(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </label>
            <label className="text-sm">
              $ Max
              <input
                type="number"
                className="ml-2 w-24 rounded border bg-transparent px-2 py-1"
                value={priceMax ?? ""}
                onChange={(e) =>
                  setPriceMax(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </label>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              className="rounded border px-3 py-1"
              onClick={() => setShowBudget(false)}
            >
              Close
            </button>
            <button
              className="rounded border px-3 py-1"
              onClick={() => {
                setBudgetActive(true);
                setShowBudget(false);
              }}
            >
              Apply
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
