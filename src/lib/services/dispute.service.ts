import type { PaginationParams } from "@/types/common.types";
import type { Dispute } from "@/types/entities.types";
import { disputeRepository } from "@/lib/repositories/dispute.repository";
import { auditService, type AuditActor } from "@/lib/services/dashboard.service";
import { insertNotification } from "@/lib/supabase/queries/notifications";
import { fetchChiefProfileByChiefId } from "@/lib/supabase/queries/profiles";

export const disputeService = {
  getDisputes(params?: PaginationParams) {
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
};
