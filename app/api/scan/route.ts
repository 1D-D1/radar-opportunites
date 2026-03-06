import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server';
import { runOpportunityScan } from '@/lib/anthropic';
import type { ScanResult } from '@/types/opportunity';
import { normalizeSignalType } from '@/types/opportunity';

export const maxDuration = 120; // Allow up to 2 minutes for scan

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Get profile to check quota
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    // Check quota for free plan
    if (profile.plan === 'free') {
      const resetDate = new Date(profile.scans_reset_date);
      const now = new Date();

      if (now > resetDate) {
        // Reset monthly counter
        const serviceClient = createServiceRoleClient();
        await serviceClient
          .from('profiles')
          .update({
            scans_this_month: 0,
            scans_reset_date: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
          })
          .eq('id', user.id);
      } else if (profile.scans_this_month >= 3) {
        return NextResponse.json(
          { error: 'Quota atteint. Passez au plan Pro pour des scans illimités.' },
          { status: 429 }
        );
      }
    }

    // Create pending scan record
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        user_id: user.id,
        status: 'pending',
        market_pulse: '',
        opportunities: [],
      })
      .select()
      .single();

    if (scanError) {
      console.error('Scan insert error:', scanError);
      return NextResponse.json({ error: 'Erreur création scan' }, { status: 500 });
    }

    try {
      // Run the scan via Anthropic API
      const rawResult = await runOpportunityScan();

      // Parse JSON from response (handle potential wrapper text)
      let scanResult: ScanResult;
      try {
        // Try direct parse first
        scanResult = JSON.parse(rawResult);
      } catch {
        // Try to extract JSON from response
        const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          scanResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Impossible de parser le résultat du scan');
        }
      }

      // Normalize signal_type values from AI output
      if (scanResult.opportunities) {
        scanResult.opportunities = scanResult.opportunities.map(opp => ({
          ...opp,
          signal_type: normalizeSignalType(opp.signal_type),
        }));
      }

      // Update scan with results
      const { error: updateError } = await supabase
        .from('scans')
        .update({
          status: 'completed',
          market_pulse: scanResult.market_pulse,
          opportunities: scanResult.opportunities,
        })
        .eq('id', scan.id);

      if (updateError) {
        console.error('Scan update error:', updateError);
      }

      // Increment scan counter for free plan
      if (profile.plan === 'free') {
        const serviceClient = createServiceRoleClient();
        await serviceClient
          .from('profiles')
          .update({ scans_this_month: profile.scans_this_month + 1 })
          .eq('id', user.id);
      }

      return NextResponse.json({
        id: scan.id,
        market_pulse: scanResult.market_pulse,
        opportunities: scanResult.opportunities,
        scan_date: scanResult.scan_date,
        status: 'completed',
      });
    } catch (apiError: any) {
      // Mark scan as failed
      await supabase
        .from('scans')
        .update({ status: 'failed' })
        .eq('id', scan.id);

      console.error('Anthropic API error:', apiError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'analyse. Réessayez dans quelques instants.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Scan route error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur inattendue' },
      { status: 500 }
    );
  }
}
