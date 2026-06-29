import type { Dispute } from "@/types/entities.types";
import * as disputeQueries from "@/lib/supabase/queries/disputes";

export const supabaseDisputeRepository = {
  findAll: disputeQueries.fetchDisputes,
  findById: disputeQueries.fetchDisputeById,
  create: async (
    data: Omit<Dispute, "id" | "filedAt" | "caseNumber">,
  ): Promise<Dispute> => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from("disputes")
      .select("id", { count: "exact", head: true });
    const caseNumber = `DSP-${year}-${String((count ?? 0) + 1).padStart(3, "0")}`;

    const { data: row, error } = await supabase
      .from("disputes")
      .insert({
        case_number: caseNumber,
        title: data.title,
        description: data.description,
        complainant_id: data.complainantId,
        respondent_name: data.respondentName,
        village: data.village,
        district: data.district,
        chief_id: data.chiefId,
        category: data.category,
        status: data.status,
      })
      .select("*, citizens(first_name, last_name)")
      .single();

    if (error) throw new Error(error.message);
    const { mapDispute } = await import("@/lib/supabase/mappers");
    return mapDispute(row);
  },
  updateStatus: disputeQueries.updateDisputeStatus,
};
