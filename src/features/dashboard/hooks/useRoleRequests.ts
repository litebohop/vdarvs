"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/common.types";
import { roleRequestService } from "@/lib/services/role-request.service";
import type { AuditActor } from "@/lib/services/dashboard.service";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export function useRoleRequests(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.roleRequests.list(params),
    queryFn: () => roleRequestService.getRequests(params),
  });
}

export function useApproveRoleRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      userId,
      actor,
    }: {
      id: string;
      userId: string;
      actor: AuditActor;
    }) => roleRequestService.approveRequest(id, userId, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roleRequests.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list });
      toast.success("Role request approved");
    },
    onError: () => toast.error("Failed to approve role request"),
  });
}

export function useRejectRoleRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      userId,
      actor,
    }: {
      id: string;
      userId: string;
      actor: AuditActor;
    }) => roleRequestService.rejectRequest(id, userId, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roleRequests.list() });
      toast.success("Role request rejected");
    },
    onError: () => toast.error("Failed to reject role request"),
  });
}
