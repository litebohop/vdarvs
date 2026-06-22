import type { PaginationParams } from "@/types/common.types";
import type { Citizen } from "@/types/entities.types";
import { citizenRepository } from "@/lib/repositories/citizen.repository";

export const citizenService = {
  getCitizens(params?: PaginationParams) {
    return citizenRepository.findAll(params);
  },

  getCitizen(id: string) {
    return citizenRepository.findById(id);
  },

  registerCitizen(data: Omit<Citizen, "id" | "registeredAt" | "updatedAt">) {
    return citizenRepository.create(data);
  },

  updateCitizen(id: string, data: Partial<Citizen>) {
    return citizenRepository.update(id, data);
  },

  getResidencyRequests(params?: PaginationParams) {
    return citizenRepository.getResidencyRequests(params);
  },

  verifyResidency(id: string, reviewedBy: string) {
    return citizenRepository.updateResidencyStatus(id, "verified", reviewedBy);
  },

  rejectResidency(id: string, reviewedBy: string) {
    return citizenRepository.updateResidencyStatus(id, "rejected", reviewedBy);
  },
};
