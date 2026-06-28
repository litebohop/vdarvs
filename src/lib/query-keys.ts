import type { PaginationParams } from "@/types/common.types";

export const queryKeys = {
  citizens: {
    all: ["citizens"] as const,
    list: (params?: PaginationParams) =>
      ["citizens", "list", params] as const,
    detail: (id: string) => ["citizens", "detail", id] as const,
  },
  animals: {
    all: ["animals"] as const,
    list: (params?: PaginationParams) =>
      ["animals", "list", params] as const,
    detail: (id: string) => ["animals", "detail", id] as const,
  },
  land: {
    all: ["land"] as const,
    list: (params?: PaginationParams) =>
      ["land", "list", params] as const,
    detail: (id: string) => ["land", "detail", id] as const,
  },
  documents: {
    all: ["documents"] as const,
    list: (params?: PaginationParams) =>
      ["documents", "list", params] as const,
    detail: (id: string) => ["documents", "detail", id] as const,
  },
  disputes: {
    all: ["disputes"] as const,
    list: (params?: PaginationParams) =>
      ["disputes", "list", params] as const,
    detail: (id: string) => ["disputes", "detail", id] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
    activities: ["dashboard", "activities"] as const,
    chart: ["dashboard", "chart"] as const,
    citizen: (userId: string) => ["dashboard", "citizen", userId] as const,
  },
  residency: {
    list: (params?: PaginationParams) =>
      ["residency", "list", params] as const,
  },
  notifications: {
    list: (userId: string, params?: PaginationParams) =>
      ["notifications", userId, params] as const,
  },
  audit: {
    list: (params?: PaginationParams) =>
      ["audit", "list", params] as const,
  },
  users: {
    list: ["users", "list"] as const,
  },
  chiefs: {
    all: ["chiefs"] as const,
    list: ["chiefs", "list"] as const,
  },
  roleRequests: {
    latest: (userId: string) => ["role-requests", "latest", userId] as const,
  },
} as const;
