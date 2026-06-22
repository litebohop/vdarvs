"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCitizen } from "@/features/citizens/hooks/useCitizens";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { ErrorState } from "@/components/shared/empty-state";
import { VerificationBadge, StatusBadge } from "@/components/shared/status-badge";
import { format } from "date-fns";

export function CitizenProfile() {
  const params = useParams();
  const id = params.id as string;
  const { data: citizen, isLoading, isError, refetch } = useCitizen(id);

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!citizen) {
    return (
      <ErrorState
        title="Citizen not found"
        description="The requested citizen record does not exist."
      />
    );
  }

  const addressParts = [
    citizen.address.village,
    citizen.address.communityCouncil,
    citizen.address.district,
    citizen.address.poBox,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/citizens">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {citizen.firstName} {citizen.lastName}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            {citizen.nationalId}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <VerificationBadge status={citizen.verificationStatus} />
          <StatusBadge status={citizen.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date of Birth</span>
              <span>{format(new Date(citizen.dateOfBirth), "dd MMMM yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gender</span>
              <span className="capitalize">{citizen.gender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{citizen.phone}</span>
            </div>
            {citizen.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{citizen.email}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Village Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {addressParts.map((part, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-muted-foreground">
                  {i === 0
                    ? "Village"
                    : i === 1 && citizen.address.communityCouncil
                      ? "Community Council"
                      : i === addressParts.length - 1 && citizen.address.poBox
                        ? "P.O. Box"
                        : "District"}
                </span>
                <span>{part}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
