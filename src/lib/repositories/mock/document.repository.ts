import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type { Document } from "@/types/entities.types";
import { MOCK_DOCUMENTS } from "@/lib/mock-data";
import { paginate, simulateDelay } from "@/lib/utils/pagination";

const documentsStore = [...MOCK_DOCUMENTS];

export const mockDocumentRepository = {
  async findAll(
    params?: PaginationParams,
  ): Promise<PaginatedResult<Document>> {
    await simulateDelay();
    return paginate(documentsStore, params);
  },

  async findById(id: string): Promise<Document | null> {
    await simulateDelay();
    return documentsStore.find((d) => d.id === id) ?? null;
  },

  async updateStatus(
    id: string,
    status: Document["status"],
    approvedBy?: string,
  ): Promise<Document | null> {
    await simulateDelay();
    const index = documentsStore.findIndex((d) => d.id === id);
    if (index === -1) return null;
    documentsStore[index] = {
      ...documentsStore[index],
      status,
      approvedBy,
      issuedAt:
        status === "approved"
          ? new Date().toISOString()
          : documentsStore[index].issuedAt,
    };
    return documentsStore[index];
  },
};
