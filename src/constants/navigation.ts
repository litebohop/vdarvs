import type { UserRole } from "@/types/common.types";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Map,
  FileText,
  Scale,
  BarChart3,
  Bell,
  Settings,
  ClipboardList,
  UserCheck,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: string;
}

export const MAIN_NAV: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      "citizen",
      "village_staff",
      "village_chief",
      "district_officer",
      "administrator",
    ],
  },
  {
    title: "Citizens",
    href: "/citizens",
    icon: Users,
    roles: [
      "village_staff",
      "village_chief",
      "district_officer",
      "administrator",
    ],
  },
  {
    title: "Residency Verification",
    href: "/residency",
    icon: UserCheck,
    roles: ["village_chief", "district_officer", "administrator"],
  },
  {
    title: "Land Records",
    href: "/land",
    icon: Map,
    roles: [
      "village_staff",
      "village_chief",
      "district_officer",
      "administrator",
    ],
  },
  {
    title: "Animal Registry",
    href: "/animals",
    icon: PawPrint,
    roles: [
      "village_staff",
      "village_chief",
      "district_officer",
      "administrator",
    ],
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
    roles: [
      "citizen",
      "village_staff",
      "village_chief",
      "district_officer",
      "administrator",
    ],
  },
  {
    title: "Disputes",
    href: "/disputes",
    icon: Scale,
    roles: [
      "citizen",
      "village_staff",
      "village_chief",
      "district_officer",
      "administrator",
    ],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["village_chief", "district_officer", "administrator"],
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: [
      "citizen",
      "village_staff",
      "village_chief",
      "district_officer",
      "administrator",
    ],
  },
];

export const ADMIN_NAV: NavItem[] = [
  {
    title: "Users",
    href: "/users",
    icon: Users,
    roles: ["administrator"],
  },
  {
    title: "Audit Logs",
    href: "/audit-logs",
    icon: ClipboardList,
    roles: ["administrator", "district_officer"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["administrator"],
  },
];

export function getNavForRole(role: UserRole): {
  main: NavItem[];
  admin: NavItem[];
} {
  return {
    main: MAIN_NAV.filter((item) => item.roles.includes(role)),
    admin: ADMIN_NAV.filter((item) => item.roles.includes(role)),
  };
}
