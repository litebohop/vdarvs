"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLogs } from "@/features/dashboard/hooks/useDashboard";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput, useTableParams } from "@/components/shared/search-input";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { format } from "date-fns";

export function AuditLogsTable() {
  const { search, setSearch, params } = useTableParams();
  const { data, isLoading, isError, refetch } = useAuditLogs(params);

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const logs = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="System activity and compliance trail"
      >
        <ExportPdfButton
          title="Audit Logs"
          headers={[
            "Timestamp",
            "User",
            "Action",
            "Entity",
            "Details",
            "Village",
          ]}
          rows={logs.map((log) => [
            format(new Date(log.createdAt), "dd MMM yyyy HH:mm"),
            log.userName,
            log.action,
            log.entity,
            log.details,
            log.village ?? "—",
          ])}
        />
      </PageHeader>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search audit logs..."
        className="max-w-sm"
      />
      {logs.length === 0 ? (
        <EmptyState title="No audit logs found" />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Village</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.createdAt), "dd MMM yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{log.action}</span>
                  </TableCell>
                  <TableCell className="capitalize">{log.entity}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                  <TableCell>{log.village ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
