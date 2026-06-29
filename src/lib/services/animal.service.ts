import type { PaginationParams } from "@/types/common.types";
import type { Animal } from "@/types/entities.types";
import { animalRepository } from "@/lib/repositories/animal.repository";
import { auditService, type AuditActor } from "@/lib/services/dashboard.service";
import { insertNotification } from "@/lib/supabase/queries/notifications";
import { fetchChiefProfileByChiefId } from "@/lib/supabase/queries/profiles";
import { fetchCitizenById } from "@/lib/supabase/queries/citizens";

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

    const owner = await fetchCitizenById(animal.ownerId);
    if (owner?.chiefId) {
      const chiefProfile = await fetchChiefProfileByChiefId(owner.chiefId);
      if (chiefProfile) {
        await insertNotification({
          userId: chiefProfile.id,
          title: "Animal registration pending approval",
          message: `${animal.tagNumber} for ${animal.ownerName}`,
          type: "action",
          href: "/animals",
        });
      }
    }

    return animal;
  },

  async approveAnimal(id: string, actor: AuditActor) {
    const animal = await animalRepository.updateStatus(id, "approved");
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "APPROVE",
      entity: "animal",
      entityId: animal.id,
      details: `Approved animal registration ${animal.tagNumber}`,
      village: animal.village,
      district: animal.district,
    });
    return animal;
  },

  async rejectAnimal(id: string, actor: AuditActor) {
    const animal = await animalRepository.updateStatus(id, "rejected");
    await auditService.createAuditLog({
      userId: actor.userId,
      userName: actor.userName,
      action: "REJECT",
      entity: "animal",
      entityId: animal.id,
      details: `Rejected animal registration ${animal.tagNumber}`,
      village: animal.village,
      district: animal.district,
    });
    return animal;
  },
};
