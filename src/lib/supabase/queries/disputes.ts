import { createClient } from "@/lib/supabase/client";
import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type { Dispute } from "@/types/entities.types";
import { mapDispute, type DbDispute } from "@/lib/supabase/mappers";
import {
  buildPaginatedResult,
  getPaginationRange,
} from "@/lib/supabase/pagination";

export async function fetchDisputes(
  params?: PaginationParams,
): Promise<PaginatedResult<Dispute>> {
  const supabase = createClient();
  const { page, pageSize, from, to } = getPaginationRange(params);

  let query = supabase
    .from("disputes")
    .select("*, citizens(first_name, last_name)", {
      count: "exact",
    });

  if (params?.search) {
    const term = `%${params.search}%`;
    query = query.or(
      `case_number.ilike.${term},title.ilike.${term},village.ilike.${term}`,
    );
  }

  query = query.order("filed_at", { ascending: false });

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  return buildPaginatedResult(
    (data as DbDispute[]).map(mapDispute),
    count ?? 0,
    page,
    pageSize,
  );
}

export async function fetchDisputeById(id: string): Promise<Dispute | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("disputes")
    .select("*, citizens(first_name, last_name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapDispute(data as DbDispute) : null;
}
