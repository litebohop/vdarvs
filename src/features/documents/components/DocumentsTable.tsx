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
import { DocumentRequestDialog } from "@/features/documents/components/DocumentRequestDialog";
import { DocumentAttachmentButton } from "@/features/documents/components/DocumentAttachmentButton";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput, useTableParams } from "@/components/shared/search-input";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/providers/auth-provider";
import { useLinkedCitizen } from "@/features/citizens/hooks/useCitizens";
import { format } from "date-fns";
import { capitalize } from "@/lib/utils/format";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function DocumentsTable() {
  const router = useRouter();
  const { search, setSearch, setPage, params } = useTableParams();
  const { user } = useAuth();
  const { data: linkedCitizen } = useLinkedCitizen();
  const { data, isLoading, isError, refetch } = useDocuments(params);
  const approve = useApproveDocument();
  const reject = useRejectDocument();
  const isCitizen = user?.role === "citizen";
  const canApprove = user?.role === "village_chief";
  const canRequest =
    isCitizen ||
    user?.role === "village_staff" ||
    user?.role === "village_chief" ||
    user?.role === "district_officer" ||
    user?.role === "administrator";

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const documents = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isCitizen ? "My documents" : "Official Documents"}
        description={
          isCitizen
            ? "Your certificates, permits, and village endorsements"
            : "Certificates, permits, and village endorsements"
        }
      >
        <div className="flex flex-wrap gap-2">
          {canRequest && <DocumentRequestDialog />}
          <ExportPdfButton
            title={isCitizen ? "My Documents" : "Official Documents"}
            headers={[
              "Reference",
              "Type",
              "Citizen",
              "Village",
              "Status",
              "Requested",
            ]}
            rows={documents.map((doc) => [
              doc.referenceNumber,
              capitalize(doc.type),
              doc.citizenName,
              doc.village,
              doc.status,
              format(new Date(doc.requestedAt), "dd MMM yyyy"),
            ])}
          />
        </div>
      </PageHeader>

      {isCitizen && !linkedCitizen && (
        <EmptyState
          title="Complete your citizen profile"
          description="Register as a citizen before requesting documents."
          action={{
            label: "Go to onboarding",
            onClick: () => router.push("/onboarding"),
          }}
        />
      )}

      {(!isCitizen || linkedCitizen) && (
        <>
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search by reference, citizen, or type..."
            className="max-w-sm"
          />
          {documents.length === 0 ? (
            <EmptyState
              title="No documents found"
              description={
                canRequest
                  ? "Submit a request to get started."
                  : "No matching records."
              }
            />
          ) : (
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    {!isCitizen && <TableHead>Citizen</TableHead>}
                    <TableHead>Village</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="w-48" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-mono text-xs">
                        {doc.referenceNumber}
                      </TableCell>
                      <TableCell className="capitalize">
                        {capitalize(doc.type)}
                      </TableCell>
                      {!isCitizen && <TableCell>{doc.citizenName}</TableCell>}
                      <TableCell>{doc.village}</TableCell>
                      <TableCell>
                        <StatusBadge status={doc.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(doc.requestedAt), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          <DocumentAttachmentButton document={doc} />
                          {canApprove &&
                            (doc.status === "pending" ||
                              doc.status === "under_review") && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={approve.isPending}
                                  onClick={() =>
                                    approve.mutate({
                                      id: doc.id,
                                      actor: {
                                        userId: user!.id,
                                        userName: user!.fullName,
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
                                        userId: user!.id,
                                        userName: user!.fullName,
                                      },
                                    })
                                  }
                                >
                                  <X className="mr-1 size-3" />
                                  Reject
                                </Button>
                              </>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
