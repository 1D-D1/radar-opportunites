import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

// Backward compat export
export const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get webhooks() { return getStripe().webhooks; },
} as unknown as Stripe;

export const PLANS = {
  free: {
    name: 'Gratuit',
    price: 0,
    scansPerMonth: 3,
    briefsPerScan: 1,
    history: false,
    favorites: false,
    filters: false,
  },
  pro: {
    name: 'Pro',
    price: 29,
    scansPerMonth: Infinity,
    briefsPerScan: Infinity,
    history: true,
    favorites: true,
    filters: true,
  },
} as const;
