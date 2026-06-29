"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface WorkflowBannerProps {
  title: string;
  message: string;
}

export function WorkflowBanner({ title, message }: WorkflowBannerProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex gap-3 pt-6">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="space-y-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
