import type { PaginationParams } from "@/types/common.types";
import type { Animal } from "@/types/entities.types";
import { animalRepository } from "@/lib/repositories/animal.repository";
import { auditService, type AuditActor } from "@/lib/services/dashboard.service";

export const animalService = {
  getAnimals(params?: PaginationParams) {
    return animalRepository.findAll(params);
  },

  getAnimal(id: string) {
    return animalRepository.findById(id);
  },

  async registerAnimal(
    data: Omit<Animal, "id" | "registeredAt">,
    actor: AuditActor,
  ) {
    const animal = await animalRepository.create(data);
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "CREATE",
      entity: "animal",
      entityId: animal.id,
      details: `Registered ${animal.species} ${animal.tagNumber} for ${animal.ownerName}`,
      village: animal.village,
      district: animal.district,
    });
    return animal;
  },
};
