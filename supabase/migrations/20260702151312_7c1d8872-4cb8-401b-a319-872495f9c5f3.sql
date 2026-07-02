
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name_en TEXT NOT NULL,
  name_bn TEXT NOT NULL DEFAULT '',
  father_en TEXT NOT NULL DEFAULT '',
  father_bn TEXT NOT NULL DEFAULT '',
  mother_en TEXT NOT NULL DEFAULT '',
  mother_bn TEXT NOT NULL DEFAULT '',
  dob DATE,
  birth_cert TEXT NOT NULL DEFAULT '',
  class_id TEXT NOT NULL,
  monthly_fee INTEGER NOT NULL DEFAULT 0,
  gender TEXT NOT NULL DEFAULT '',
  religion TEXT NOT NULL DEFAULT '',
  blood_group TEXT NOT NULL DEFAULT '',
  nationality TEXT NOT NULL DEFAULT '',
  father_mobile TEXT NOT NULL DEFAULT '',
  mother_mobile TEXT NOT NULL DEFAULT '',
  guardian_mobile TEXT NOT NULL DEFAULT '',
  present_address TEXT NOT NULL DEFAULT '',
  permanent_address TEXT NOT NULL DEFAULT '',
  paid_months INTEGER[] NOT NULL DEFAULT '{}'
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO anon, authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public can insert students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update students" ON public.students FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete students" ON public.students FOR DELETE USING (true);

CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  mobile TEXT NOT NULL DEFAULT '',
  salary INTEGER NOT NULL DEFAULT 0,
  joined DATE,
  paid_months INTEGER[] NOT NULL DEFAULT '{}'
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO anon, authenticated;
GRANT ALL ON public.teachers TO service_role;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Public can insert teachers" ON public.teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update teachers" ON public.teachers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete teachers" ON public.teachers FOR DELETE USING (true);
