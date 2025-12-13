// components/sections/SectionTestimonials.tsx
import testimonialsJson from "@/data/testimonials.json";
import { TestimonialCard } from "../testimonials/TestimonialCards";
import type { Testimonial } from "@/lib/types/testimonial";

type Props = {
  id?: string;
  heading?: string;
  subheading?: string;
  testimonials?: Testimonial[];
};

export function SectionTestimonials({
  id,
  heading = "Real experiences from the WorkinAnts community.",
  subheading = "Quality, trust, and transparency aren’t slogans — they’re designed into the platform.",
  testimonials,
}: Props) {
  const items = (testimonials ?? (testimonialsJson as Testimonial[])) || [];
  const featured = items[0];

  if (!featured) return null;

  return (
    <section id={id} className="bg-[var(--bg-950)] px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-700)]">
            Testimonials
          </p>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--ink-900)] sm:text-3xl lg:text-4xl">
            {heading}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-700)] sm:text-base">
            {subheading}
          </p>
        </div>

        <TestimonialCard testimonial={featured} />
      </div>
    </section>
  );
}
