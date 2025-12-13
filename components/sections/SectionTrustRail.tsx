// components/sections/SectionTrustRail.tsx
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type TrustCard = {
  id: string;
  topLabel: string;
  title: string;
  body: string;
  imageUrl: string; // 4:3 aspect artwork
};

const TRUST_CARDS: TrustCard[] = [
  {
    id: "background-checks",
    topLabel: "✔ Mandatory Background Checks | Licensed Professionals",
    title: "Verified & Safe",
    body: "Your safety comes first. Every in-person service provider completes a mandatory background check, and all licensed professionals are verified for proper credentials and compliance with state and local regulations.",
    imageUrl: "/images/verified-safe.jpg",
  },
  {
    id: "quality",
    topLabel: "★ Quality You Can Trust | Transparent Pricing",
    title: "Quality & Transparency",
    body: "We continuously monitor professional performance through your reviews and ratings. You’ll always know exactly what you’re paying for — no surprise fees, no hidden add-ons, just clear, upfront pricing every time.",
    imageUrl: "/images/quality-transparency.jpg",
  },
  {
    id: "communication",
    topLabel: "💬 Clear Communication | Secure Payments",
    title: "Reliable Communication & Secure Payments",
    body: "Stay informed with instant messaging and real-time updates at every step. Your funds are held securely until the work is approved, ensuring a worry-free payment experience for every project.",
    imageUrl: "/images/reliable-secure.jpg",
  },
];

type SectionTrustRailProps = {
  id?: string;
};

export function SectionTrustRail({ id }: SectionTrustRailProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState<number | null>(null);

  // Measure card width once for pagination buttons
  useEffect(() => {
    const trackEl = trackRef.current;
    if (!trackEl) return;

    const firstCard = trackEl.querySelector<HTMLElement>("[data-trust-card]");
    if (!firstCard) return;

    // card width + gap (Tailwind gap-4 -> 16px)
    setCardWidth(firstCard.offsetWidth + 16);
  }, []);

  // Vertical → horizontal hijack while inside the section (desktop only)
  useEffect(() => {
    const sectionEl = sectionRef.current;
    const trackEl = trackRef.current;
    if (!sectionEl || !trackEl) return;

    const handleWheel = (event: WheelEvent) => {
      const isDesktop = window.innerWidth >= 1024;
      if (!isDesktop) return;

      const deltaY = event.deltaY;
      const deltaX = event.deltaX;

      // If the gesture is already mostly horizontal, let the browser handle it.
      if (Math.abs(deltaX) > Math.abs(deltaY)) return;

      const maxScrollLeft = trackEl.scrollWidth - trackEl.clientWidth;
      if (maxScrollLeft <= 0) return;

      const atStart = trackEl.scrollLeft <= 0;
      const atEnd = trackEl.scrollLeft >= maxScrollLeft - 1;

      // At the very start (scroll up) or very end (scroll down) → release to page.
      if ((atStart && deltaY < 0) || (atEnd && deltaY > 0)) {
        return;
      }

      event.preventDefault();
      trackEl.scrollLeft += deltaY;
    };

    sectionEl.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      sectionEl.removeEventListener("wheel", handleWheel as EventListener);
    };
  }, []);

  // Update active index for dots
  useEffect(() => {
    const trackEl = trackRef.current;
    if (!trackEl || !cardWidth) return;

    const handleScroll = () => {
      const scrollLeft = trackEl.scrollLeft;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.max(0, Math.min(index, TRUST_CARDS.length - 1)));
    };

    trackEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      trackEl.removeEventListener("scroll", handleScroll);
    };
  }, [cardWidth]);

  const scrollToIndex = (index: number) => {
    const trackEl = trackRef.current;
    if (!trackEl || cardWidth == null) return;

    const clamped = Math.max(0, Math.min(index, TRUST_CARDS.length - 1));
    trackEl.scrollTo({
      left: clamped * cardWidth,
      behavior: "smooth",
    });
  };

  const handlePrev = () => scrollToIndex(activeIndex - 1);
  const handleNext = () => scrollToIndex(activeIndex + 1);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="overflow-x-hidden bg-white px-4 py-16 lg:py-24"
    >
      <div
        className="
          mx-auto flex max-w-6xl flex-col gap-8
          lg:grid lg:grid-cols-2 lg:items-start
        "
      >
        {/* Left column (≈ 2/5) */}
        <div className="lg:sticky lg:top-24">
          <p className="text-xs font-semibold tracking-[0.18em] text-neutral-500">
            TRUST &amp; SAFETY
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-neutral-900 sm:text-3xl lg:text-4xl">
            The only thing better than finding talent is trusting it.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
            Every interaction on WorkinAnts is built on quality, trust, and
            transparency—baked into the features you use every day.
          </p>

          {/* Progress indicator */}
          <div className="mt-6 flex items-center gap-2 text-xs text-neutral-500">
            <div className="flex gap-1">
              {TRUST_CARDS.map((card, idx) => (
                <span
                  key={card.id}
                  className={`h-1.5 w-5 rounded-full transition-opacity ${
                    idx === activeIndex
                      ? "bg-neutral-900 opacity-100"
                      : "bg-neutral-300 opacity-40"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2">
              {activeIndex + 1} / {TRUST_CARDS.length}
            </span>
          </div>
        </div>

        {/* Right column (≈ 3/5) */}
        <div className="relative lg:ml-6">
          {/* Right edge fade only */}
          <div className="pointer-events-none absolute inset-y-4 right-0 hidden w-8 bg-gradient-to-l from-white to-transparent lg:block" />

          {/* Pagination arrows (desktop only) */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="
              pointer-events-auto absolute left-0 top-1/2 hidden -translate-y-1/2
              rounded-full border border-neutral-200 bg-white/90 px-2 py-1 text-xs
              text-neutral-700 shadow-sm shadow-black/10
              disabled:cursor-not-allowed disabled:opacity-40
              lg:block
            "
          >
            ←
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={activeIndex === TRUST_CARDS.length - 1}
            className="
              pointer-events-auto absolute right-2 top-1/2 hidden -translate-y-1/2
              rounded-full border border-neutral-200 bg-white/90 px-2 py-1 text-xs
              text-neutral-700 shadow-sm shadow-black/10
              disabled:cursor-not-allowed disabled:opacity-40
              lg:block
            "
          >
            →
          </button>

          <div
            ref={trackRef}
            className="
              no-scrollbar
              -mx-4 flex overflow-x-auto px-4 pb-2
              scroll-smooth
              lg:mx-0 lg:px-0
            "
          >
            {TRUST_CARDS.map((card) => (
              <article
                key={card.id}
                data-trust-card
                className="
                  mr-4 flex min-w-[80%] max-w-[80%]
                  flex-col overflow-hidden rounded-2xl
                  border border-neutral-200 bg-white/90
                  shadow-sm shadow-black/5
                  last:mr-0
                  sm:min-w-[360px] sm:max-w-[360px]
                "
              >
                {/* Image block (4:3) */}
                <div className="relative w-full overflow-hidden ">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={card.imageUrl}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 360px"
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                </div>

                {/* Text block */}
                <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
                    {card.topLabel}
                  </p>
                  <h3 className="text-base font-semibold text-neutral-900 sm:text-lg">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    {card.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
