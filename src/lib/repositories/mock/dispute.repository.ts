import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type { Dispute } from "@/types/entities.types";
import { MOCK_DISPUTES } from "@/lib/mock-data";
import { paginate, simulateDelay, generateId } from "@/lib/utils/pagination";

let disputesStore = [...MOCK_DISPUTES];

export const mockDisputeRepository = {
  async findAll(params?: PaginationParams): Promise<PaginatedResult<Dispute>> {
    await simulateDelay();
    return paginate(disputesStore, params);
  },

  async findById(id: string): Promise<Dispute | null> {
    await simulateDelay();
    return disputesStore.find((d) => d.id === id) ?? null;
  },

  async create(
    data: Omit<Dispute, "id" | "filedAt" | "caseNumber">,
  ): Promise<Dispute> {
    await simulateDelay();
    const dispute: Dispute = {
      ...data,
      id: generateId("disp"),
      caseNumber: `DSP-${new Date().getFullYear()}-${String(disputesStore.length + 1).padStart(3, "0")}`,
      filedAt: new Date().toISOString(),
    };
    disputesStore = [dispute, ...disputesStore];
    return dispute;
  },
};
