import type { PaginationParams } from "@/types/common.types";

export function getPaginationRange(params?: PaginationParams) {
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
