"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLandRecords } from "@/features/land/hooks/useLand";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput, useTableParams } from "@/components/shared/search-input";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { capitalize } from "@/lib/utils/format";

export function LandTable() {
  const { search, setSearch, setPage, params } = useTableParams();
  const { data, isLoading, isError, refetch } = useLandRecords(params);

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const records = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Land Records"
        description="Village land parcels and ownership records"
      />
      <SearchInput
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search by parcel, owner, or village..."
        className="max-w-sm"
      />
      {records.length === 0 ? (
        <EmptyState title="No land records found" />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcel</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size (ha)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-xs">{record.parcelNumber}</TableCell>
                  <TableCell>{record.ownerName}</TableCell>
                  <TableCell>{record.village}</TableCell>
                  <TableCell className="capitalize">{capitalize(record.landType)}</TableCell>
                  <TableCell>{record.sizeHectares}</TableCell>
                  <TableCell><StatusBadge status={record.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
