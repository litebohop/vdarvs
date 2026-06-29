"use client";

import Link from "next/link";
import { Plus, Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  useLandRecords,
  useApproveLand,
  useRejectLand,
} from "@/features/land/hooks/useLand";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput, useTableParams } from "@/components/shared/search-input";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkflowBanner } from "@/components/shared/workflow-banner";
import { useAuth } from "@/providers/auth-provider";
import { capitalize } from "@/lib/utils/format";

export function LandTable() {
  const { search, setSearch, setPage, params } = useTableParams();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useLandRecords(params);
  const approve = useApproveLand();
  const reject = useRejectLand();
  const canRegister = user?.role === "village_staff";
  const canApprove = user?.role === "village_chief";

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const records = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Land Records"
        description={
          canApprove
            ? "Approve land registrations submitted by village staff"
            : "Register land parcels for citizens. The village chief approves each record."
        }
      >
        <div className="flex gap-2">
          {canRegister && (
            <Button asChild>
              <Link href="/land/register">
                <Plus className="mr-2 size-4" />
                Register land
              </Link>
            </Button>
          )}
          <ExportPdfButton
            title="Land Records"
            headers={["Parcel", "Owner", "Village", "Type", "Size (ha)", "Status"]}
            rows={records.map((record) => [
              record.parcelNumber,
              record.ownerName,
              record.village,
              capitalize(record.landType),
              String(record.sizeHectares),
              record.status,
            ])}
          />
        </div>
      </PageHeader>

      {canApprove && (
        <WorkflowBanner
          title="Chief approval required"
          message="Staff register land parcels. You approve or reject each pending record here."
        />
      )}

      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
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
                {canApprove && <TableHead className="w-40" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-xs">
                    {record.parcelNumber}
                  </TableCell>
                  <TableCell>{record.ownerName}</TableCell>
                  <TableCell>{record.village}</TableCell>
                  <TableCell className="capitalize">
                    {capitalize(record.landType)}
                  </TableCell>
                  <TableCell>{record.sizeHectares}</TableCell>
                  <TableCell>
                    <StatusBadge status={record.status} />
                  </TableCell>
                  {canApprove && (
                    <TableCell>
                      {record.status === "pending" && user && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={approve.isPending}
                            onClick={() =>
                              approve.mutate({
                                id: record.id,
                                actor: {
                                  userId: user.id,
                                  userName: user.fullName,
                                },
                              })
                            }
                          >
                            <Check className="mr-1 size-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={reject.isPending}
                            onClick={() =>
                              reject.mutate({
                                id: record.id,
                                actor: {
                                  userId: user.id,
                                  userName: user.fullName,
                                },
                              })
                            }
                          >
                            <X className="mr-1 size-3" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
