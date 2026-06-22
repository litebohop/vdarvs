import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type { Citizen } from "@/types/entities.types";
import {
  MOCK_CITIZENS,
  MOCK_RESIDENCY_REQUESTS,
} from "@/lib/mock-data";
import { paginate, simulateDelay, generateId } from "@/lib/utils/pagination";

let citizensStore = [...MOCK_CITIZENS];
const residencyStore = [...MOCK_RESIDENCY_REQUESTS];

export const mockCitizenRepository = {
  async findAll(
    params?: PaginationParams,
  ): Promise<PaginatedResult<Citizen>> {
    await simulateDelay();
    return paginate(citizensStore, params);
  },

  async findById(id: string): Promise<Citizen | null> {
    await simulateDelay();
    return citizensStore.find((c) => c.id === id) ?? null;
  },

  async create(
    data: Omit<Citizen, "id" | "registeredAt" | "updatedAt">,
  ): Promise<Citizen> {
    await simulateDelay();
    const citizen: Citizen = {
      ...data,
      id: generateId("cit"),
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    citizensStore = [citizen, ...citizensStore];
    return citizen;
  },

  async update(id: string, data: Partial<Citizen>): Promise<Citizen | null> {
    await simulateDelay();
    const index = citizensStore.findIndex((c) => c.id === id);
    if (index === -1) return null;
    citizensStore[index] = {
      ...citizensStore[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return citizensStore[index];
  },

  async getResidencyRequests(params?: PaginationParams) {
    await simulateDelay();
    return paginate(residencyStore, params);
  },

  async updateResidencyStatus(
    id: string,
    status: "verified" | "rejected",
    reviewedBy: string,
  ) {
    await simulateDelay();
    const index = residencyStore.findIndex((r) => r.id === id);
    if (index === -1) return null;
    residencyStore[index] = {
      ...residencyStore[index],
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
    };
    const citizen = citizensStore.find(
      (c) => c.id === residencyStore[index].citizenId,
    );
    if (citizen) {
      citizen.verificationStatus = status;
      citizen.updatedAt = new Date().toISOString();
    }
    return residencyStore[index];
  },
};
