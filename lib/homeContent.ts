// /lib/homeContent.ts
export type Mode = "customer" | "professional" | "careerSeeker" | "employer";

export type AccentTokens = {
  accentBg: string;    // e.g. "bg-(--accent-customer)"
  accentText: string;  // e.g. "text-(--accent-customer)"
  accentBorder: string;
};

export type ScrollyTidbit = {
  id: string;
  step: string;        // "1", "2", "3", "4"
  label: string;       // "Finding Quality Services"
  title: string;       // "Find Proven Providers Faster"
  body: string;
};

export type CtaSection = {
  headline: string;
  subheadline: string;
  primaryLabel: string;
  secondaryLabel?: string;
};

export type TrustColumn = {
  title: string;
  body: string;
};

export type CarouselConfig = {
  id: string;          // "popularServices"
  headline: string;    // "Popular Services"
  // later: query keys, filters, etc.
};

export type TestimonialConfig = {
  headline: string;
  subheadline: string;
  // later: maybe tag or segment key
};

export type ModeContent = {
  label: string;               // "Customer"
  description: string;         // short label under the card
  accent: AccentTokens;
  heroSubtitle: string;
  scrollyHeadline: string;
  scrollySubheadline: string;
  scrollyTidbits: ScrollyTidbit[];
  cta: CtaSection;
  trust: {
    headline: string;
    subheadline: string;
    columns: TrustColumn[];
  };
  carousels: CarouselConfig[];
  testimonials: TestimonialConfig;
};
// /lib/homeContent.ts
export const HOME_CONTENT: Record<Mode, ModeContent> = {
  customer: {
    label: "Customer",
    description: "Buying services & products",
    accent: {
      accentBg: "bg-(--accent-customer)",
      accentText: "text-(--accent-customer)",
      accentBorder: "border-(--accent-customer)",
    },
    heroSubtitle:
      "A trusted marketplace for services, products, courses, and jobs — available anytime, anywhere.",
    scrollyHeadline: "How WorkinAnts Helps You Get Things Done.",
    scrollySubheadline:
      "A simple journey from ‘I need help’ to ‘job completed with confidence’.",
    scrollyTidbits: [
      {
        id: "find",
        step: "1",
        label: "Finding Quality Services",
        title: "Find Proven Providers Faster",
        body:
          "Search by skill, rating, budget, and location. Instantly see verified pros with reviews from real customers like you.",
      },
      {
        id: "book",
        step: "2",
        label: "Booking & Payment Suite",
        title: "Book and Pay in One Place",
        body:
          "Message providers, agree on terms, and pay securely inside WorkinAnts. No chasing invoices or random payment links.",
      },
      {
        id: "learn",
        step: "3",
        label: "Expanding Knowledge",
        title: "Learn From the Same Experts You Hire",
        body:
          "Explore courses and certifications from vetted experts so you can level up your own skills while your projects move forward.",
      },
      {
        id: "journey",
        step: "4",
        label: "The Complete Journey",
        title: "Track Every Step in One Dashboard",
        body:
          "Keep messages, files, milestones, and payments organized in one clean project view from first search to final review.",
      },
    ],
    cta: {
      headline: "Ready to Get That Off Your Plate?",
      subheadline:
        "Post what you need or start browsing verified providers in minutes — no commitment, no upfront fees.",
      primaryLabel: "Sign Up for Free",
      secondaryLabel: "Browse without signing up",
    },
    trust: {
      headline: "The Only Thing Better Than Finding Talent Is Trusting It.",
      subheadline:
        "We prioritize your safety and peace of mind with verified talent and transparent reviews.",
      columns: [
        {
          title: "Verified & Safe",
          body:
            "We run identity and background checks on qualifying providers, so you’re not hiring a stranger off the internet.",
        },
        {
          title: "Licensed Professionals",
          body:
            "Providers can upload and verify licenses, certifications, and insurance where applicable, so you know exactly who you’re hiring.",
        },
        {
          title: "Commitment to Quality",
          body:
            "We continuously audit reviews, investigate disputes, and remove providers who don’t meet our standards.",
        },
      ],
    },
    carousels: [
      {
        id: "popularServices",
        headline: "Popular Services",
      },
      {
        id: "topCourses",
        headline: "Top-Rated Courses",
      },
      {
        id: "digitalProducts",
        headline: "Digital Products & Templates",
      },
    ],
    testimonials: {
      headline: "Trusted by Businesses and Individuals Worldwide.",
      subheadline:
        "See how customers use WorkinAnts to save time, reduce risk, and get work done right the first time.",
    },
  },

  professional: {
    label: "Professional",
    description: "Selling your skills & services",
    accent: {
      accentBg: "bg-(--accent-professional)",
      accentText: "text-(--accent-professional)",
      accentBorder: "border-(--accent-professional)",
    },
    heroSubtitle:
      "Turn your skills into predictable income with a provider-first marketplace built around trust and repeat work.",
    scrollyHeadline: "Grow a Real Practice, Not Just a Profile.",
    scrollySubheadline:
      "From first booking to repeat clients, WorkinAnts helps you build a serious service business.",
    scrollyTidbits: [], // fill with provider narrative later
    cta: {
      headline: "Ready to Earn More From Your Skills?",
      subheadline:
        "Create your provider profile, list your services, and start getting booked by serious clients.",
      primaryLabel: "Start Selling",
      secondaryLabel: "View provider benefits",
    },
    trust: {
      headline: "A Platform That Has Your Back.",
      subheadline:
        "Clear policies, fair disputes, and tools that help you keep good clients long term.",
      columns: [], // fill later
    },
    carousels: [
      { id: "topSellingServices", headline: "Top-Selling Services" },
      { id: "providerCourses", headline: "Courses to Boost Your Rates" },
      { id: "providerTools", headline: "Tools & Templates for Pros" },
    ],
    testimonials: {
      headline: "Built for Providers Who Take Their Craft Seriously.",
      subheadline:
        "Hear from professionals who use WorkinAnts to create stable, recurring income.",
    },
  },

  careerSeeker: {
    label: "Career Seeker",
    description: "Contract to full-time employment",
    accent: {
      accentBg: "bg-(--accent-seeker)",
      accentText: "text-(--accent-seeker)",
      accentBorder: "border-(--accent-seeker)",
    },
    heroSubtitle:
      "Discover contract and full-time roles matched to your skills, not just your résumé keywords.",
    scrollyHeadline: "Find Work That Fits You.",
    scrollySubheadline:
      "From profile to offer letter, keep your search organized and focused.",
    scrollyTidbits: [],
    cta: {
      headline: "Ready to Find Your Next Role?",
      subheadline:
        "Create a profile once, get discovered by employers and contract clients across the platform.",
      primaryLabel: "Create Free Profile",
    },
    trust: {
      headline: "Search With Confidence.",
      subheadline:
        "We surface real opportunities from verified employers and clients.",
      columns: [],
    },
    carousels: [
      { id: "featuredJobs", headline: "Featured Jobs" },
      { id: "careerCourses", headline: "Career & Skills Courses" },
      { id: "careerResources", headline: "Job Search Templates" },
    ],
    testimonials: {
      headline: "Helping People Land Roles They Actually Want.",
      subheadline:
        "Stories from career seekers who found better work through WorkinAnts.",
    },
  },

  employer: {
    label: "Career Employer",
    description: "Hire skilled talent & candidates",
    accent: {
      accentBg: "bg-(--accent-employer)",
      accentText: "text-(--accent-employer)",
      accentBorder: "border-(--accent-employer)",
    },
    heroSubtitle:
      "Post roles or projects and reach a verified pool of skilled talent ready to work.",
    scrollyHeadline: "Hire With More Signal and Less Noise.",
    scrollySubheadline:
      "From posting to shortlisting to hiring, keep everything in one place.",
    scrollyTidbits: [],
    cta: {
      headline: "Ready to Hire Talent You Can Trust?",
      subheadline:
        "Post your first role or project in minutes and start reviewing qualified candidates.",
      primaryLabel: "Post a Job",
      secondaryLabel: "Browse talent",
    },
    trust: {
      headline: "Every Hire Begins With Trust.",
      subheadline:
        "Identity checks, license verification, and transparent reviews mean fewer surprises.",
      columns: [],
    },
    carousels: [
      { id: "featuredTalent", headline: "Featured Talent" },
      { id: "employerResources", headline: "Hiring Playbooks & Templates" },
      { id: "trainingForTeams", headline: "Training for Your Team" },
    ],
    testimonials: {
      headline: "Hiring That Feels Easier and More Reliable.",
      subheadline:
        "Hear from teams who use WorkinAnts to fill roles faster with better-fit talent.",
    },
  },
};
