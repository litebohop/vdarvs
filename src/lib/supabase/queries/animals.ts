import { createClient } from "@/lib/supabase/client";
import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type { Animal } from "@/types/entities.types";
import { mapAnimal, type DbAnimal } from "@/lib/supabase/mappers";
import {
  buildPaginatedResult,
  getPaginationRange,
} from "@/lib/supabase/pagination";

export async function fetchAnimals(
  params?: PaginationParams,
): Promise<PaginatedResult<Animal>> {
  const supabase = createClient();
  const { page, pageSize, from, to } = getPaginationRange(params);

  let query = supabase
    .from("animals")
    .select("*, citizens(first_name, last_name)", { count: "exact" });

  if (params?.search) {
    const term = `%${params.search}%`;
    query = query.or(
      `tag_number.ilike.${term},species.ilike.${term},breed.ilike.${term},village.ilike.${term}`,
    );
  }

  if (params?.ownerId) {
    query = query.eq("owner_id", params.ownerId);
  }

  query = query.order("registered_at", { ascending: false });

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  return buildPaginatedResult(
    (data as DbAnimal[]).map(mapAnimal),
    count ?? 0,
    page,
    pageSize,
  );
}

export async function fetchAnimalById(id: string): Promise<Animal | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("animals")
    .select("*, citizens(first_name, last_name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapAnimal(data as DbAnimal) : null;
}

export async function updateAnimalStatus(
  id: string,
  status: Animal["status"],
): Promise<Animal> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("animals")
    .update({ status })
    .eq("id", id)
    .select("*, citizens(first_name, last_name)")
    .single();

  if (error) throw new Error(error.message);
  return mapAnimal(data as DbAnimal);
}
