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
  useResidencyRequests,
  useVerifyResidency,
  useRejectResidency,
} from "@/features/citizens/hooks/useCitizens";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { VerificationBadge } from "@/components/shared/status-badge";
import { WorkflowBanner } from "@/components/shared/workflow-banner";
import { useAuth } from "@/providers/auth-provider";
import { format } from "date-fns";
import { Check, X } from "lucide-react";

export function ResidencyVerification() {
  const { data, isLoading, isError, refetch } = useResidencyRequests({
    status: "pending",
  });
  const verify = useVerifyResidency();
  const reject = useRejectResidency();
  const { user } = useAuth();
  const canVerify =
    user?.role === "village_chief" || user?.role === "district_officer";

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const requests = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Residency Verification"
        description="Verify new citizens. This is a village chief task, not an administrator task."
      >
        <ExportPdfButton
          title="Residency Verification"
          headers={[
            "Citizen",
            "National ID",
            "Village",
            "District",
            "Status",
            "Requested",
          ]}
          rows={requests.map((req) => [
            req.citizenName,
            req.nationalId,
            req.village,
            req.district,
            req.status,
            format(new Date(req.requestedAt), "dd MMM yyyy"),
          ])}
        />
      </PageHeader>

      {user?.role === "village_chief" && (
        <WorkflowBanner
          title="Your responsibility"
          message="When a citizen completes onboarding or staff registers them, the request appears here. Verify to confirm residency, or reject with a reason in person."
        />
      )}

      {requests.length === 0 ? (
        <EmptyState
          title="No pending verifications"
          description="All residency requests have been processed."
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Citizen</TableHead>
                <TableHead>National ID</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.citizenName}</TableCell>
                  <TableCell className="font-mono text-xs">{req.nationalId}</TableCell>
                  <TableCell>{req.village}</TableCell>
                  <TableCell>{req.district}</TableCell>
                  <TableCell>
                    <VerificationBadge status={req.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(req.requestedAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    {req.status === "pending" && user && canVerify && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          disabled={verify.isPending}
                          onClick={() =>
                            verify.mutate({
                              id: req.id,
                              actor: { userId: user.id, userName: user.fullName },
                            })
                          }
                        >
                          <Check className="mr-1 size-3" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reject.isPending}
                          onClick={() =>
                            reject.mutate({
                              id: req.id,
                              actor: { userId: user.id, userName: user.fullName },
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
