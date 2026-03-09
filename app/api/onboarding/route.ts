import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
    }

    const body = await request.json();
    const { display_name, bio, interests, skills, project_goals } = body;

    // Validate required fields
    if (!display_name || !display_name.trim()) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    // Update profile with onboarding data
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: display_name.trim(),
        bio: bio?.trim() || null,
        interests: interests || [],
        skills: skills || [],
        project_goals: project_goals?.trim() || null,
        onboarding_completed: true,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Onboarding update error:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Onboarding route error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
