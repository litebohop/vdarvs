import { createClient } from "@/lib/supabase/client";
import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type { Document } from "@/types/entities.types";
import { mapDocument, type DbDocument } from "@/lib/supabase/mappers";
import {
  buildPaginatedResult,
  getPaginationRange,
} from "@/lib/supabase/pagination";

export async function fetchDocuments(
  params?: PaginationParams,
): Promise<PaginatedResult<Document>> {
  const supabase = createClient();
  const { page, pageSize, from, to } = getPaginationRange(params);

  let query = supabase
    .from("documents")
    .select("*, citizens(first_name, last_name)", { count: "exact" });

  if (params?.search) {
    const term = `%${params.search}%`;
    query = query.or(
      `reference_number.ilike.${term},title.ilike.${term},type.ilike.${term},village.ilike.${term}`,
    );
  }

  query = query.order("requested_at", { ascending: false });

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  return buildPaginatedResult(
    (data as DbDocument[]).map(mapDocument),
    count ?? 0,
    page,
    pageSize,
  );
}

export async function fetchDocumentById(id: string): Promise<Document | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*, citizens(first_name, last_name)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapDocument(data as DbDocument) : null;
}

export async function updateDocumentStatus(
  id: string,
  status: Document["status"],
  approvedBy?: string,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("documents")
    .update({
      status,
      approved_by: approvedBy ?? null,
      issued_at: status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("*, citizens(first_name, last_name)")
    .single();

  if (error) throw new Error(error.message);
  return mapDocument(data as DbDocument);
}
