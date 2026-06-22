import type { RecordStatus } from "@/types/common.types";
import type { VerificationStatus } from "@/types/common.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<RecordStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  under_review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  archived: "bg-muted text-muted-foreground",
};

const verificationStyles: Record<VerificationStatus, string> = {
  unverified: "bg-muted text-muted-foreground",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  verified: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function StatusBadge({
  status,
  className,
}: {
  status: RecordStatus;
  className?: string;
}) {
  const label = status.replace(/_/g, " ");
  return (
    <Badge
      variant="secondary"
      className={cn("capitalize font-medium", statusStyles[status], className)}
    >
      {label}
    </Badge>
  );
}

export function VerificationBadge({
  status,
  className,
}: {
  status: VerificationStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "capitalize font-medium",
        verificationStyles[status],
        className,
      )}
    >
      {status}
    </Badge>
  );
}
