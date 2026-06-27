"use client";

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
  useDocuments,
  useApproveDocument,
  useRejectDocument,
} from "@/features/documents/hooks/useDocuments";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput, useTableParams } from "@/components/shared/search-input";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/providers/auth-provider";
import { format } from "date-fns";
import { capitalize } from "@/lib/utils/format";
import { Check, X } from "lucide-react";

export function DocumentsTable() {
  const { search, setSearch, setPage, params } = useTableParams();
  const { data, isLoading, isError, refetch } = useDocuments(params);
  const approve = useApproveDocument();
  const reject = useRejectDocument();
  const { user } = useAuth();

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const documents = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Documents"
        description="Certificates, permits, and village endorsements"
      />
      <SearchInput
        value={search}
        onChange={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search by reference, citizen, or type..."
        className="max-w-sm"
      />
      {documents.length === 0 ? (
        <EmptyState title="No documents found" />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Citizen</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-mono text-xs">{doc.referenceNumber}</TableCell>
                  <TableCell className="capitalize">{capitalize(doc.type)}</TableCell>
                  <TableCell>{doc.citizenName}</TableCell>
                  <TableCell>{doc.village}</TableCell>
                  <TableCell><StatusBadge status={doc.status} /></TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(doc.requestedAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    {(doc.status === "pending" || doc.status === "under_review") &&
                      user?.role === "village_chief" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={approve.isPending}
                            onClick={() =>
                              approve.mutate({
                                id: doc.id,
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
                                id: doc.id,
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
