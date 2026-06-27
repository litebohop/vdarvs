import { createClient } from "@/lib/supabase/client";
import type { Chief } from "@/types/entities.types";
import { mapChief, type DbChief } from "@/lib/supabase/mappers";

export async function fetchChiefs(): Promise<Chief[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chiefs")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as DbChief[]).map(mapChief);
}
