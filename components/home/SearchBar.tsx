// components/SearchBar.tsx
import { useState } from "react";
import type { FormEvent } from "react";

export type CategoryId = string;

type SearchBarProps = {
  placeholder?: string;
  defaultValue?: string;

  categoryFilters?: CategoryId[];
  defaultCategory?: CategoryId;
  onCategoryChange?: (category: CategoryId) => void;

  onSubmit?: (query: string, category?: CategoryId) => void;

  containerClassName?: string;
  inputClassName?: string;
  buttonClassName?: string;
  iconClassName?: string;

  categoryLabelMap?: Record<string, string>;
};

export default function SearchBar({
  placeholder = "Find a provider or service…",
  defaultValue = "",
  categoryFilters,
  defaultCategory,
  onCategoryChange,
  onSubmit = () => {},

  containerClassName = "",
  inputClassName = "",
  buttonClassName = "",
  iconClassName = "",
  categoryLabelMap = {},
}: SearchBarProps) {
  const [q, setQ] = useState(defaultValue);

  const hasCategories =
    Array.isArray(categoryFilters) && categoryFilters.length > 0;
  const initialCategory = hasCategories
    ? defaultCategory ?? categoryFilters![0]
    : undefined;

  const [activeCategory, setActiveCategory] = useState<CategoryId | undefined>(
    initialCategory
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(q.trim(), activeCategory);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
      role="search"
      aria-label="Global Search"
    >
      <div
        className={[
          // pill container
          "flex w-full items-center gap-2 rounded-full border border-muted-400/40 bg-white",
          "shadow-[0_6px_24px_rgba(0,0,0,.08)]",
          // consistent height + padding
          "h-12 px-2",
          containerClassName,
        ].join(" ")}
      >
        {/* Category pills (optional) */}
        {hasCategories && (
          <div className="hidden flex-shrink-0 items-center gap-1 sm:flex bg-[#0b4b89] rounded-full">
            {categoryFilters!.map((kind) => {
              const isActive = kind === activeCategory;
              const label =
                categoryLabelMap[kind] ??
                kind[0]?.toUpperCase() + kind.slice(1);

              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => {
                    setActiveCategory(kind);
                    onCategoryChange?.(kind);
                  }}
                  className={[
                    "rounded-full px-3 py-2 text-xs font-medium transition text-gray-300 hover:cursor-pointer",
                    isActive
                      ? "bg-ink-900 text-white"
                      : "bg-muted-50 text-ink-800 hover:bg-muted-100",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Divider if categories exist (desktop) */}
        {hasCategories && (
          <div className="hidden h-7 w-px bg-muted-300/60 sm:block" />
        )}

        {/* Search icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          className={[
            "text-ink-700 flex-shrink-0 ml-2 sm:ml-1",
            iconClassName,
          ].join(" ")}
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.71.71l.27.28v.79l5 5 1.49-1.49-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
          />
        </svg>

        {/* Input (min-w-0 prevents flex overflow weirdness) */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className={[
            "min-w-0 flex-1 bg-transparent outline-none",
            "text-sm text-ink-900 placeholder:text-ink-700/60",
            "px-2",
            inputClassName,
          ].join(" ")}
          aria-label={placeholder}
        />

        {/* Submit */}
        <button
          type="submit"
          className={[
            "flex-shrink-0 rounded-full px-4 py-2 bg-[#0b4b89] text-sm font-medium",
            " text-white hover:bg-ink-800 transition",
            "h-10",
          ].join(" ")}
          data-cta="search"
        >
          Search
        </button>
      </div>

      {/* Mobile category pills (below) */}
      {hasCategories && (
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:hidden">
          {categoryFilters!.map((kind) => {
            const isActive = kind === activeCategory;
            const label =
              categoryLabelMap[kind] ?? kind[0]?.toUpperCase() + kind.slice(1);

            return (
              <button
                key={kind}
                type="button"
                onClick={() => {
                  setActiveCategory(kind);
                  onCategoryChange?.(kind);
                }}
                className={[
                  "rounded-full px-3 py-2 text-xs font-medium transition text-gray-300 hover:cursor-pointer bg-[#0b4b89]",
                  isActive
                    ? "bg-ink-900 text-white"
                    : "bg-muted-50 text-ink-800 hover:bg-muted-100",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </form>
  );
}
