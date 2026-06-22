import type { Animal } from "@/types/entities.types";
import * as animalQueries from "@/lib/supabase/queries/animals";

export const supabaseAnimalRepository = {
  findAll: animalQueries.fetchAnimals,
  findById: animalQueries.fetchAnimalById,
  create: async (
    data: Omit<Animal, "id" | "registeredAt">,
  ): Promise<Animal> => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: row, error } = await supabase
      .from("animals")
      .insert({
        tag_number: data.tagNumber,
        species: data.species,
        breed: data.breed,
        owner_id: data.ownerId,
        village: data.village,
        district: data.district,
        status: data.status,
        notes: data.notes ?? null,
      })
      .select("*, citizens(first_name, last_name)")
      .single();

    if (error) throw new Error(error.message);
    const { mapAnimal } = await import("@/lib/supabase/mappers");
    return mapAnimal(row);
  },
};
