import type { PaginationParams } from "@/types/common.types";
import type { UserRole } from "@/types/common.types";
import type { RoleRequest } from "@/types/entities.types";
import {
  insertRoleRequest,
  fetchRoleRequestByUserId,
  fetchRoleRequests,
  updateRoleRequestStatus,
} from "@/lib/supabase/queries/role-requests";
import {
  updateProfileRole,
  fetchAdministratorProfiles,
} from "@/lib/supabase/queries/profiles";
import { insertNotification } from "@/lib/supabase/queries/notifications";
import { auditService, type AuditActor } from "@/lib/services/dashboard.service";

export const roleRequestService = {
  getLatestForUser(userId: string): Promise<RoleRequest | null> {
    return fetchRoleRequestByUserId(userId);
  },

  getRequests(params?: PaginationParams) {
    return fetchRoleRequests(params);
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

    const admins = await fetchAdministratorProfiles();
    await Promise.all(
      admins.map((admin) =>
        insertNotification({
          userId: admin.id,
          title: "New role access request",
          message: `${actor.userName} requested ${input.requestedRole.replace(/_/g, " ")} access`,
          type: "action",
          href: "/role-requests",
        }),
      ),
    );

    return request;
  },

  async approveRequest(id: string, userId: string, actor: AuditActor) {
    const request = await updateRoleRequestStatus({
      id,
      status: "approved",
      reviewedBy: actor.userName,
    });
    await updateProfileRole(userId, request.requestedRole);
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "APPROVE",
      entity: "role",
      entityId: request.id,
      details: `Approved ${request.requestedRole} access for ${request.userName ?? userId}`,
      village: request.village,
      district: request.district,
    });
    await insertNotification({
      userId,
      title: "Access request approved",
      message: `Your request for ${request.requestedRole.replace(/_/g, " ")} access was approved.`,
      type: "success",
      href: "/dashboard",
    });
    return request;
  },

  async rejectRequest(id: string, userId: string, actor: AuditActor) {
    const request = await updateRoleRequestStatus({
      id,
      status: "rejected",
      reviewedBy: actor.userName,
    });
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "REJECT",
      entity: "role",
      entityId: request.id,
      details: `Rejected ${request.requestedRole} access for ${request.userName ?? userId}`,
      village: request.village,
      district: request.district,
    });
    await insertNotification({
      userId,
      title: "Access request rejected",
      message: `Your request for ${request.requestedRole.replace(/_/g, " ")} access was rejected.`,
      type: "warning",
      href: "/onboarding",
    });
    return request;
  },
};
