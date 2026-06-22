import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type { LandRecord } from "@/types/entities.types";
import { MOCK_LAND } from "@/lib/mock-data";
import { paginate, simulateDelay, generateId } from "@/lib/utils/pagination";

let landStore = [...MOCK_LAND];

export const mockLandRepository = {
  async findAll(
    params?: PaginationParams,
  ): Promise<PaginatedResult<LandRecord>> {
    await simulateDelay();
    return paginate(landStore, params);
  },

  async findById(id: string): Promise<LandRecord | null> {
    await simulateDelay();
    return landStore.find((l) => l.id === id) ?? null;
  },

  async create(
    data: Omit<LandRecord, "id" | "registeredAt">,
  ): Promise<LandRecord> {
    await simulateDelay();
    const record: LandRecord = {
      ...data,
      id: generateId("land"),
      registeredAt: new Date().toISOString(),
    };
    landStore = [record, ...landStore];
    return record;
  },
};
