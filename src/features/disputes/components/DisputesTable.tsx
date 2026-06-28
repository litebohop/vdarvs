"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDisputes } from "@/features/disputes/hooks/useDisputes";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput, useTableParams } from "@/components/shared/search-input";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { format } from "date-fns";
import { capitalize } from "@/lib/utils/format";

export function DisputesTable() {
  const { search, setSearch, setPage, params } = useTableParams();
  const { data, isLoading, isError, refetch } = useDisputes(params);

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const disputes = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispute Resolution"
        description="Village disputes mediated by Chiefs"
      >
        <ExportPdfButton
          title="Dispute Resolution"
          headers={[
            "Case",
            "Title",
            "Category",
            "Complainant",
            "Village",
            "Status",
            "Filed",
          ]}
          rows={disputes.map((dispute) => [
            dispute.caseNumber,
            dispute.title,
            capitalize(dispute.category),
            dispute.complainantName,
            dispute.village,
            dispute.status,
            format(new Date(dispute.filedAt), "dd MMM yyyy"),
          ])}
        />
      </PageHeader>
      <SearchInput
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search by case number, title, or village..."
        className="max-w-sm"
      />
      {disputes.length === 0 ? (
        <EmptyState title="No disputes found" />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Complainant</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Filed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell className="font-mono text-xs">{dispute.caseNumber}</TableCell>
                  <TableCell className="max-w-xs truncate">{dispute.title}</TableCell>
                  <TableCell className="capitalize">{capitalize(dispute.category)}</TableCell>
                  <TableCell>{dispute.complainantName}</TableCell>
                  <TableCell>{dispute.village}</TableCell>
                  <TableCell><StatusBadge status={dispute.status} /></TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(dispute.filedAt), "dd MMM yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
