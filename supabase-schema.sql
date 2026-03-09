-- ============================================================
-- PHAROS — Schéma Supabase
-- ============================================================
-- Exécuter ce script dans l'éditeur SQL de Supabase (Dashboard → SQL Editor)
-- ============================================================

-- 1. TABLE PROFILES (extension de auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  scans_this_month INTEGER DEFAULT 0,
  scans_reset_date TIMESTAMP WITH TIME ZONE DEFAULT (date_trunc('month', now()) + interval '1 month'),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- PHAROS onboarding fields
  display_name TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  project_goals TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE
);

-- 2. TABLE SCANS
-- ============================================================
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  market_pulse TEXT DEFAULT '',
  scan_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opportunities JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- 3. TABLE SAVED_OPPORTUNITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  opportunity JSONB NOT NULL,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'launched', 'archived')),
  notes TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================
-- INDEX pour les performances
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_scan_date ON scans(scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_scans_user_date ON scans(user_id, scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_saved_user_id ON saved_opportunities(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- PROFILES — Chaque user ne voit/modifie que son profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- L'INSERT est géré par le trigger (service role), mais on ajoute aussi pour sécurité
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- SCANS — Chaque user ne voit/modifie que ses scans
CREATE POLICY "Users can view own scans"
  ON scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON scans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON scans FOR DELETE
  USING (auth.uid() = user_id);

-- SAVED_OPPORTUNITIES — Chaque user ne voit/modifie que ses favoris
CREATE POLICY "Users can view own saved opportunities"
  ON saved_opportunities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved opportunities"
  ON saved_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved opportunities"
  ON saved_opportunities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved opportunities"
  ON saved_opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER — Auto-créer le profil quand un user s'inscrit
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà (pour réexécution safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- Après exécution, vérifiez dans Supabase :
-- 1. Tables: profiles, scans, saved_opportunities (Table Editor)
-- 2. RLS activé sur les 3 tables (Authentication → Policies)
-- 3. Trigger visible dans Database → Functions
-- ============================================================
