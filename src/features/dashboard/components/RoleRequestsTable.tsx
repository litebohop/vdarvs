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
  useRoleRequests,
  useApproveRoleRequest,
  useRejectRoleRequest,
} from "@/features/dashboard/hooks/useRoleRequests";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput, useTableParams } from "@/components/shared/search-input";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { USER_ROLES } from "@/constants/roles";
import { useAuth } from "@/providers/auth-provider";
import { format } from "date-fns";
import { Check, X } from "lucide-react";

export function RoleRequestsTable() {
  const { search, setSearch, setPage, params } = useTableParams();
  const { data, isLoading, isError, refetch } = useRoleRequests(params);
  const approve = useApproveRoleRequest();
  const reject = useRejectRoleRequest();
  const { user } = useAuth();

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const requests = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role access requests"
        description="Review and approve staff, chief, and district access requests"
      />
      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Search by reason, village, or district..."
        className="max-w-sm"
      />
      {requests.length === 0 ? (
        <EmptyState title="No role requests" />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Requested role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-40" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.userName ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{request.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{USER_ROLES[request.requestedRole].label}</TableCell>
                  <TableCell>
                    {[request.village, request.district].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(request.requestedAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    {request.status === "pending" && user && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={approve.isPending}
                          onClick={() =>
                            approve.mutate({
                              id: request.id,
                              userId: request.userId,
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
                              id: request.id,
                              userId: request.userId,
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
