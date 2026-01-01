// src/components/shared/SearchBar.tsx
import { useEffect, useId, useMemo, useState } from "react";
import type { FormEvent } from "react";

export type CategoryId = string;

export type SearchBarProps = {
  /** Placeholder text for the input */
  placeholder?: string;

  /** Uncontrolled initial value (ignored if `value` is provided) */
  defaultValue?: string;

  /** Controlled value (optional). If provided, component becomes controlled. */
  value?: string;

  /** Controlled onChange (required when `value` is provided) */
  onChange?: (next: string) => void;

  /** Optional max length for query */
  maxLength?: number;

  /** Optional category pills (top row on desktop, bottom row on mobile) */
  categoryFilters?: CategoryId[];

  /** Default category selection. If not provided, first item in `categoryFilters` is used. */
  defaultCategory?: CategoryId;

  /** Called when category pill changes */
  onCategoryChange?: (category: CategoryId) => void;

  /**
   * Called on form submit.
   * - query is trimmed and normalized
   * - category is passed when categories exist
   */
  onSubmit: (query: string, category?: CategoryId) => void;

  /** Optional label map for categories */
  categoryLabelMap?: Record<string, string>;

  /** Optional styling hooks */
  containerClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  iconClassName?: string;

  /** Optional: if true, show desktop pills; if false, hide them entirely */
  showDesktopCategories?: boolean;

  /** Optional: if true, show mobile pills; if false, hide them entirely */
  showMobileCategories?: boolean;
};

function normalizeQuery(q: string) {
  // trim + remove control chars
  return q.trim().replace(/[\u0000-\u001F\u007F]/g, "");
}

export default function SearchBar({
  placeholder = "Find a professional, service, product, or course…",
  defaultValue = "",
  value,
  onChange,
  maxLength = 80,

  categoryFilters,
  defaultCategory,
  onCategoryChange,
  onSubmit,

  categoryLabelMap = {},

  containerClassName = "",
  inputClassName = "",
  buttonClassName = "",
  iconClassName = "",

  showDesktopCategories = true,
  showMobileCategories = true,
}: SearchBarProps) {
  const inputId = useId();

  const hasCategories =
    Array.isArray(categoryFilters) && categoryFilters.length > 0;

  // --- Query state (controlled/uncontrolled) ---
  const isControlled = typeof value === "string";
  const [internalQ, setInternalQ] = useState(defaultValue);

  const q = isControlled ? (value as string) : internalQ;

  const setQ = (next: string) => {
    if (isControlled) onChange?.(next);
    else setInternalQ(next);
  };

  // --- Category selection ---
  const computedInitialCategory = useMemo(() => {
    if (!hasCategories) return undefined;
    if (defaultCategory && categoryFilters!.includes(defaultCategory))
      return defaultCategory;
    return categoryFilters![0];
  }, [hasCategories, defaultCategory, categoryFilters]);

  const [activeCategory, setActiveCategory] = useState<CategoryId | undefined>(
    computedInitialCategory
  );

  // Keep activeCategory valid when filters/default changes
  useEffect(() => {
    if (!hasCategories) {
      setActiveCategory(undefined);
      return;
    }
    // If current selection is no longer valid, reset
    if (!activeCategory || !categoryFilters!.includes(activeCategory)) {
      setActiveCategory(computedInitialCategory);
      return;
    }
    // If defaultCategory changes and is valid, adopt it
    if (
      defaultCategory &&
      categoryFilters!.includes(defaultCategory) &&
      defaultCategory !== activeCategory
    ) {
      setActiveCategory(defaultCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasCategories,
    categoryFilters,
    defaultCategory,
    computedInitialCategory,
  ]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = normalizeQuery(q);
    onSubmit(cleaned, hasCategories ? activeCategory : undefined);
  };

  const pickCategory = (cat: CategoryId) => {
    setActiveCategory(cat);
    onCategoryChange?.(cat);
  };

  const labelFor = (id: string) => {
    const mapped = categoryLabelMap[id];
    if (mapped) return mapped;
    return id ? id.charAt(0).toUpperCase() + id.slice(1) : id;
  };

  return (
    <form
      onSubmit={submit}
      className="w-full"
      role="search"
      aria-label="Global search"
    >
      <div
        className={[
          // container
          "flex w-full items-center gap-2 rounded-full border",
          "h-12 px-2",
          // token-driven surface (no hard-coded color)
          "bg-[var(--bg-ivory)]",
          "border-[color:var(--border)]",
          "shadow-[var(--shadow-soft)]",
          containerClassName,
        ].join(" ")}
      >
        {/* Desktop category pills (inline) */}
        {hasCategories && showDesktopCategories && (
          <div
            className={[
              "hidden sm:flex flex-shrink-0 items-center gap-1 rounded-full",
              "bg-[color:var(--blue-800)]",
              "px-1 py-1",
            ].join(" ")}
            aria-label="Search scope"
          >
            {categoryFilters!.map((kind) => {
              const isActive = kind === activeCategory;
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => pickCategory(kind)}
                  className={[
                    "rounded-full px-3 py-2 text-xs font-medium transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--aqua-300)]",
                    isActive
                      ? "bg-[color:var(--bg-950)] text-[color:var(--ink-900)]"
                      : "bg-transparent text-[color:var(--ink-700)] hover:bg-white/10",
                  ].join(" ")}
                  aria-pressed={isActive}
                >
                  {labelFor(kind)}
                </button>
              );
            })}
          </div>
        )}

        {/* Divider if desktop categories exist */}
        {hasCategories && showDesktopCategories && (
          <div
            className="hidden sm:block h-7 w-px bg-[color:var(--border)]"
            aria-hidden="true"
          />
        )}

        {/* Search icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className={[
            "flex-shrink-0 ml-2 sm:ml-1",
            "text-[color:var(--ink-700)]",
            iconClassName,
          ].join(" ")}
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.71.71l.27.28v.79l5 5 1.49-1.49-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
          />
        </svg>

        {/* Input */}
        <label className="sr-only" htmlFor={inputId}>
          {placeholder}
        </label>
        <input
          id={inputId}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={[
            "min-w-0 flex-1 bg-transparent outline-none",
            "text-sm text-[color:var(--ink-900)] placeholder:text-[color:var(--ink-700)]",
            "px-2",
            inputClassName,
          ].join(" ")}
          aria-label={placeholder}
          inputMode="search"
          autoComplete="off"
        />

        {/* Submit */}
        <button
          type="submit"
          className={[
            "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
            "h-10",
            "border border-[color:var(--border)]",
            "bg-[color:var(--blue-800)] text-[color:var(--ink-900)]",
            "hover:bg-[color:var(--blue-600)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--aqua-300)]",
            buttonClassName,
          ].join(" ")}
          data-cta="search"
        >
          Search
        </button>
      </div>

      {/* Mobile category pills (below) */}
      {hasCategories && showMobileCategories && (
        <div
          className="mt-3 flex flex-wrap justify-center gap-2 sm:hidden"
          aria-label="Search scope"
        >
          {categoryFilters!.map((kind) => {
            const isActive = kind === activeCategory;
            return (
              <button
                key={kind}
                type="button"
                onClick={() => pickCategory(kind)}
                className={[
                  "rounded-full px-3 py-2 text-xs font-medium transition",
                  "border border-[color:var(--border)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--aqua-300)]",
                  isActive
                    ? "bg-[color:var(--bg-950)] text-[color:var(--ink-900)]"
                    : "bg-[color:var(--blue-800)] text-[color:var(--ink-700)] hover:bg-[color:var(--blue-600)]",
                ].join(" ")}
                aria-pressed={isActive}
              >
                {labelFor(kind)}
              </button>
            );
          })}
        </div>
      )}
    </form>
  );
}
