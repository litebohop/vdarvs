export const appConfig = {
  name: "VDARVS",
  fullName: "Village Digital Administrative Records & Verification System",
  description:
    "Digital village administration for Lesotho local government",
  country: "Lesotho",
  /** Uses mock repositories only when explicitly enabled or Supabase is not configured */
  useMockData:
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL,
  defaultPageSize: 10,
  queryStaleTime: 60_000,
  queryGcTime: 5 * 60_000,
} as const;
