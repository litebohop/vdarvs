"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useDashboardStats,
  useChartData,
} from "@/features/dashboard/hooks/useDashboard";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { ErrorState } from "@/components/shared/empty-state";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  citizens: { label: "Citizens", color: "var(--chart-1)" },
  documents: { label: "Documents", color: "var(--chart-2)" },
  disputes: { label: "Disputes", color: "var(--chart-3)" },
};

export function ReportsView() {
  const stats = useDashboardStats();
  const chart = useChartData();

  if (stats.isLoading || chart.isLoading) return <PageSkeleton />;
  if (stats.isError || chart.isError) {
    return <ErrorState onRetry={() => { stats.refetch(); chart.refetch(); }} />;
  }

  const reportItems = [
    { label: "Total Citizens", value: stats.data?.totalCitizens },
    { label: "Documents Issued", value: stats.data?.documentsIssued },
    { label: "Land Parcels", value: stats.data?.landParcels },
    { label: "Registered Animals", value: stats.data?.registeredAnimals },
    { label: "Active Disputes", value: stats.data?.activeDisputes },
    { label: "Pending Approvals", value: stats.data?.pendingApprovals },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="District and village administrative statistics"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportItems.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80 w-full">
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
    </div>
  );
}
