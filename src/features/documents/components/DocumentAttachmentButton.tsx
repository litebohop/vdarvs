"use client";

import { useState } from "react";
import type { Document } from "@/types/entities.types";
import { Button } from "@/components/ui/button";
import { getDocumentAttachmentUrl } from "@/lib/supabase/storage";
import { toast } from "sonner";
import { Download } from "lucide-react";

export function DocumentAttachmentButton({ document }: { document: Document }) {
  const [loading, setLoading] = useState(false);

  if (!document.attachmentPath) return null;

  async function handleDownload() {
    if (!document.attachmentPath) return;
    setLoading(true);
    try {
      const url = await getDocumentAttachmentUrl(document.attachmentPath);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Failed to open attachment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={loading}
      onClick={() => void handleDownload()}
    >
      <Download className="mr-1 size-3" />
      {document.attachmentName ?? "Attachment"}
    </Button>
  );
}
