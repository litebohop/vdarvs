import { appConfig } from "@/config/app.config";
import {
  mockDashboardRepository,
  mockNotificationRepository,
  mockAuditRepository,
} from "@/lib/repositories/mock/dashboard.repository";
import {
  supabaseDashboardRepository,
  supabaseNotificationRepository,
  supabaseAuditRepository,
} from "@/lib/repositories/supabase/dashboard.repository";

export const dashboardRepository = appConfig.useMockData
  ? mockDashboardRepository
  : supabaseDashboardRepository;

export const notificationRepository = appConfig.useMockData
  ? mockNotificationRepository
  : supabaseNotificationRepository;

export const auditRepository = appConfig.useMockData
  ? mockAuditRepository
  : supabaseAuditRepository;
