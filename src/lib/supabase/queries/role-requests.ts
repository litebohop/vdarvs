import { createClient } from "@/lib/supabase/client";
import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type { UserRole, RecordStatus } from "@/types/common.types";
import type { RoleRequest } from "@/types/entities.types";
import {
  buildPaginatedResult,
  getPaginationRange,
} from "@/lib/supabase/pagination";

type DbRoleRequest = {
  id: string;
  user_id: string;
  requested_role: UserRole;
  reason: string;
  village: string | null;
  district: string | null;
  status: RecordStatus;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  profiles?: { full_name: string; email: string } | null;
};

function mapRoleRequest(row: DbRoleRequest): RoleRequest {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.profiles?.full_name,
    userEmail: row.profiles?.email,
    requestedRole: row.requested_role,
    reason: row.reason,
    village: row.village ?? undefined,
    district: row.district ?? undefined,
    status: row.status,
    requestedAt: row.requested_at,
    reviewedAt: row.reviewed_at ?? undefined,
    reviewedBy: row.reviewed_by ?? undefined,
  };
}

export async function insertRoleRequest(input: {
  userId: string;
  requestedRole: UserRole;
  reason: string;
  village?: string;
  district?: string;
}): Promise<RoleRequest> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("role_requests")
    .insert({
      user_id: input.userId,
      requested_role: input.requestedRole,
      reason: input.reason,
      village: input.village ?? null,
      district: input.district ?? null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRoleRequest(data as DbRoleRequest);
}

export async function fetchRoleRequestByUserId(
  userId: string,
): Promise<RoleRequest | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("role_requests")
    .select("*")
    .eq("user_id", userId)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRoleRequest(data as DbRoleRequest) : null;
}

export async function fetchRoleRequests(
  params?: PaginationParams,
): Promise<PaginatedResult<RoleRequest>> {
  const supabase = createClient();
  const { page, pageSize, from, to } = getPaginationRange(params);

  let query = supabase
    .from("role_requests")
    .select("*, profiles(full_name, email)", { count: "exact" })
    .order("requested_at", { ascending: false });

  if (params?.search) {
    const term = `%${params.search}%`;
    query = query.or(
      `reason.ilike.${term},village.ilike.${term},district.ilike.${term}`,
    );
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  return buildPaginatedResult(
    (data as DbRoleRequest[]).map(mapRoleRequest),
    count ?? 0,
    page,
    pageSize,
  );
}

export async function updateRoleRequestStatus(input: {
  id: string;
  status: RecordStatus;
  reviewedBy: string;
}): Promise<RoleRequest> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("role_requests")
    .update({
      status: input.status,
      reviewed_by: input.reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .select("*, profiles(full_name, email)")
    .single();

  if (error) throw new Error(error.message);
  return mapRoleRequest(data as DbRoleRequest);
}
