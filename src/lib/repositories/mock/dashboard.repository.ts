import type { PaginationParams, PaginatedResult } from "@/types/common.types";
import type {
  Notification,
  AuditLog,
  DashboardStats,
  ActivityItem,
  ChartDataPoint,
} from "@/types/entities.types";
import {
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
  MOCK_DASHBOARD_STATS,
  MOCK_ACTIVITIES,
  MOCK_CHART_DATA,
} from "@/lib/mock-data";
import { paginate, simulateDelay } from "@/lib/utils/pagination";

export const mockDashboardRepository = {
  async getStats(): Promise<DashboardStats> {
    await simulateDelay();
    return { ...MOCK_DASHBOARD_STATS };
  },

  async getRecentActivities(): Promise<ActivityItem[]> {
    await simulateDelay();
    return [...MOCK_ACTIVITIES];
  },

  async getChartData(): Promise<ChartDataPoint[]> {
    await simulateDelay();
    return [...MOCK_CHART_DATA];
  },
};

export const mockNotificationRepository = {
  async findAll(
    userId: string,
    params?: PaginationParams,
  ): Promise<PaginatedResult<Notification>> {
    await simulateDelay();
    const userNotifications = MOCK_NOTIFICATIONS.filter(
      (n) => n.userId === userId,
    );
    return paginate(userNotifications, params);
  },

  async markAsRead(id: string): Promise<void> {
    await simulateDelay();
    const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id);
    if (notification) notification.read = true;
  },
};

export const mockAuditRepository = {
  async findAll(params?: PaginationParams): Promise<PaginatedResult<AuditLog>> {
    await simulateDelay();
    return paginate(MOCK_AUDIT_LOGS, params);
  },
};
