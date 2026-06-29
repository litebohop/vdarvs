import type { PaginationParams } from "@/types/common.types";
import type { LandRecord } from "@/types/entities.types";
import { landRepository } from "@/lib/repositories/land.repository";
import { auditService, type AuditActor } from "@/lib/services/dashboard.service";

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
    return record;
  },
};
