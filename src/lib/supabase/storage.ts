import { createClient } from "@/lib/supabase/client";

export const DOCUMENT_ATTACHMENTS_BUCKET = "document-attachments";

export async function uploadDocumentAttachment(
  file: File,
  pathPrefix: string,
): Promise<{ path: string; name: string }> {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${pathPrefix}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(DOCUMENT_ATTACHMENTS_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) throw new Error(error.message);
  return { path, name: file.name };
}

export async function getDocumentAttachmentUrl(path: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENT_ATTACHMENTS_BUCKET)
    .createSignedUrl(path, 3600);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}
