"use client";

import Link from "next/link";
import { useNotifications, useMarkNotificationRead } from "@/features/dashboard/hooks/useDashboard";
import { PageHeader } from "@/components/shared/page-header";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function NotificationsList() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const markAsRead = useMarkNotificationRead();

  if (isLoading) return <PageSkeleton />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  const notifications = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="System alerts and action items"
      />
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={notif.href ?? "#"}
              onClick={() => {
                if (!notif.read) markAsRead.mutate(notif.id);
              }}
              className={cn(
                "block rounded-xl border p-4 transition-colors hover:bg-muted/50",
                !notif.read && "border-primary/20 bg-primary/5",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{notif.title}</p>
                    {!notif.read && (
                      <Badge variant="default" className="text-[10px]">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {notif.message}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notif.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
