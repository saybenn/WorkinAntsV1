// components/listings/ListingCard.tsx
import Link from "next/link";
import type { ListingCardData } from "@/lib/types/listings";
import { money } from "@/lib/format";
type Props = {
  item: ListingCardData;
};

export function ListingCard({ item }: Props) {
  const {
    title,
    subtitle,
    priceFrom,
    priceUnitLabel,
    rating,
    imageUrl,
    badgeLabel,
    href,
  } = item;

  return (
    <Link
      href={href}
      className="flex-none w-64 cursor-pointer rounded-2xl bg-white shadow-sm transition hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        {imageUrl ? (
          // You can swap img for next/image later
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-xs text-neutral-500">
            No image
          </div>
        )}

        {/* Badge */}
        {badgeLabel && (
          <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-900">
            {badgeLabel}
          </span>
        )}

        {/* Heart icon placeholder */}
        <button
          type="button"
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-sm"
          aria-label="Save to favorites"
          onClick={(e) => e.preventDefault()} // prevent navigation for now
        >
          ♥
        </button>
      </div>

      {/* Text content */}
      <div className="px-2.5 pt-2 pb-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">
            {subtitle}
          </p>
        )}

        {/* Price + rating row */}
        <div className="mt-1 flex items-center justify-between text-xs text-neutral-700">
          <span>
            {priceFrom != null && !Number.isNaN(priceFrom) ? (
              <>
                From {money(priceFrom)}
                {priceUnitLabel ? ` ${priceUnitLabel}` : null}
              </>
            ) : (
              <span className="text-neutral-400">Pricing varies</span>
            )}
          </span>

          {rating != null && (
            <span className="flex items-center gap-0.5">
              <span>★</span>
              <span>{rating.toFixed(2)}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
