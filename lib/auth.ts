import { createServerSupabaseClient } from './supabase-server';
import { redirect } from 'next/navigation';
import type { Profile } from '@/types/opportunity';

export async function getUser() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(): Promise<Profile | null> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
}

export async function canScan(profile: Profile): Promise<boolean> {
  if (profile.plan === 'pro') return true;

  // Check if reset date has passed
  const resetDate = new Date(profile.scans_reset_date);
  if (new Date() > resetDate) {
    // Reset the counter — will be done server-side
    return true;
  }

  return profile.scans_this_month < 3;
}
