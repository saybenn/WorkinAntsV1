// components/sections/SectionExplore.tsx
import type { ListingCardData } from "@/lib/types/listings";
import { ListingCarousel } from "../listings/ListingCarousel";
type Props = {
  services: ListingCardData[];
  courses: ListingCardData[];
  products: ListingCardData[];
};

export function SectionExplore({ services, courses, products }: Props) {
  return (
    <section className="bg-white px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <ListingCarousel
          title="Explore and Book on WorkinAnts"
          items={services}
          viewAllHref="/services"
        />

        <ListingCarousel
          title="Learning on WorkinAnts"
          items={courses}
          viewAllHref="/courses"
        />

        <ListingCarousel
          title="All Ready Made on WorkinAnts"
          items={products}
          viewAllHref="/products"
        />
      </div>
    </section>
  );
}
