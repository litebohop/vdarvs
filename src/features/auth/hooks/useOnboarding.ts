"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Citizen } from "@/types/entities.types";
import type { UserRole } from "@/types/common.types";
import { citizenService } from "@/lib/services/citizen.service";
import { roleRequestService } from "@/lib/services/role-request.service";
import type { AuditActor } from "@/lib/services/dashboard.service";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export function useLatestRoleRequest(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.roleRequests.latest(userId ?? ""),
    queryFn: () => roleRequestService.getLatestForUser(userId!),
    enabled: !!userId,
  });
}

export function useApplyAsCitizen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      actor,
    }: {
      data: Omit<Citizen, "id" | "registeredAt" | "updatedAt">;
      actor: AuditActor;
    }) => citizenService.applyAsCitizen(data, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.citizens.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.residency.list() });
      toast.success("Citizen application submitted for verification");
    },
    onError: () => toast.error("Failed to submit citizen application"),
  });
}

export function useSubmitRoleRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestedRole,
      reason,
      village,
      district,
      actor,
    }: {
      requestedRole: UserRole;
      reason: string;
      village?: string;
      district?: string;
      actor: AuditActor;
    }) =>
      roleRequestService.submitRequest(
        {
          userId: actor.userId,
          requestedRole,
          reason,
          village,
          district,
        },
        actor,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.roleRequests.latest(variables.actor.userId),
      });
      toast.success("Access request submitted for review");
    },
    onError: () => toast.error("Failed to submit access request"),
  });
}
