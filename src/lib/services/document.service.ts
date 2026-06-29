import type { PaginationParams } from "@/types/common.types";
import type { Document } from "@/types/entities.types";
import { documentRepository } from "@/lib/repositories/document.repository";
import { auditService, type AuditActor } from "@/lib/services/dashboard.service";
import { uploadDocumentAttachment } from "@/lib/supabase/storage";
import { insertNotification } from "@/lib/supabase/queries/notifications";
import { fetchChiefProfileByChiefId } from "@/lib/supabase/queries/profiles";

export const documentService = {
  getDocuments(params?: PaginationParams) {
    return documentRepository.findAll(params);
  },

  getDocument(id: string) {
    return documentRepository.findById(id);
  },

  async requestDocument(
    input: {
      type: Document["type"];
      title: string;
      citizenId: string;
      village: string;
      district: string;
      chiefId: string;
      file?: File;
    },
    actor: AuditActor,
  ) {
    let attachmentPath: string | undefined;
    let attachmentName: string | undefined;

    if (input.file) {
      const uploaded = await uploadDocumentAttachment(
        input.file,
        `requests/${input.citizenId}`,
      );
      attachmentPath = uploaded.path;
      attachmentName = uploaded.name;
    }

    const document = await documentRepository.create({
      type: input.type,
      title: input.title,
      citizenId: input.citizenId,
      village: input.village,
      district: input.district,
      requestedBy: actor.userId,
      attachmentPath,
      attachmentName,
    });

    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "REQUEST",
      entity: "document",
      entityId: document.id,
      details: `Requested ${document.title} (${document.referenceNumber})`,
      village: document.village,
      district: document.district,
    });

    const chiefProfile = await fetchChiefProfileByChiefId(input.chiefId);
    if (chiefProfile) {
      await insertNotification({
        userId: chiefProfile.id,
        title: "New document request",
        message: `${actor.userName} requested ${document.title} (${document.referenceNumber}).`,
        type: "action",
        href: "/documents",
      });
    }

    return document;
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

    if (document.requestedBy) {
      await insertNotification({
        userId: document.requestedBy,
        title: "Document approved",
        message: `Your ${document.title} (${document.referenceNumber}) has been approved.`,
        type: "success",
        href: "/documents",
      });
    }

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

    if (document.requestedBy) {
      await insertNotification({
        userId: document.requestedBy,
        title: "Document rejected",
        message: `Your ${document.title} (${document.referenceNumber}) was rejected.`,
        type: "warning",
        href: "/documents",
      });
    }

    return document;
  },
};
