import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Check Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID_PRO) {
      console.error('Stripe not configured: missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID_PRO');
      return NextResponse.json(
        { error: 'Le paiement n\'est pas encore configuré. Contactez l\'administrateur.' },
        { status: 503 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Create Stripe customer if needed
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: profile?.email || user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_PRO,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/settings?cancelled=true`,
      metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Erreur création session paiement. Réessayez plus tard.' },
      { status: 500 }
    );
  }
}
