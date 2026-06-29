"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/common.types";
import type { LandRecord } from "@/types/entities.types";
import { landService } from "@/lib/services/land.service";
import type { AuditActor } from "@/lib/services/dashboard.service";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export function useLandRecords(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.land.list(params),
    queryFn: () => landService.getLandRecords(params),
  });
}

export function useLandRecord(id: string) {
  return useQuery({
    queryKey: queryKeys.land.detail(id),
    queryFn: () => landService.getLandRecord(id),
    enabled: !!id,
  });
}

export function useRegisterLand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      actor,
    }: {
      data: Omit<LandRecord, "id" | "registeredAt">;
      actor: AuditActor;
    }) => landService.registerLand(data, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.land.all });
      toast.success("Land record registered successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to register land"),
  });
}

export function useApproveLand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actor }: { id: string; actor: AuditActor }) =>
      landService.approveLand(id, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.land.all });
      toast.success("Land registration approved");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to approve land"),
  });
}

export function useRejectLand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actor }: { id: string; actor: AuditActor }) =>
      landService.rejectLand(id, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.land.all });
      toast.success("Land registration rejected");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to reject land"),
  });
}
