DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update properties" ON public.properties;
CREATE POLICY "Staff can view all properties" ON public.properties FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert properties" ON public.properties FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update properties" ON public.properties FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all property images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can insert property images" ON public.property_images;
DROP POLICY IF EXISTS "Admins can update property images" ON public.property_images;
CREATE POLICY "Staff can view all property images" ON public.property_images FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert property images" ON public.property_images FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id));
CREATE POLICY "Staff can update property images" ON public.property_images FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()) AND EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id));

DROP POLICY IF EXISTS "Admins can view all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
CREATE POLICY "Staff can view all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert testimonials" ON public.testimonials FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert page text" ON public.page_text;
DROP POLICY IF EXISTS "Admins can update page text" ON public.page_text;
CREATE POLICY "Staff can insert page text" ON public.page_text FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update page text" ON public.page_text FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert page media" ON public.page_media;
DROP POLICY IF EXISTS "Admins can update page media" ON public.page_media;
CREATE POLICY "Staff can insert page media" ON public.page_media FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update page media" ON public.page_media FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update property images objects" ON storage.objects;
CREATE POLICY "Staff can upload property images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff can update property images objects" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'property-images' AND public.is_staff(auth.uid())) WITH CHECK (bucket_id = 'property-images' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can upload page media objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update page media objects" ON storage.objects;
CREATE POLICY "Staff can upload page media objects" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'page-media' AND public.is_staff(auth.uid()) AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'));
CREATE POLICY "Staff can update page media objects" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'page-media' AND public.is_staff(auth.uid())) WITH CHECK (bucket_id = 'page-media' AND public.is_staff(auth.uid()) AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'));

CREATE OR REPLACE FUNCTION public.list_property_bucket_paths(_slug text)
RETURNS TABLE(name text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RETURN; END IF;
  IF _slug IS NULL OR _slug !~ '^[a-z0-9][a-z0-9-]*$' THEN RAISE EXCEPTION 'invalid slug: %', _slug; END IF;
  RETURN QUERY SELECT o.name FROM storage.objects o WHERE o.bucket_id = 'property-images' AND o.name LIKE _slug || '/%';
END;
$$;
REVOKE ALL ON FUNCTION public.list_property_bucket_paths(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_property_bucket_paths(text) TO authenticated, service_role;