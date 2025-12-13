// components/ModeSwitcherSection.tsx
import type { ComponentType } from "react";
import { ShoppingCart, Briefcase, Building2, Target } from "lucide-react";

export default function ModeSwitcherSection() {
  return (
    <section className="bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div
          className="
            relative mx-auto flex flex-col gap-10 rounded-3xl
            bg-[#021A33] px-6 py-10 text-white shadow-2xl
            md:flex-row md:items-stretch md:px-10 md:py-12
          "
        >
          {/* Decorative gradient / waves */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0 rounded-3xl
              bg-[radial-gradient(circle_at_top_left,#0b4b89_0,transparent_55%)]
              opacity-60
            "
          />

          {/* Content wrapper */}
          <div className="relative z-10 flex w-full flex-col gap-10 md:flex-row">
            {/* Left column: copy */}
            <div className="md:w-1/2 lg:w-[55%]">
              <h2 className="text-balance text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
                Did you know you can jump between modes while browsing for
                services?
              </h2>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                You can be part of any mode-desire — one account works for every
                mode, linking all your activity in one place.
              </p>
            </div>

            {/* Right column: mode grid container */}
            <div
              className="
                md:w-1/2 lg:w-[45%]
                rounded-2xl bg-white/5 p-4 shadow-inner backdrop-blur
              "
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ModeCard
                  title="Client Mode"
                  description="Hire talent, purchase goods, track orders."
                  Icon={ShoppingCart}
                />
                <ModeCard
                  title="Professional Mode"
                  description="Sell services, products, and courses."
                  Icon={Briefcase}
                />
                <ModeCard
                  title="Employer Mode"
                  description="Hire full-time staff with flexible pricing."
                  Icon={Building2}
                />
                <ModeCard
                  title="Candidate Mode"
                  description="Find jobs, track applications, and get alerts."
                  Icon={Target}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type ModeCardProps = {
  title: string;
  description: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

function ModeCard({ title, description, Icon }: ModeCardProps) {
  return (
    <div
      className="
        flex flex-col justify-between gap-4 rounded-xl
        border border-white/10 bg-white/5 p-4
      "
    >
      <div className="flex items-start gap-3">
        {/* Square 1:1 icon */}
        <div
          className="
            flex h-10 w-10 items-center justify-center rounded-xl
            border border-white/10 bg-white/10
          "
        >
          <Icon className="h-5 w-5 text-white/90" aria-hidden="true" />
        </div>

        <div>
          <h3 className="text-sm font-semibold sm:text-base">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-white/75 sm:text-[0.8rem]">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="
          mt-1 inline-flex items-center justify-center rounded-full
          border border-white/20 bg-white/10 px-3 py-1.5
          text-xs font-medium text-white
          transition hover:bg-white/20
        "
      >
        Switch Mode
      </button>
    </div>
  );
}
