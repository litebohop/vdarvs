"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useCitizens } from "@/features/citizens/hooks/useCitizens";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput, useTableParams } from "@/components/shared/search-input";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { VerificationBadge } from "@/components/shared/status-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { format } from "date-fns";
import { Eye, Plus } from "lucide-react";

export function CitizensTable() {
  const { search, setSearch, page, setPage, params } = useTableParams();
  const { data, isLoading, isError, refetch } = useCitizens(params);

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const citizens = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Citizens"
        description="Registered citizens across Lesotho villages"
      >
        <Button asChild>
          <Link href="/citizens/register">
            <Plus className="mr-2 size-4" />
            Register Citizen
          </Link>
        </Button>
      </PageHeader>

      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Search by name, national ID, or village..."
        className="max-w-sm"
      />

      {citizens.length === 0 ? (
        <EmptyState
          title="No citizens found"
          description="Try adjusting your search or register a new citizen."
          action={{
            label: "Register Citizen",
            onClick: () => (window.location.href = "/citizens/register"),
          }}
        />
      ) : (
        <>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>National ID</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizens.map((citizen) => (
                  <TableRow key={citizen.id}>
                    <TableCell className="font-medium">
                      {citizen.firstName} {citizen.lastName}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {citizen.nationalId}
                    </TableCell>
                    <TableCell>{citizen.address.village}</TableCell>
                    <TableCell>{citizen.address.district}</TableCell>
                    <TableCell>
                      <VerificationBadge status={citizen.verificationStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={citizen.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(citizen.registeredAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/citizens/${citizen.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {(page - 1) * data.pageSize + 1} to{" "}
                {Math.min(page * data.pageSize, data.total)} of {data.total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
