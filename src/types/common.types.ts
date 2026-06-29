export type UserRole =
  | "citizen"
  | "village_staff"
  | "village_chief"
  | "district_officer"
  | "administrator";

export type RecordStatus =
  | "draft"
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "archived";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface VillageAddress {
  village: string;
  communityCouncil?: string;
  district: string;
  poBox?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  citizenId?: string;
  ownerId?: string;
  complainantId?: string;
  status?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
}
