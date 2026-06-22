import type { PaginationParams } from "@/types/common.types";
import {
  dashboardRepository,
  notificationRepository,
  auditRepository,
} from "@/lib/repositories/dashboard.repository";

export const dashboardService = {
  getStats: () => dashboardRepository.getStats(),
  getRecentActivities: () => dashboardRepository.getRecentActivities(),
  getChartData: () => dashboardRepository.getChartData(),
};

export const notificationService = {
  getNotifications: (userId: string, params?: PaginationParams) =>
    notificationRepository.findAll(userId, params),
  markAsRead: (id: string) => notificationRepository.markAsRead(id),
};

export const auditService = {
  getAuditLogs: (params?: PaginationParams) =>
    auditRepository.findAll(params),
};
