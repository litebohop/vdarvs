import type { PaginationParams } from "@/types/common.types";
import type { AuditLog } from "@/types/entities.types";
import {
  dashboardRepository,
  notificationRepository,
  auditRepository,
} from "@/lib/repositories/dashboard.repository";

export const dashboardService = {
  getStats: () => dashboardRepository.getStats(),
  getRecentActivities: () => dashboardRepository.getRecentActivities(),
  getChartData: () => dashboardRepository.getChartData(),
  getCitizenSummary: (userId: string, email: string) =>
    dashboardRepository.getCitizenSummary(userId, email),
};

export const notificationService = {
  getNotifications: (userId: string, params?: PaginationParams) =>
    notificationRepository.findAll(userId, params),
  markAsRead: (id: string) => notificationRepository.markAsRead(id),
};

export type AuditActor = {
  userId: string;
  userName: string;
};

export const auditService = {
  getAuditLogs: (params?: PaginationParams) =>
    auditRepository.findAll(params),

  createAuditLog: (entry: Omit<AuditLog, "id" | "createdAt">) =>
    auditRepository.create(entry),
};
