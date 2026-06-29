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
  useAnimals,
  useApproveAnimal,
  useRejectAnimal,
} from "@/features/animals/hooks/useAnimals";
import { ExportPdfButton } from "@/components/shared/export-pdf-button";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput, useTableParams } from "@/components/shared/search-input";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkflowBanner } from "@/components/shared/workflow-banner";
import { useAuth } from "@/providers/auth-provider";
import { format } from "date-fns";

export function AnimalsTable() {
  const { search, setSearch, setPage, params } = useTableParams();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useAnimals(params);
  const approve = useApproveAnimal();
  const reject = useRejectAnimal();
  const canRegister = user?.role === "village_staff";
  const canApprove = user?.role === "village_chief";

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const animals = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Animal Registry"
        description={
          canApprove
            ? "Approve animal registrations submitted by village staff"
            : "Register livestock for citizens. The village chief approves each record."
        }
      >
        <div className="flex gap-2">
          {canRegister && (
            <Button asChild>
              <Link href="/animals/register">
                <Plus className="mr-2 size-4" />
                Register animal
              </Link>
            </Button>
          )}
          <ExportPdfButton
            title="Animal Registry"
            headers={[
              "Tag Number",
              "Species",
              "Breed",
              "Owner",
              "Village",
              "Status",
              "Registered",
            ]}
            rows={animals.map((animal) => [
              animal.tagNumber,
              animal.species,
              animal.breed,
              animal.ownerName,
              animal.village,
              animal.status,
              format(new Date(animal.registeredAt), "dd MMM yyyy"),
            ])}
          />
        </div>
      </PageHeader>

      {canApprove && (
        <WorkflowBanner
          title="Chief approval required"
          message="Staff register animals. You approve or reject each pending registration here."
        />
      )}

      <SearchInput
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Search by tag, owner, or species..."
        className="max-w-sm"
      />
      {animals.length === 0 ? (
        <EmptyState title="No animals registered" />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag Number</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                {canApprove && <TableHead className="w-40" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {animals.map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell className="font-mono text-xs">{animal.tagNumber}</TableCell>
                  <TableCell className="capitalize">{animal.species}</TableCell>
                  <TableCell>{animal.breed}</TableCell>
                  <TableCell>{animal.ownerName}</TableCell>
                  <TableCell>{animal.village}</TableCell>
                  <TableCell>
                    <StatusBadge status={animal.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(animal.registeredAt), "dd MMM yyyy")}
                  </TableCell>
                  {canApprove && (
                    <TableCell>
                      {animal.status === "pending" && user && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={approve.isPending}
                            onClick={() =>
                              approve.mutate({
                                id: animal.id,
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
                                id: animal.id,
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
