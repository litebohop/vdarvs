import type { PaginationParams } from "@/types/common.types";
import type { Animal } from "@/types/entities.types";
import { animalRepository } from "@/lib/repositories/animal.repository";

export const animalService = {
  getAnimals(params?: PaginationParams) {
    return animalRepository.findAll(params);
  },

  getAnimal(id: string) {
    return animalRepository.findById(id);
  },

  registerAnimal(data: Omit<Animal, "id" | "registeredAt">) {
    return animalRepository.create(data);
  },
};
