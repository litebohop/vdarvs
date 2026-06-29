import type { Dispute } from "@/types/entities.types";
import { disputeRepository } from "@/lib/repositories/dispute.repository";
import { auditService, type AuditActor } from "@/lib/services/dashboard.service";
import { insertNotification } from "@/lib/supabase/queries/notifications";
import {
  fetchChiefProfileByChiefId,
  fetchProfileByEmail,
} from "@/lib/supabase/queries/profiles";
import { fetchCitizenById } from "@/lib/supabase/queries/citizens";

export const disputeService = {
  getDisputes(params?: import("@/types/common.types").PaginationParams) {
    return disputeRepository.findAll(params);
  },

  getDispute(id: string) {
    return disputeRepository.findById(id);
  },

  async fileDispute(
    data: Omit<Dispute, "id" | "filedAt" | "caseNumber">,
    actor: AuditActor,
  ) {
    const dispute = await disputeRepository.create(data);
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "CREATE",
      entity: "dispute",
      entityId: dispute.id,
      details: `Filed dispute ${dispute.caseNumber}: ${dispute.title}`,
      village: dispute.village,
      district: dispute.district,
    });

    const chiefProfile = await fetchChiefProfileByChiefId(dispute.chiefId);
    if (chiefProfile) {
      await insertNotification({
        userId: chiefProfile.id,
        title: "New dispute filed",
        message: `${dispute.caseNumber}: ${dispute.title}`,
        type: "action",
        href: "/disputes",
      });
    }

    return dispute;
  },

  async resolveDispute(
    id: string,
    status: "approved" | "rejected",
    actor: AuditActor,
  ) {
    const dispute = await disputeRepository.updateStatus(id, status);
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: status === "approved" ? "APPROVE" : "REJECT",
      entity: "dispute",
      entityId: dispute.id,
      details: `${status === "approved" ? "Resolved" : "Dismissed"} dispute ${dispute.caseNumber}`,
      village: dispute.village,
      district: dispute.district,
    });

    const complainant = await fetchCitizenById(dispute.complainantId);
    if (complainant?.email) {
      const profile = await fetchProfileByEmail(complainant.email);
      if (profile) {
        await insertNotification({
          userId: profile.id,
          title:
            status === "approved" ? "Dispute resolved" : "Dispute dismissed",
          message: `${dispute.caseNumber}: ${dispute.title}`,
          type: status === "approved" ? "success" : "warning",
          href: "/disputes",
        });
      }
    }

    return dispute;
  },
};
