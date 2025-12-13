// components/sections/SectionStartSimple.tsx
import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/home/SearchBar";

type CategoryIdStrict = "services" | "products" | "courses";

type CategoryCard = {
  id: CategoryIdStrict;
  label: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: "services",
    label: "Services",
    href: "/services",
    imageSrc: "/images/services.png",
    imageAlt: "Two people discussing a service project.",
  },
  {
    id: "products",
    label: "Products",
    href: "/products",
    imageSrc: "/images/products.png",
    imageAlt: "A digital document or template on a tablet screen.",
  },
  {
    id: "courses",
    label: "Courses",
    href: "/courses",
    imageSrc: "/images/courses.png",
    imageAlt: "A person presenting in front of a whiteboard.",
  },
];

type SectionStartSimpleProps = {
  id?: string;
  onSearchSubmit?: (query: string, kind: CategoryIdStrict) => void;
};

export function SectionStartSimple({
  id,
  onSearchSubmit,
}: SectionStartSimpleProps) {
  return (
    <section id={id} className="bg-neutral-50 px-4 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        {/* Header */}
        <div className="max-w-3xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
            Starting is as simple as that,
            <br className="hidden sm:block" />{" "}
            <span className="text-neutral-900">
              just let us know what you need.
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
            Browse what&apos;s trending on WorkinAnts or use our smart search to
            jump straight to the right services, products, or courses.
          </p>
        </div>

        {/* Unified SearchBar */}
        <div className="mt-8 w-full max-w-3xl">
          <SearchBar
            placeholder="Search all offerings (e.g. logos, tutoring, cleaning...)"
            categoryFilters={["services", "products", "courses"]}
            defaultCategory="products"
            categoryLabelMap={{
              services: "Services",
              products: "Products",
              courses: "Courses",
            }}
            containerClassName="
              rounded-full border border-neutral-200 bg-white/90
              shadow-sm shadow-black/5
            "
            inputClassName="
              text-sm text-neutral-900 placeholder:text-neutral-400
            "
            buttonClassName="
              text-xs font-medium rounded-full bg-neutral-900 hover:bg-neutral-800
            "
            iconClassName="text-neutral-500"
            onSubmit={(query, category) => {
              const kind = (category as CategoryIdStrict) ?? "products";

              if (onSearchSubmit) {
                onSearchSubmit(query, kind);
              } else if (typeof window !== "undefined") {
                const params = new URLSearchParams();
                if (query.trim()) params.set("q", query.trim());
                if (kind) params.set("kind", kind);
                window.location.href = `/search?${params.toString()}`;
              }
            }}
          />
        </div>

        {/* Card grid */}
        <div className="mt-10 grid w-full gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_CARDS.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="
                group flex flex-col overflow-hidden rounded-2xl
                border border-neutral-200 bg-white
                shadow-sm shadow-black/5 transition
                hover:-translate-y-1 hover:shadow-md
              "
            >
              {/* Image block */}
              <div className="relative w-full bg-neutral-100">
                <div className="aspect-[4/3] w-full">
                  <Image
                    src={card.imageSrc}
                    alt={card.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Text / CTA */}
              <div className="flex items-center justify-between px-4 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    {card.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-900">
                    View all
                  </p>
                </div>
                <span
                  className="
                    text-sm font-semibold text-neutral-400
                    transition group-hover:translate-x-1 group-hover:text-neutral-700
                  "
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
