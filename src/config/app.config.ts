export const appConfig = {
  name: "VDARVS",
  fullName: "Village Digital Administrative Records & Verification System",
  description:
    "Digital village administration for Lesotho local government",
  country: "Lesotho",
  defaultPageSize: 10,
  queryStaleTime: 60_000,
  queryGcTime: 5 * 60_000,
} as const;
