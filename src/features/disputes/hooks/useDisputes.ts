"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/common.types";
import type { Dispute } from "@/types/entities.types";
import { disputeService } from "@/lib/services/dispute.service";
import type { AuditActor } from "@/lib/services/dashboard.service";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { useLinkedCitizen } from "@/features/citizens/hooks/useCitizens";
import { toast } from "sonner";

export function useDisputes(params?: PaginationParams) {
  const { user } = useAuth();
  const { data: citizen, isLoading: citizenLoading } = useLinkedCitizen();
  const scopedParams =
    user?.role === "citizen" && citizen
      ? { ...params, complainantId: citizen.id }
      : params;

  return useQuery({
    queryKey: queryKeys.disputes.list(scopedParams),
    queryFn: () => disputeService.getDisputes(scopedParams),
    enabled: user?.role !== "citizen" || !!citizen || !citizenLoading,
  });
}

export function useDispute(id: string) {
  return useQuery({
    queryKey: queryKeys.disputes.detail(id),
    queryFn: () => disputeService.getDispute(id),
    enabled: !!id,
  });
}

export function useFileDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      actor,
    }: {
      data: Omit<Dispute, "id" | "filedAt" | "caseNumber">;
      actor: AuditActor;
    }) => disputeService.fileDispute(data, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disputes.all });
      toast.success("Dispute filed successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to file dispute"),
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      actor,
    }: {
      id: string;
      status: "approved" | "rejected";
      actor: AuditActor;
    }) => disputeService.resolveDispute(id, status, actor),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disputes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success(
        variables.status === "approved"
          ? "Dispute resolved"
          : "Dispute dismissed",
      );
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to update dispute"),
  });
}
