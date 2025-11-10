// lib/stripe.js
import { loadStripe } from "@stripe/stripe-js";

export const getStripe = async () => {
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!pk) {
    console.warn("[WorkingAnts] Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
    return null;
  }
  return await loadStripe(pk);
};
