import type { LandRecord } from "@/types/entities.types";
import * as landQueries from "@/lib/supabase/queries/land";

export const supabaseLandRepository = {
  findAll: landQueries.fetchLandRecords,
  findById: landQueries.fetchLandRecordById,
  create: async (
    data: Omit<LandRecord, "id" | "registeredAt">,
  ): Promise<LandRecord> => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from("land_records")
      .select("id", { count: "exact", head: true });
    const parcelNumber =
      data.parcelNumber ||
      `PAR-${year}-${String((count ?? 0) + 1).padStart(4, "0")}`;

    const { data: row, error } = await supabase
      .from("land_records")
      .insert({
        parcel_number: parcelNumber,
        owner_id: data.ownerId,
        village: data.village,
        community_council: data.communityCouncil,
        district: data.district,
        land_type: data.landType,
        size_hectares: data.sizeHectares,
        chief_id: data.chiefId,
        status: data.status,
        description: data.description ?? null,
      })
      .select("*, citizens(first_name, last_name)")
      .single();

    if (error) throw new Error(error.message);
    const { mapLandRecord } = await import("@/lib/supabase/mappers");
    return mapLandRecord(row);
  },
};
