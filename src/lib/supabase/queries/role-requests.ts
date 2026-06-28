import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/common.types";
import type { RecordStatus } from "@/types/common.types";
import type { RoleRequest } from "@/types/entities.types";

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
};

function mapRoleRequest(row: DbRoleRequest): RoleRequest {
  return {
    id: row.id,
    userId: row.user_id,
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
