import { createClient } from "@/lib/supabase/client";
import type { PaginationParams } from "@/types/common.types";
import type {
  DashboardStats,
  ActivityItem,
  ChartDataPoint,
  User,
} from "@/types/entities.types";
import type { UserRole } from "@/types/common.types";
import { mapNotification, mapAuditLog, type DbNotification, type DbAuditLog } from "@/lib/supabase/mappers";
import {
  buildPaginatedResult,
  getPaginationRange,
} from "@/lib/supabase/pagination";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();

  const [
    citizens,
    residency,
    disputes,
    documents,
    animals,
    land,
    pendingDocs,
    pendingDisputes,
    pendingAnimals,
  ] = await Promise.all([
    supabase.from("citizens").select("id", { count: "exact", head: true }),
    supabase
      .from("residency_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "under_review"]),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase.from("animals").select("id", { count: "exact", head: true }),
    supabase.from("land_records").select("id", { count: "exact", head: true }),
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "under_review"]),
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "under_review"]),
    supabase
      .from("animals")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "under_review"]),
  ]);

  const pendingApprovals =
    (pendingDocs.count ?? 0) +
    (pendingDisputes.count ?? 0) +
    (pendingAnimals.count ?? 0);

  return {
    totalCitizens: citizens.count ?? 0,
    pendingVerifications: residency.count ?? 0,
    activeDisputes: disputes.count ?? 0,
    documentsIssued: documents.count ?? 0,
    registeredAnimals: animals.count ?? 0,
    landParcels: land.count ?? 0,
    pendingApprovals,
  };
}

export async function fetchRecentActivities(): Promise<ActivityItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw new Error(error.message);

  return (data as DbAuditLog[]).map((log) => ({
    id: log.id,
    type: log.entity,
    title: `${log.action} ${log.entity}`,
    description: log.details,
    timestamp: log.created_at,
    status: undefined,
  }));
}

export async function fetchChartData(): Promise<ChartDataPoint[]> {
  // Aggregated chart data: return static structure until time-series table exists
  const supabase = createClient();
  const { count: citizenCount } = await supabase
    .from("citizens")
    .select("id", { count: "exact", head: true });

  const base = citizenCount ?? 0;
  return [
    { month: "Jan", citizens: Math.max(1, base - 5), documents: 8, disputes: 2 },
    { month: "Feb", citizens: Math.max(2, base - 4), documents: 12, disputes: 1 },
    { month: "Mar", citizens: Math.max(3, base - 3), documents: 10, disputes: 3 },
    { month: "Apr", citizens: Math.max(4, base - 2), documents: 15, disputes: 2 },
    { month: "May", citizens: Math.max(5, base - 1), documents: 18, disputes: 4 },
    { month: "Jun", citizens: base, documents: 4, disputes: 2 },
  ];
}

export async function fetchNotifications(
  userId: string,
  params?: PaginationParams,
) {
  const supabase = createClient();
  const { page, pageSize, from, to } = getPaginationRange(params);

  const { data, error, count } = await supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return buildPaginatedResult(
    (data as DbNotification[]).map(mapNotification),
    count ?? 0,
    page,
    pageSize,
  );
}

export async function markNotificationRead(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function fetchAuditLogs(params?: PaginationParams) {
  const supabase = createClient();
  const { page, pageSize, from, to } = getPaginationRange(params);

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" });

  if (params?.search) {
    const term = `%${params.search}%`;
    query = query.or(
      `user_name.ilike.${term},action.ilike.${term},entity.ilike.${term},details.ilike.${term}`,
    );
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return buildPaginatedResult(
    (data as DbAuditLog[]).map(mapAuditLog),
    count ?? 0,
    page,
    pageSize,
  );
}

export async function fetchProfiles() {
  const supabase = createClient();
  const { data, error, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" });

  if (error) throw new Error(error.message);

  return {
    data: (data ?? []).map(
      (row): User => ({
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role as UserRole,
        village: row.village ?? undefined,
        district: row.district ?? undefined,
        chiefId: row.chief_id ?? undefined,
        phone: row.phone ?? undefined,
        avatarUrl: row.avatar_url ?? undefined,
        createdAt: row.created_at,
      }),
    ),
    total: count ?? 0,
  };
}
