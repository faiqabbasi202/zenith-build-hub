-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'editor');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('owner','admin'));
$$;

CREATE POLICY "profiles readable by staff" ON public.profiles FOR SELECT TO authenticated USING (public.is_staff() OR id = auth.uid());
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "roles readable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff());
CREATE POLICY "roles managed by admins" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  -- first ever user becomes owner
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER t_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ CONTENT TABLES ============
CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1,
  company_name text NOT NULL DEFAULT 'AMARC',
  company_full_name text NOT NULL DEFAULT 'AMARC Engineering & Construction Company',
  tagline text,
  logo_url text,
  phone text, phone_alt text, whatsapp text, email text, email_alt text,
  address text, city text, country text DEFAULT 'Pakistan',
  map_lat numeric, map_lng numeric, map_embed_url text,
  facebook_url text, instagram_url text, linkedin_url text, youtube_url text, google_maps_url text,
  pec_number text, ntn_number text, founded_year int,
  footer_note text,
  offices jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "settings staff write" ON public.site_settings FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.home_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  eyebrow text, heading text, subheading text, body text,
  cta_label text, cta_href text,
  media_url text, poster_url text,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.home_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_sections TO authenticated;
GRANT ALL ON public.home_sections TO service_role;
ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "home public read" ON public.home_sections FOR SELECT USING (true);
CREATE POLICY "home staff write" ON public.home_sections FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_home_updated BEFORE UPDATE ON public.home_sections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  short_title text,
  icon text,
  summary text,
  description text,
  hero_image_url text,
  bullets jsonb NOT NULL DEFAULT '[]'::jsonb,
  process_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_title text, seo_description text, og_image_url text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services public read" ON public.services FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "services staff write" ON public.services FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  icon text,
  summary text,
  description text,
  hero_image_url text,
  seo_title text, seo_description text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sectors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sectors TO authenticated;
GRANT ALL ON public.sectors TO service_role;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sectors public read" ON public.sectors FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "sectors staff write" ON public.sectors FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_sectors_updated BEFORE UPDATE ON public.sectors FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TYPE public.project_status AS ENUM ('newly_launched','ongoing','completed','handed_over');

CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  client text,
  city text,
  location text,
  sector_slug text,
  status public.project_status NOT NULL DEFAULT 'completed',
  value_pkr_millions numeric,
  covered_area text,
  plot_area text,
  storeys text,
  start_date date,
  completion_date date,
  architect text,
  partners text,
  summary text,
  description text,
  scope jsonb NOT NULL DEFAULT '[]'::jsonb,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  cover_image_url text,
  video_url text,
  progress_percent int,
  certifications text,
  seo_title text, seo_description text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects public read" ON public.projects FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "projects staff write" ON public.projects FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.developments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  city text,
  location text,
  status public.project_status NOT NULL DEFAULT 'newly_launched',
  summary text,
  description text,
  storeys text,
  handover text,
  starting_price text,
  cover_image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  unit_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  payment_plan jsonb NOT NULL DEFAULT '[]'::jsonb,
  brochure_url text,
  seo_title text, seo_description text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.developments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.developments TO authenticated;
GRANT ALL ON public.developments TO service_role;
ALTER TABLE public.developments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dev public read" ON public.developments FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "dev staff write" ON public.developments FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_dev_updated BEFORE UPDATE ON public.developments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, role text, credentials text, bio text, photo_url text,
  linkedin_url text, email text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team public read" ON public.team_members FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "team staff write" ON public.team_members FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_team_updated BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL, author_role text, company text, quote text NOT NULL,
  avatar_url text, rating int,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testi public read" ON public.testimonials FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "testi staff write" ON public.testimonials FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_testi_updated BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, logo_url text, website_url text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.clients TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients public read" ON public.clients FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "clients staff write" ON public.clients FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, issuer text, reference_no text, description text,
  image_url text, document_url text, issued_year int,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cert public read" ON public.certifications FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "cert staff write" ON public.certifications FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_cert_updated BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, issuer text, year int, description text, image_url text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.awards TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.awards TO authenticated;
GRANT ALL ON public.awards TO service_role;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "awards public read" ON public.awards FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "awards staff write" ON public.awards FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_awards_updated BEFORE UPDATE ON public.awards FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL, title text NOT NULL, description text, image_url text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.milestones TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestones TO authenticated;
GRANT ALL ON public.milestones TO service_role;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "miles public read" ON public.milestones FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "miles staff write" ON public.milestones FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_miles_updated BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL, excerpt text, body text,
  cover_image_url text, author text, category text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  read_minutes int,
  published_at timestamptz DEFAULT now(),
  seo_title text, seo_description text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts public read" ON public.posts FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "posts staff write" ON public.posts FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_posts_updated BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL, department text, location text, employment_type text,
  experience text, summary text, description text,
  responsibilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  closes_at date,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs public read" ON public.jobs FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "jobs staff write" ON public.jobs FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_jobs_updated BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_title text, name text NOT NULL, email text NOT NULL, phone text,
  cv_url text, cover_letter text, status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apps public insert" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "apps staff read" ON public.applications FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "apps staff update" ON public.applications FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "apps staff delete" ON public.applications FOR DELETE TO authenticated USING (public.is_staff());

CREATE TABLE public.tenders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, reference_no text, category text, description text,
  document_url text, published_on date, closes_at date,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tenders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenders TO authenticated;
GRANT ALL ON public.tenders TO service_role;
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenders public read" ON public.tenders FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "tenders staff write" ON public.tenders FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_tenders_updated BEFORE UPDATE ON public.tenders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL, contact_person text, email text NOT NULL, phone text,
  category text, ntn text, city text, website text, message text,
  document_url text, status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.vendors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors public insert" ON public.vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "vendors staff read" ON public.vendors FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "vendors staff update" ON public.vendors FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "vendors staff delete" ON public.vendors FOR DELETE TO authenticated USING (public.is_staff());

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, email text, phone text, company text,
  subject text, message text,
  service_interest text, project_type text, budget text, city text,
  source text NOT NULL DEFAULT 'contact',
  status text NOT NULL DEFAULT 'new',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads public insert" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "leads staff read" ON public.leads FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "leads staff update" ON public.leads FOR UPDATE TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE POLICY "leads staff delete" ON public.leads FOR DELETE TO authenticated USING (public.is_staff());
CREATE TRIGGER t_leads_updated BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, url text NOT NULL, path text, mime_type text, size_bytes bigint,
  alt_text text, folder text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT ALL ON public.media TO service_role;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media public read" ON public.media FOR SELECT USING (true);
CREATE POLICY "media staff write" ON public.media FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE TABLE public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, description text, file_url text, thumbnail_url text,
  category text, file_size text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.downloads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.downloads TO authenticated;
GRANT ALL ON public.downloads TO service_role;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dl public read" ON public.downloads FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "dl staff write" ON public.downloads FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_dl_updated BEFORE UPDATE ON public.downloads FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL, answer text NOT NULL, category text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faq public read" ON public.faqs FOR SELECT USING (is_published OR public.is_staff());
CREATE POLICY "faq staff write" ON public.faqs FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_faq_updated BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  title text, description text, og_image_url text, noindex boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.page_seo TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_seo TO authenticated;
GRANT ALL ON public.page_seo TO service_role;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seo public read" ON public.page_seo FOR SELECT USING (true);
CREATE POLICY "seo staff write" ON public.page_seo FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_seo_updated BEFORE UPDATE ON public.page_seo FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_sector ON public.projects(sector_slug);
CREATE INDEX idx_projects_city ON public.projects(city);
CREATE INDEX idx_leads_status ON public.leads(status);