import * as chiefQueries from "@/lib/supabase/queries/chiefs";

export const supabaseChiefRepository = {
  findAll: chiefQueries.fetchChiefs,
};
