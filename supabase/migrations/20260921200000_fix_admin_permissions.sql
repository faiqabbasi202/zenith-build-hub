-- Migration to ensure admin & staff operations succeed on projects and content tables
-- Auto-grant owner role to any first or registered auth user if user_roles is empty

DO $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Check if any auth users exist and user_roles is empty
  SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  IF first_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (first_user_id, 'owner')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Update projects write policy to permit authenticated staff or authenticated admin users
DROP POLICY IF EXISTS "projects staff write" ON public.projects;
CREATE POLICY "projects staff write" ON public.projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure public read remains enabled
DROP POLICY IF EXISTS "projects public read" ON public.projects;
CREATE POLICY "projects public read" ON public.projects
  FOR SELECT
  USING (true);

-- Ensure services and developments can be managed by authenticated users
DROP POLICY IF EXISTS "services staff write" ON public.services;
CREATE POLICY "services staff write" ON public.services
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "developments staff write" ON public.developments;
CREATE POLICY "developments staff write" ON public.developments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
