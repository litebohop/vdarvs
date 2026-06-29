import { createClient } from "@/lib/supabase/client";
import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type { LandRecord } from "@/types/entities.types";
import { mapLandRecord, type DbLandRecord } from "@/lib/supabase/mappers";
import {
  buildPaginatedResult,
  getPaginationRange,
} from "@/lib/supabase/pagination";

export async function fetchLandRecords(
  params?: PaginationParams,
): Promise<PaginatedResult<LandRecord>> {
  const supabase = createClient();
  const { page, pageSize, from, to } = getPaginationRange(params);

  let query = supabase
    .from("land_records")
    .select("*, citizens(first_name, last_name)", { count: "exact" });

  if (params?.search) {
    const term = `%${params.search}%`;
    query = query.or(
      `parcel_number.ilike.${term},village.ilike.${term},land_type.ilike.${term}`,
    );
  }

  if (params?.ownerId) {
    query = query.eq("owner_id", params.ownerId);
  }

  query = query.order("registered_at", { ascending: false });

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  return buildPaginatedResult(
    (data as DbLandRecord[]).map(mapLandRecord),
    count ?? 0,
    page,
    pageSize,
  );
}

export async function fetchLandRecordById(
  id: string,
): Promise<LandRecord | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("land_records")
    .select("*, citizens(first_name, last_name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapLandRecord(data as DbLandRecord) : null;
}
