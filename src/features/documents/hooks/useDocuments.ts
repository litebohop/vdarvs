"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/common.types";
import type { Document } from "@/types/entities.types";
import { documentService } from "@/lib/services/document.service";
import type { AuditActor } from "@/lib/services/dashboard.service";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { useLinkedCitizen } from "@/features/citizens/hooks/useCitizens";
import { toast } from "sonner";

function useScopedDocumentParams(params?: PaginationParams) {
  const { user } = useAuth();
  const { data: citizen } = useLinkedCitizen();
  if (user?.role === "citizen" && citizen) {
    return { ...params, citizenId: citizen.id };
  }
  return params;
}

export function useDocuments(params?: PaginationParams) {
  const { user } = useAuth();
  const { data: citizen, isLoading: citizenLoading } = useLinkedCitizen();
  const scopedParams = useScopedDocumentParams(params);

  return useQuery({
    queryKey: queryKeys.documents.list(scopedParams),
    queryFn: () => documentService.getDocuments(scopedParams),
    enabled: user?.role !== "citizen" || !!citizen || !citizenLoading,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () => documentService.getDocument(id),
    enabled: !!id,
  });
}

export function useRequestDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      input,
      actor,
    }: {
      input: {
        type: Document["type"];
        title: string;
        citizenId: string;
        village: string;
        district: string;
        chiefId: string;
        file?: File;
      };
      actor: AuditActor;
    }) => documentService.requestDocument(input, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      toast.success("Document request submitted");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to submit request"),
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
