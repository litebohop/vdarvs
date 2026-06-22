"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/common.types";
import { animalService } from "@/lib/services/animal.service";
import { queryKeys } from "@/lib/query-keys";

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
