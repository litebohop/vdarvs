import { createClient } from "@/lib/supabase/client";
import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type { Citizen } from "@/types/entities.types";
import {
  mapCitizen,
  mapResidencyRequest,
  type DbCitizen,
  type DbResidencyRequest,
} from "@/lib/supabase/mappers";
import {
  buildPaginatedResult,
  getPaginationRange,
} from "@/lib/supabase/pagination";

export async function fetchCitizens(
  params?: PaginationParams,
): Promise<PaginatedResult<Citizen>> {
  const supabase = createClient();
  const { page, pageSize, from, to } = getPaginationRange(params);

  let query = supabase
    .from("citizens")
    .select("*", { count: "exact" });

  if (params?.search) {
    const term = `%${params.search}%`;
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},national_id.ilike.${term},village.ilike.${term}`,
    );
  }

  if (params?.sortBy) {
    const columnMap: Record<string, string> = {
      firstName: "first_name",
      lastName: "last_name",
      nationalId: "national_id",
      registeredAt: "registered_at",
      village: "village",
    };
    const column = columnMap[params.sortBy] ?? params.sortBy;
    query = query.order(column, {
      ascending: params.sortOrder !== "desc",
    });
  } else {
    query = query.order("registered_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error(error.message);

  return buildPaginatedResult(
    (data as DbCitizen[]).map(mapCitizen),
    count ?? 0,
    page,
    pageSize,
  );
}

export async function fetchCitizenById(id: string): Promise<Citizen | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("citizens")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapCitizen(data as DbCitizen) : null;
}

export async function fetchResidencyRequests(params?: PaginationParams) {
  const supabase = createClient();
  const { page, pageSize, from, to } = getPaginationRange(params);

  const { data, error, count } = await supabase
    .from("residency_requests")
    .select(
      "*, citizens(first_name, last_name, national_id, village, district)",
      { count: "exact" },
    )
    .order("requested_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return buildPaginatedResult(
    (data as DbResidencyRequest[]).map(mapResidencyRequest),
    count ?? 0,
    page,
    pageSize,
  );
}

export async function updateResidencyStatus(
  id: string,
  status: "verified" | "rejected",
  reviewedBy: string,
) {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data: request, error: fetchError } = await supabase
    .from("residency_requests")
    .select("citizen_id")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const { data, error } = await supabase
    .from("residency_requests")
    .update({
      status,
      reviewed_at: now,
      reviewed_by: reviewedBy,
    })
    .eq("id", id)
    .select(
      "*, citizens(first_name, last_name, national_id, village, district)",
    )
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from("citizens")
    .update({
      verification_status: status,
      updated_at: now,
    })
    .eq("id", request.citizen_id);

  return mapResidencyRequest(data as DbResidencyRequest);
}

export async function insertResidencyRequest(
  citizenId: string,
  chiefId: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("residency_requests").insert({
    citizen_id: citizenId,
    chief_id: chiefId,
    status: "pending",
  });

  if (error) throw new Error(error.message);
}
