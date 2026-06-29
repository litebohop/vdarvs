"use client";

import Link from "next/link";
import { Bell, Clock, FileText, Scale, UserCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardSkeleton } from "@/components/shared/page-skeleton";
import { ErrorState } from "@/components/shared/empty-state";
import { StatusBadge, VerificationBadge } from "@/components/shared/status-badge";
import { WorkflowGuide } from "@/components/shared/workflow-guide";
import { WorkflowBanner } from "@/components/shared/workflow-banner";
import { useAuth } from "@/providers/auth-provider";
import { useCitizenDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useChief } from "@/features/citizens/hooks/useCitizens";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { capitalize } from "@/lib/utils/format";

export function CitizenDashboardView() {
  const { user } = useAuth();
  const summary = useCitizenDashboard();
  const citizen = summary.data?.citizen;
  const { data: chief } = useChief(citizen?.chiefId);

  if (summary.isLoading) return <DashboardSkeleton />;
  if (summary.isError) {
    return <ErrorState onRetry={() => summary.refetch()} />;
  }

  const data = summary.data;

  const statCards = [
    {
      label: citizen ? "Residency Status" : "Citizen Registration",
      value: citizen
        ? capitalize(citizen.verificationStatus)
        : "Not registered",
      icon: UserCheck,
      href: citizen ? undefined : "/onboarding",
      badge: citizen?.verificationStatus,
    },
    {
      label: "Pending Documents",
      value: String(data?.pendingDocuments ?? 0),
      icon: FileText,
      href: "/documents",
    },
    {
      label: "Approved Documents",
      value: String(data?.approvedDocuments ?? 0),
      icon: FileText,
      href: "/documents",
    },
    {
      label: "Active Disputes",
      value: String(data?.activeDisputes ?? 0),
      icon: Scale,
      href: "/disputes",
    },
    {
      label: "Unread Notifications",
      value: String(data?.unreadNotifications ?? 0),
      icon: Bell,
      href: "/notifications",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(" ")[0]}`}
        description="Your personal records, documents, and village services"
      >
        {!citizen && (
          <Button asChild>
            <Link href="/onboarding">Complete registration</Link>
          </Button>
        )}
      </PageHeader>

      {!citizen && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Complete your citizen profile</CardTitle>
            <CardDescription>
              Register as a citizen first. Your village chief will verify your
              residency before you can use documents and disputes fully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/onboarding">Go to onboarding</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {citizen && citizen.verificationStatus === "pending" && (
        <WorkflowBanner
          title="Waiting for residency verification"
          message={`Your application is with ${chief?.name ?? "your village chief"}. After verification you can receive approved documents and use village services.`}
        />
      )}

      {citizen && citizen.verificationStatus !== "pending" && chief && (
        <WorkflowBanner
          title="Your village chief"
          message={`${chief.name} (${chief.village}) approves your document requests and mediates your disputes.`}
        />
      )}

      <WorkflowGuide role="citizen" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, href, badge }) => {
          const content = (
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {badge ? (
                  <VerificationBadge status={badge} />
                ) : (
                  <div className="text-3xl font-bold">{value}</div>
                )}
              </CardContent>
            </Card>
          );

          return href ? (
            <Link key={label} href={href}>
              {content}
            </Link>
          ) : (
            <div key={label}>{content}</div>
          );
        })}
      </div>

      {citizen && (
        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>
              {citizen.firstName} {citizen.lastName} · {citizen.address.village},{" "}
              {citizen.address.district}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>National ID: {citizen.nationalId}</p>
            <p>Phone: {citizen.phone}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your documents</CardTitle>
            <CardDescription>Recent document requests and certificates</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentDocuments.length ? (
              <div className="space-y-4">
                {data.recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start justify-between gap-4 rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.referenceNumber}
                      </p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No documents yet. Visit the documents page to view available
                records.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Updates about your requests and records</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.recentNotifications.length ? (
              <div className="space-y-4">
                {data.recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start justify-between gap-4 rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No notifications yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
