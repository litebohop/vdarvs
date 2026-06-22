import type { PaginationParams } from "@/types/common.types";
import type { Dispute } from "@/types/entities.types";
import { disputeRepository } from "@/lib/repositories/dispute.repository";

export const disputeService = {
  getDisputes(params?: PaginationParams) {
    return disputeRepository.findAll(params);
  },

  getDispute(id: string) {
    return disputeRepository.findById(id);
  },

  fileDispute(data: Omit<Dispute, "id" | "filedAt" | "caseNumber">) {
    return disputeRepository.create(data);
  },
};
