import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type { Citizen } from "@/types/entities.types";
import * as citizenQueries from "@/lib/supabase/queries/citizens";

export const supabaseCitizenRepository = {
  findAll: (params?: PaginationParams): Promise<PaginatedResult<Citizen>> =>
    citizenQueries.fetchCitizens(params),

  findById: (id: string): Promise<Citizen | null> =>
    citizenQueries.fetchCitizenById(id),

  create: async (
    data: Omit<Citizen, "id" | "registeredAt" | "updatedAt">,
  ): Promise<Citizen> => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const now = new Date().toISOString();
    const { data: row, error } = await supabase
      .from("citizens")
      .insert({
        national_id: data.nationalId,
        first_name: data.firstName,
        last_name: data.lastName,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        phone: data.phone,
        email: data.email ?? null,
        village: data.address.village,
        community_council: data.address.communityCouncil ?? null,
        district: data.address.district,
        po_box: data.address.poBox ?? null,
        chief_id: data.chiefId,
        verification_status: data.verificationStatus,
        status: data.status,
        registered_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    const { mapCitizen } = await import("@/lib/supabase/mappers");
    return mapCitizen(row);
  },

  update: async (
    id: string,
    data: Partial<Citizen>,
  ): Promise<Citizen | null> => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.verificationStatus) patch.verification_status = data.verificationStatus;
    if (data.status) patch.status = data.status;

    const { data: row, error } = await supabase
      .from("citizens")
      .update(patch)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) return null;
    const { mapCitizen } = await import("@/lib/supabase/mappers");
    return mapCitizen(row);
  },

  getResidencyRequests: citizenQueries.fetchResidencyRequests,
  updateResidencyStatus: citizenQueries.updateResidencyStatus,
  createResidencyRequest: citizenQueries.insertResidencyRequest,
};
