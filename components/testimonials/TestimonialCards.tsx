// components/testimonials/TestimonialCard.tsx
import Image from "next/image";
import { StarRating } from "@/components/ui/StarRating";
import type { Testimonial } from "@/lib/types/testimonial";

type Props = {
  testimonial: Testimonial;
};

export function TestimonialCard({ testimonial }: Props) {
  return (
    <div
      className="
        relative overflow-hidden
        rounded-[var(--r-lg)]
        border border-[var(--border)]
        bg-[var(--glass-bg)]
        shadow-[var(--glass-shadow)]
        ring-1 ring-[var(--glass-ring)]
        backdrop-blur
      "
    >
      {/* subtle rail glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]
          opacity-70
        "
      />

      <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        {/* Left */}
        <div className="relative flex flex-col items-start">
          {/* Open quote */}
          <div className="mb-4 text-[var(--aqua-300)] hidden lg:block">
            <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M7.17 6C4.87 6 3 7.87 3 10.17V18h7v-7H7.5c-.83 0-1.5-.67-1.5-1.5S6.67 8 7.5 8H10V6H7.17Zm9 0C13.87 6 12 7.87 12 10.17V18h7v-7h-2.5c-.83 0-1.5-.67-1.5-1.5S15.67 8 16.5 8H19V6h-2.83Z"
              />
            </svg>
          </div>

          {/* Avatar */}
          <div
            className="
              relative h-32 w-32 overflow-hidden rounded-full
              bg-[var(--card-800)]
              ring-1 ring-[var(--border-strong)]
              sm:h-36 sm:w-36
            "
          >
            {testimonial.avatarUrl ? (
              <Image
                src={testimonial.avatarUrl}
                alt={testimonial.name}
                fill
                sizes="160px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[var(--ink-700)]">
                No image
              </div>
            )}
          </div>

          {/* Decorative underline */}
          <div className="mt-6 hidden h-1 w-32 rounded-full bg-[var(--blue-500)] lg:block" />
        </div>

        {/* Right */}
        <div className="relative">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div>
              <p className="text-xl font-semibold tracking-tight text-[var(--ink-900)]">
                {testimonial.name}
              </p>
              <p className="text-sm text-[var(--ink-700)]">
                {testimonial.roleLabel}
              </p>
            </div>

            <div className="sm:text-right">
              <StarRating value={testimonial.rating} />
              <p className="mt-1 text-xs text-[var(--ink-700)]">
                {testimonial.rating.toFixed(1)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p
              className="
                text-2xl font-extrabold uppercase tracking-[0.06em]
                text-[var(--ink-900)] sm:text-3xl
              "
            >
              {testimonial.headline}
            </p>
            <p
              className="
                mt-4 text-[var(--size-base)] leading-[var(--leading-normal)]
                text-[var(--ink-700)]
                sm:text-[var(--size-lg)]
              "
            >
              {testimonial.body}
            </p>
          </div>

          {/* Closing quote */}
          <div className="pointer-events-none absolute bottom-2 right-4 text-[var(--aqua-300)]/70 sm:bottom-4 sm:right-6 hidden lg:block">
            <svg width="64" height="64" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M16.83 18c2.3 0 4.17-1.87 4.17-4.17V6h-7v7h2.5c.83 0 1.5.67 1.5 1.5S17.33 16 16.5 16H14v2h2.83ZM7.17 18c2.3 0 4.17-1.87 4.17-4.17V6H4v7h2.5c.83 0 1.5.67 1.5 1.5S7.33 16 6.5 16H4v2h3.17Z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
