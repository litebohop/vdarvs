"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/common.types";
import { landService } from "@/lib/services/land.service";
import { queryKeys } from "@/lib/query-keys";

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
