"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/common.types";
import type { Animal } from "@/types/entities.types";
import { animalService } from "@/lib/services/animal.service";
import type { AuditActor } from "@/lib/services/dashboard.service";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";

export function useAnimals(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.animals.list(params),
    queryFn: () => animalService.getAnimals(params),
  });
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: queryKeys.animals.detail(id),
    queryFn: () => animalService.getAnimal(id),
    enabled: !!id,
  });
}

export function useRegisterAnimal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
      actor,
    }: {
      data: Omit<Animal, "id" | "registeredAt">;
      actor: AuditActor;
    }) => animalService.registerAnimal(data, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.animals.all });
      toast.success("Animal registered successfully");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to register animal"),
  });
}

export function useApproveAnimal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actor }: { id: string; actor: AuditActor }) =>
      animalService.approveAnimal(id, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.animals.all });
      toast.success("Animal registration approved");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to approve animal"),
  });
}

export function useRejectAnimal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actor }: { id: string; actor: AuditActor }) =>
      animalService.rejectAnimal(id, actor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.animals.all });
      toast.success("Animal registration rejected");
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to reject animal"),
  });
}
