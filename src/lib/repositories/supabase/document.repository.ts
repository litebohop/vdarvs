import type { Document } from "@/types/entities.types";
import * as documentQueries from "@/lib/supabase/queries/documents";

export const supabaseDocumentRepository = {
  findAll: documentQueries.fetchDocuments,
  findById: documentQueries.fetchDocumentById,
  updateStatus: (
    id: string,
    status: Document["status"],
    approvedBy?: string,
  ) => documentQueries.updateDocumentStatus(id, status, approvedBy),
};
