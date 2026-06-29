import type { PaginationParams } from "@/types/common.types";
import type { LandRecord } from "@/types/entities.types";
import { landRepository } from "@/lib/repositories/land.repository";
import { auditService, type AuditActor } from "@/lib/services/dashboard.service";
import { insertNotification } from "@/lib/supabase/queries/notifications";
import { fetchChiefProfileByChiefId } from "@/lib/supabase/queries/profiles";

export const landService = {
  getLandRecords(params?: PaginationParams) {
    return landRepository.findAll(params);
  },

  getLandRecord(id: string) {
    return landRepository.findById(id);
  },

  async registerLand(
    data: Omit<LandRecord, "id" | "registeredAt">,
    actor: AuditActor,
  ) {
    const record = await landRepository.create(data);
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "CREATE",
      entity: "land",
      entityId: record.id,
      details: `Registered land parcel ${record.parcelNumber} for ${record.ownerName}`,
      village: record.village,
      district: record.district,
    });

    const chiefProfile = await fetchChiefProfileByChiefId(record.chiefId);
    if (chiefProfile) {
      await insertNotification({
        userId: chiefProfile.id,
        title: "Land registration pending approval",
        message: `${record.parcelNumber} for ${record.ownerName}`,
        type: "action",
        href: "/land",
      });
    }

    return record;
  },

  async approveLand(id: string, actor: AuditActor) {
    const record = await landRepository.updateStatus(id, "approved");
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "APPROVE",
      entity: "land",
      entityId: record.id,
      details: `Approved land parcel ${record.parcelNumber}`,
      village: record.village,
      district: record.district,
    });
    return record;
  },

  async rejectLand(id: string, actor: AuditActor) {
    const record = await landRepository.updateStatus(id, "rejected");
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "REJECT",
      entity: "land",
      entityId: record.id,
      details: `Rejected land parcel ${record.parcelNumber}`,
      village: record.village,
      district: record.district,
    });
    return record;
  },
};
