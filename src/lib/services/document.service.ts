import type { PaginationParams } from "@/types/common.types";
import { documentRepository } from "@/lib/repositories/document.repository";

export const documentService = {
  getDocuments(params?: PaginationParams) {
    return documentRepository.findAll(params);
  },

  getDocument(id: string) {
    return documentRepository.findById(id);
  },

  approveDocument(id: string, approvedBy: string) {
    return documentRepository.updateStatus(id, "approved", approvedBy);
  },

  rejectDocument(id: string) {
    return documentRepository.updateStatus(id, "rejected");
  },
};
