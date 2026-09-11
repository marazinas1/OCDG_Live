CREATE TABLE public.page_text (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  slot text NOT NULL,
  value text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT page_text_page_not_blank CHECK (btrim(page) <> ''),
  CONSTRAINT page_text_slot_not_blank CHECK (btrim(slot) <> ''),
  CONSTRAINT page_text_page_slot_unique UNIQUE (page, slot)
);

GRANT SELECT ON public.page_text TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_text TO authenticated;
GRANT ALL ON public.page_text TO service_role;

ALTER TABLE public.page_text ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read page text"
  ON public.page_text FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert page text"
  ON public.page_text FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update page text"
  ON public.page_text FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete page text"
  ON public.page_text FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_page_text_updated_at
  BEFORE UPDATE ON public.page_text
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.page_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  slot text NOT NULL,
  bucket text NOT NULL DEFAULT 'page-media',
  storage_path text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT page_media_page_not_blank CHECK (btrim(page) <> ''),
  CONSTRAINT page_media_slot_not_blank CHECK (btrim(slot) <> ''),
  CONSTRAINT page_media_bucket_not_blank CHECK (btrim(bucket) <> ''),
  CONSTRAINT page_media_storage_path_not_blank CHECK (btrim(storage_path) <> ''),
  CONSTRAINT page_media_page_slot_unique UNIQUE (page, slot)
);

GRANT SELECT ON public.page_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_media TO authenticated;
GRANT ALL ON public.page_media TO service_role;

ALTER TABLE public.page_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read page media"
  ON public.page_media FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert page media"
  ON public.page_media FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update page media"
  ON public.page_media FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete page media"
  ON public.page_media FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_page_media_updated_at
  BEFORE UPDATE ON public.page_media
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.page_media_defaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  slot text NOT NULL,
  bucket text NOT NULL DEFAULT 'page-media',
  storage_path text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT page_media_defaults_page_not_blank CHECK (btrim(page) <> ''),
  CONSTRAINT page_media_defaults_slot_not_blank CHECK (btrim(slot) <> ''),
  CONSTRAINT page_media_defaults_bucket_not_blank CHECK (btrim(bucket) <> ''),
  CONSTRAINT page_media_defaults_storage_path_not_blank CHECK (btrim(storage_path) <> ''),
  CONSTRAINT page_media_defaults_page_slot_unique UNIQUE (page, slot)
);

GRANT SELECT ON public.page_media_defaults TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_media_defaults TO authenticated;
GRANT ALL ON public.page_media_defaults TO service_role;

ALTER TABLE public.page_media_defaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read default page media"
  ON public.page_media_defaults FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Developers can insert default page media"
  ON public.page_media_defaults FOR INSERT
  TO authenticated
  WITH CHECK (public.is_developer(auth.uid()));

CREATE POLICY "Developers can update default page media"
  ON public.page_media_defaults FOR UPDATE
  TO authenticated
  USING (public.is_developer(auth.uid()))
  WITH CHECK (public.is_developer(auth.uid()));

CREATE POLICY "Developers can delete default page media"
  ON public.page_media_defaults FOR DELETE
  TO authenticated
  USING (public.is_developer(auth.uid()));

CREATE TRIGGER update_page_media_defaults_updated_at
  BEFORE UPDATE ON public.page_media_defaults
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Public can read page media objects"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'page-media');

CREATE POLICY "Admins can upload page media objects"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'page-media'
    AND public.is_admin(auth.uid())
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'avif', 'gif')
  );

CREATE POLICY "Admins can update page media objects"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'page-media' AND public.is_admin(auth.uid()))
  WITH CHECK (
    bucket_id = 'page-media'
    AND public.is_admin(auth.uid())
    AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'avif', 'gif')
  );

CREATE POLICY "Admins can delete page media objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'page-media' AND public.is_admin(auth.uid()));