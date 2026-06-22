import type { PaginationParams } from "@/types/common.types";
import type { LandRecord } from "@/types/entities.types";
import { landRepository } from "@/lib/repositories/land.repository";

export const landService = {
  getLandRecords(params?: PaginationParams) {
    return landRepository.findAll(params);
  },

  getLandRecord(id: string) {
    return landRepository.findById(id);
  },

  registerLand(data: Omit<LandRecord, "id" | "registeredAt">) {
    return landRepository.create(data);
  },
};
