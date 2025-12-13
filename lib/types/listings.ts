// lib/types/listings.ts (unchanged)
export type ListingKind = "service" | "course" | "product";

export type ListingCardData = {
  id: string;
  kind: ListingKind;
  title: string;
  subtitle?: string | null;
  priceFrom?: number | null;
  priceUnitLabel?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  imageUrl?: string | null;
  badgeLabel?: string | null;
  href: string;
};
