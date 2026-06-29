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
  useDisputes,
  useResolveDispute,
} from "@/features/disputes/hooks/useDisputes";
import { useAuth } from "@/providers/auth-provider";
import { useLinkedCitizen, useChief } from "@/features/citizens/hooks/useCitizens";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput, useTableParams } from "@/components/shared/search-input";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkflowBanner } from "@/components/shared/workflow-banner";
import { format } from "date-fns";
import { capitalize } from "@/lib/utils/format";

export function DisputesTable() {
  const { search, setSearch, setPage, params } = useTableParams();
  const { user } = useAuth();
  const { data: linkedCitizen } = useLinkedCitizen();
  const { data: chief } = useChief(linkedCitizen?.chiefId);
  const { data, isLoading, isError, refetch } = useDisputes(params);
  const resolveDispute = useResolveDispute();
  const isCitizen = user?.role === "citizen";
  const canApprove = user?.role === "village_chief";
  const canFile =
    isCitizen && linkedCitizen
      ? true
      : user?.role === "village_staff" ||
        user?.role === "village_chief" ||
        user?.role === "district_officer" ||
        user?.role === "administrator";

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const disputes = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isCitizen ? "My disputes" : "Dispute Resolution"}
        description={
          isCitizen
            ? "Cases you filed for chief mediation"
            : canApprove
              ? "Resolve or dismiss disputes in your village"
              : "View dispute cases. Only the village chief can resolve them."
        }
      >
        <div className="flex gap-2">
          {canFile && (
            <Button asChild>
              <Link href="/disputes/file">
                <Plus className="mr-2 size-4" />
                File dispute
              </Link>
            </Button>
          )}
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
        </div>
      </PageHeader>

      {isCitizen && linkedCitizen && chief && (
        <WorkflowBanner
          title="Who handles your dispute?"
          message={`${chief.name}, your village chief, mediates disputes in ${chief.village}. You will be notified when the case is resolved.`}
        />
      )}

      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
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
                {canApprove && <TableHead className="w-48" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell className="font-mono text-xs">
                    {dispute.caseNumber}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{dispute.title}</TableCell>
                  <TableCell className="capitalize">
                    {capitalize(dispute.category)}
                  </TableCell>
                  <TableCell>{dispute.complainantName}</TableCell>
                  <TableCell>{dispute.village}</TableCell>
                  <TableCell>
                    <StatusBadge status={dispute.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(dispute.filedAt), "dd MMM yyyy")}
                  </TableCell>
                  {canApprove && (
                    <TableCell>
                      {(dispute.status === "pending" ||
                        dispute.status === "under_review") && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={resolveDispute.isPending}
                            onClick={() =>
                              resolveDispute.mutate({
                                id: dispute.id,
                                status: "approved",
                                actor: {
                                  userId: user!.id,
                                  userName: user!.fullName,
                                },
                              })
                            }
                          >
                            <Check className="mr-1 size-3" />
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={resolveDispute.isPending}
                            onClick={() =>
                              resolveDispute.mutate({
                                id: dispute.id,
                                status: "rejected",
                                actor: {
                                  userId: user!.id,
                                  userName: user!.fullName,
                                },
                              })
                            }
                          >
                            <X className="mr-1 size-3" />
                            Dismiss
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
