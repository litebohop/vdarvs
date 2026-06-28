import type { PaginationParams } from "@/types/common.types";
import type { Citizen } from "@/types/entities.types";
import { citizenRepository } from "@/lib/repositories/citizen.repository";
import { auditService, type AuditActor } from "@/lib/services/dashboard.service";
import { updateProfile } from "@/lib/supabase/queries/profiles";

export const citizenService = {
  getCitizens(params?: PaginationParams) {
    return citizenRepository.findAll(params);
  },

  getCitizen(id: string) {
    return citizenRepository.findById(id);
  },

  async registerCitizen(
    data: Omit<Citizen, "id" | "registeredAt" | "updatedAt">,
    actor: AuditActor,
  ) {
    const citizen = await citizenRepository.create(data);
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "CREATE",
      entity: "citizen",
      entityId: citizen.id,
      details: `Registered new citizen ${citizen.firstName} ${citizen.lastName}`,
      village: citizen.address.village,
      district: citizen.address.district,
    });
    return citizen;
  },

  async applyAsCitizen(
    data: Omit<Citizen, "id" | "registeredAt" | "updatedAt">,
    actor: AuditActor,
  ) {
    const citizen = await this.registerCitizen(data, actor);
    await citizenRepository.createResidencyRequest(citizen.id, citizen.chiefId);
    await updateProfile(actor.userId, {
      village: citizen.address.village,
      district: citizen.address.district,
      phone: citizen.phone,
    });
    return citizen;
  },

  updateCitizen(id: string, data: Partial<Citizen>) {
    return citizenRepository.update(id, data);
  },

  getResidencyRequests(params?: PaginationParams) {
    return citizenRepository.getResidencyRequests(params);
  },

  async verifyResidency(id: string, actor: AuditActor) {
    const request = await citizenRepository.updateResidencyStatus(
      id,
      "verified",
      actor.userName,
    );
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "VERIFY",
      entity: "residency",
      entityId: id,
      details: `Verified residency for ${request.citizenName}`,
      village: request.village,
      district: request.district,
    });
    return request;
  },

  async rejectResidency(id: string, actor: AuditActor) {
    const request = await citizenRepository.updateResidencyStatus(
      id,
      "rejected",
      actor.userName,
    );
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "REJECT",
      entity: "residency",
      entityId: id,
      details: `Rejected residency request for ${request.citizenName}`,
      village: request.village,
      district: request.district,
    });
    return request;
  },
};
