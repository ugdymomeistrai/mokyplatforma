-- =============================================
-- Mokyplatforma — Supabase schema
-- Paleisti: Supabase Dashboard -> SQL Editor
-- =============================================

-- Mokytojų profiliai (papildo Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  subject TEXT,
  class_level TEXT,
  onboarding_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatiškai sukurti profilį kai registruojasi vartotojas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Turinio vienetai
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('slides', 'questions', 'activity')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  subject TEXT,
  class_level TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pamokos
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  class_level TEXT,
  content_sequence JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live sesijos
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  current_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Mokinių atsakymai
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  content_item_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
  question_index INTEGER,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Profiliai
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Turinys: matyti savo arba viešą
CREATE POLICY "content_select" ON content_items
  FOR SELECT USING (teacher_id = auth.uid() OR is_public = TRUE);
CREATE POLICY "content_insert" ON content_items
  FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "content_update" ON content_items
  FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "content_delete" ON content_items
  FOR DELETE USING (teacher_id = auth.uid());

-- Pamokos
CREATE POLICY "lessons_select_own" ON lessons
  FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "lessons_insert" ON lessons
  FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "lessons_update" ON lessons
  FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "lessons_delete" ON lessons
  FOR DELETE USING (teacher_id = auth.uid());

-- Sesijos: skaityti gali visi (mokiniams reikia patikrinti kodą)
CREATE POLICY "sessions_select_all" ON sessions
  FOR SELECT USING (TRUE);
CREATE POLICY "sessions_insert" ON sessions
  FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "sessions_update" ON sessions
  FOR UPDATE USING (teacher_id = auth.uid());

-- Atsakymai: rašyti gali visi (mokiniai be auth), skaityti tik mokytojas
CREATE POLICY "responses_insert_all" ON responses
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "responses_select_teacher" ON responses
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions WHERE teacher_id = auth.uid()
    )
  );

-- =============================================
-- Realtime įjungimas
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE responses;
