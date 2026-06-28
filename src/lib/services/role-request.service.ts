import type { UserRole } from "@/types/common.types";
import type { RoleRequest } from "@/types/entities.types";
import {
  insertRoleRequest,
  fetchRoleRequestByUserId,
} from "@/lib/supabase/queries/role-requests";
import { auditService, type AuditActor } from "@/lib/services/dashboard.service";

export const roleRequestService = {
  getLatestForUser(userId: string): Promise<RoleRequest | null> {
    return fetchRoleRequestByUserId(userId);
  },

  async submitRequest(
    input: {
      userId: string;
      requestedRole: UserRole;
      reason: string;
      village?: string;
      district?: string;
    },
    actor: AuditActor,
  ) {
    const request = await insertRoleRequest(input);
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "REQUEST",
      entity: "role",
      entityId: request.id,
      details: `Requested ${input.requestedRole} access`,
      village: input.village,
      district: input.district,
    });
    return request;
  },
};
