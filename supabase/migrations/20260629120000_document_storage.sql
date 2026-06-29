-- Document attachments and Supabase Storage bucket

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS attachment_path TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES profiles(id);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'document-attachments',
  'document-attachments',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'prototype_doc_storage_select'
  ) THEN
    CREATE POLICY "prototype_doc_storage_select" ON storage.objects
      FOR SELECT TO anon, authenticated
      USING (bucket_id = 'document-attachments');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'prototype_doc_storage_insert'
  ) THEN
    CREATE POLICY "prototype_doc_storage_insert" ON storage.objects
      FOR INSERT TO anon, authenticated
      WITH CHECK (bucket_id = 'document-attachments');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'prototype_doc_storage_update'
  ) THEN
    CREATE POLICY "prototype_doc_storage_update" ON storage.objects
      FOR UPDATE TO anon, authenticated
      USING (bucket_id = 'document-attachments');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'prototype_doc_storage_delete'
  ) THEN
    CREATE POLICY "prototype_doc_storage_delete" ON storage.objects
      FOR DELETE TO anon, authenticated
      USING (bucket_id = 'document-attachments');
  END IF;
END $$;
