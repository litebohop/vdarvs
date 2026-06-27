import * as dashboardQueries from "@/lib/supabase/queries/dashboard";

export const supabaseDashboardRepository = {
  getStats: dashboardQueries.fetchDashboardStats,
  getRecentActivities: dashboardQueries.fetchRecentActivities,
  getChartData: dashboardQueries.fetchChartData,
};

export const supabaseNotificationRepository = {
  findAll: dashboardQueries.fetchNotifications,
  markAsRead: dashboardQueries.markNotificationRead,
};

export const supabaseAuditRepository = {
  findAll: dashboardQueries.fetchAuditLogs,
  create: dashboardQueries.insertAuditLog,
};

export const supabaseUsersRepository = {
  findAll: dashboardQueries.fetchProfiles,
};
