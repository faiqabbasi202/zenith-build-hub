REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;

-- Rewrite public-read policies so anonymous visitors never invoke is_staff()
DO $$
DECLARE t text; pol text;
BEGIN
  FOREACH t IN ARRAY ARRAY['services','sectors','projects','developments','team_members','testimonials','clients','certifications','awards','milestones','posts','jobs','tenders','downloads','faqs']
  LOOP
    pol := format('%s public read', CASE t
      WHEN 'services' THEN 'services' WHEN 'sectors' THEN 'sectors' WHEN 'projects' THEN 'projects'
      WHEN 'developments' THEN 'dev' WHEN 'team_members' THEN 'team' WHEN 'testimonials' THEN 'testi'
      WHEN 'clients' THEN 'clients' WHEN 'certifications' THEN 'cert' WHEN 'awards' THEN 'awards'
      WHEN 'milestones' THEN 'miles' WHEN 'posts' THEN 'posts' WHEN 'jobs' THEN 'jobs'
      WHEN 'tenders' THEN 'tenders' WHEN 'downloads' THEN 'dl' WHEN 'faqs' THEN 'faq' END);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (is_published)', 'published read ' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_staff())', 'staff read ' || t, t);
  END LOOP;
END $$;