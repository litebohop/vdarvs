"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/common.types";
import { documentService } from "@/lib/services/document.service";
import type { AuditActor } from "@/lib/services/dashboard.service";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export function useDocuments(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.documents.list(params),
    queryFn: () => documentService.getDocuments(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => documentService.getDocument(id),
    enabled: !!id,
  });
}

export function useApproveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actor }: { id: string; actor: AuditActor }) =>
      documentService.approveDocument(id, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      toast.success("Document approved");
    },
    onError: () => toast.error("Failed to approve document"),
  });
}

export function useRejectDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actor }: { id: string; actor: AuditActor }) =>
      documentService.rejectDocument(id, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      toast.success("Document rejected");
    },
    onError: () => toast.error("Failed to reject document"),
  });
}
