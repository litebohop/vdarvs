"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUsers } from "@/features/dashboard/hooks/useDashboard";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { ErrorState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { USER_ROLES } from "@/constants/roles";

export function UsersTable() {
  const { data, isLoading, isError, refetch } = useUsers();

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const users = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Read-only list of staff accounts. Role changes happen through Role Requests."
      >
        <ExportPdfButton
          title="Users"
          headers={["Name", "Email", "Role", "Village", "District"]}
          rows={users.map((user) => [
            user.fullName,
            user.email,
            USER_ROLES[user.role].label,
            user.village ?? "—",
            user.district ?? "—",
          ])}
        />
      </PageHeader>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Village</TableHead>
              <TableHead>District</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{USER_ROLES[user.role].label}</Badge>
                </TableCell>
                <TableCell>{user.village ?? "—"}</TableCell>
                <TableCell>{user.district ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
