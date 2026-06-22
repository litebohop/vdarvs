"use client";

import {
  Users,
  UserCheck,
  Scale,
  FileText,
  PawPrint,
  Map,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  useDashboardStats,
  useRecentActivities,
  useChartData,
} from "@/features/dashboard/hooks/useDashboard";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardSkeleton } from "@/components/shared/page-skeleton";
import { ErrorState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/providers/auth-provider";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const statCards = [
  { key: "totalCitizens" as const, label: "Total Citizens", icon: Users, href: "/citizens" },
  { key: "pendingVerifications" as const, label: "Pending Verifications", icon: UserCheck, href: "/residency" },
  { key: "activeDisputes" as const, label: "Active Disputes", icon: Scale, href: "/disputes" },
  { key: "documentsIssued" as const, label: "Documents Issued", icon: FileText, href: "/documents" },
  { key: "registeredAnimals" as const, label: "Registered Animals", icon: PawPrint, href: "/animals" },
  { key: "landParcels" as const, label: "Land Parcels", icon: Map, href: "/land" },
];

const chartConfig = {
  citizens: { label: "Citizens", color: "hsl(var(--chart-1))" },
  documents: { label: "Documents", color: "hsl(var(--chart-2))" },
  disputes: { label: "Disputes", color: "hsl(var(--chart-3))" },
};

export function DashboardView() {
  const { user } = useAuth();
  const stats = useDashboardStats();
  const activities = useRecentActivities();
  const chart = useChartData();

  const isLoading = stats.isLoading || activities.isLoading || chart.isLoading;
  const isError = stats.isError || activities.isError || chart.isError;

  if (isLoading) return <DashboardSkeleton />;
  if (isError) {
    return (
      <ErrorState
        onRetry={() => {
          stats.refetch();
          activities.refetch();
          chart.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(" ")[0]}`}
        description="Village administration overview for Lesotho local government"
      >
        <Button asChild>
          <Link href="/citizens/register">Register Citizen</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map(({ key, label, icon: Icon, href }) => (
          <Link key={key} href={href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.data?.[key] ?? 0}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>
              Citizens, documents, and disputes over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <BarChart data={chart.data ?? []}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="citizens" fill="var(--color-citizens)" radius={4} />
                <Bar dataKey="documents" fill="var(--color-documents)" radius={4} />
                <Bar dataKey="disputes" fill="var(--color-disputes)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest administrative actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.data?.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {activity.status && (
                      <StatusBadge status={activity.status} />
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
