import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type { Animal } from "@/types/entities.types";
import { MOCK_ANIMALS } from "@/lib/mock-data";
import { paginate, simulateDelay, generateId } from "@/lib/utils/pagination";

let animalsStore = [...MOCK_ANIMALS];

export const mockAnimalRepository = {
  async findAll(params?: PaginationParams): Promise<PaginatedResult<Animal>> {
    await simulateDelay();
    return paginate(animalsStore, params);
  },

  async findById(id: string): Promise<Animal | null> {
    await simulateDelay();
    return animalsStore.find((a) => a.id === id) ?? null;
  },

  async create(
    data: Omit<Animal, "id" | "registeredAt">,
  ): Promise<Animal> {
    await simulateDelay();
    const animal: Animal = {
      ...data,
      id: generateId("ani"),
      registeredAt: new Date().toISOString(),
    };
    animalsStore = [animal, ...animalsStore];
    return animal;
  },
};
