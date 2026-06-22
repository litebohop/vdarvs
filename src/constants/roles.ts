import type { UserRole } from "@/types/common.types";

export const USER_ROLES: Record<
  UserRole,
  { label: string; description: string }
> = {
  citizen: {
    label: "Citizen",
    description: "Access personal records and submit requests",
  },
  village_staff: {
    label: "Village Staff",
    description: "Manage village administrative records",
  },
  village_chief: {
    label: "Village Chief",
    description: "Approve workflows and verify residency",
  },
  district_officer: {
    label: "District Officer",
    description: "Oversee district-level administration",
  },
  administrator: {
    label: "Administrator",
    description: "Full system access and configuration",
  },
};

export const ROLE_HIERARCHY: UserRole[] = [
  "citizen",
  "village_staff",
  "village_chief",
  "district_officer",
  "administrator",
];

export function hasMinimumRole(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  return (
    ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(requiredRole)
  );
}
