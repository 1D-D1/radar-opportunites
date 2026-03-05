import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateBrief } from '@/lib/anthropic';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { opportunity } = body;

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunité manquante' }, { status: 400 });
    }

    const brief = await generateBrief(opportunity);

    return NextResponse.json({ brief });
  } catch (error: any) {
    console.error('Generate brief error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du brief' },
      { status: 500 }
    );
  }
}
