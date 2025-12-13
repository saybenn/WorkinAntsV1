// lib/types/testimonial.ts
export type TestimonialKind = "service" | "product" | "course";

export type Testimonial = {
  id: string;
  name: string;
  roleLabel: string;
  rating: number;      // 0-5
  headline: string;
  body: string;
  avatarUrl?: string | null;
  kind?: TestimonialKind;
};
