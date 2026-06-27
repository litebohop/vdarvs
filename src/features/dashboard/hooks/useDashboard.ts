"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginationParams } from "@/types/common.types";
import {
  auditService,
  dashboardService,
  notificationService,
} from "@/lib/services/dashboard.service";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { supabaseUsersRepository } from "@/lib/repositories/supabase/dashboard.repository";

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => dashboardService.getStats(),
  });
}

export function useRecentActivities() {
  return useQuery({
    queryKey: queryKeys.dashboard.activities,
    queryFn: () => dashboardService.getRecentActivities(),
  });
}

export function useChartData() {
  return useQuery({
    queryKey: queryKeys.dashboard.chart,
    queryFn: () => dashboardService.getChartData(),
  });
}

export function useNotifications(params?: PaginationParams) {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications.list(user?.id ?? "", params),
    queryFn: () => notificationService.getNotifications(user!.id, params),
    enabled: !!user,
  });
}

export function useAuditLogs(params?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.audit.list(params),
    queryFn: () => auditService.getAuditLogs(params),
  });
}

import type { User } from "@/types/entities.types";

export function useUsers() {
  return useQuery<{ data: User[]; total: number }>({
    queryKey: queryKeys.users.list,
    queryFn: () => supabaseUsersRepository.findAll(),
  });
}
