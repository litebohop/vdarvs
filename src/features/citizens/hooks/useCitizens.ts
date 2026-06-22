"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/common.types";
import { citizenService } from "@/lib/services/citizen.service";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export function useCitizens(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.citizens.list(params),
    queryFn: () => citizenService.getCitizens(params),
  });
}

export function useCitizen(id: string) {
  return useQuery({
    queryKey: queryKeys.citizens.detail(id),
    queryFn: () => citizenService.getCitizen(id),
    enabled: !!id,
  });
}

export function useResidencyRequests(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.residency.list(params),
    queryFn: () => citizenService.getResidencyRequests(params),
  });
}

export function useVerifyResidency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reviewedBy,
    }: {
      id: string;
      reviewedBy: string;
    }) => citizenService.verifyResidency(id, reviewedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.residency.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.citizens.all });
      toast.success("Residency verified successfully");
    },
    onError: () => toast.error("Failed to verify residency"),
  });
}

export function useRejectResidency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reviewedBy,
    }: {
      id: string;
      reviewedBy: string;
    }) => citizenService.rejectResidency(id, reviewedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.residency.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.citizens.all });
      toast.success("Residency request rejected");
    },
    onError: () => toast.error("Failed to reject residency"),
  });
}
