import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe non configuré.' },
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
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Aucun abonnement trouvé.' },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Erreur accès portail de gestion.' },
      { status: 500 }
    );
  }
}
