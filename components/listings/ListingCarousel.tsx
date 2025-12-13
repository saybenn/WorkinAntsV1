// components/listings/ListingCarousel.tsx
import type { ListingCardData } from "@/lib/types/listings";
import { ListingCard } from "./ListingCard";

type Props = {
  title: string;
  items: ListingCardData[];
  viewAllHref?: string;
};

export function ListingCarousel({ title, items, viewAllHref }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">
          {title}
        </h2>

        {viewAllHref && (
          <a
            href={viewAllHref}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-800"
          >
            View all →
          </a>
        )}
      </div>

      <div className="-mx-4 overflow-x-auto pb-2 no-scrollbar">
        <div
          className="
            flex gap-4 px-4
            scroll-smooth
          "
        >
          {items.map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
