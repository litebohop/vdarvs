import type { PaginationParams } from "@/types/common.types";
import { documentRepository } from "@/lib/repositories/document.repository";
import { auditService, type AuditActor } from "@/lib/services/dashboard.service";

export const documentService = {
  getDocuments(params?: PaginationParams) {
    return documentRepository.findAll(params);
  },

  getDocument(id: string) {
    return documentRepository.findById(id);
  },

  async approveDocument(id: string, actor: AuditActor) {
    const document = await documentRepository.updateStatus(
      id,
      "approved",
      actor.userName,
    );
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "APPROVE",
      entity: "document",
      entityId: document.id,
      details: `Approved ${document.title} (${document.referenceNumber})`,
      village: document.village,
      district: document.district,
    });
    return document;
  },

  async rejectDocument(id: string, actor: AuditActor) {
    const document = await documentRepository.updateStatus(id, "rejected");
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "REJECT",
      entity: "document",
      entityId: document.id,
      details: `Rejected ${document.title} (${document.referenceNumber})`,
      village: document.village,
      district: document.district,
    });
    return document;
  },
};
