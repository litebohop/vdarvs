"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/common.types";
import { disputeService } from "@/lib/services/dispute.service";
import { queryKeys } from "@/lib/query-keys";

export function useDisputes(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.disputes.list(params),
    queryFn: () => disputeService.getDisputes(params),
  });
}

export function useDispute(id: string) {
  return useQuery({
    queryKey: queryKeys.disputes.detail(id),
    queryFn: () => disputeService.getDispute(id),
    enabled: !!id,
  });
}
