"use client";

import { Button } from "@/components/ui/button";
import { exportTableToPdf, type TablePdfExport } from "@/lib/utils/export-pdf";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

interface ExportPdfButtonProps extends TablePdfExport {
  disabled?: boolean;
}

export function ExportPdfButton({ disabled, ...exportData }: ExportPdfButtonProps) {
  const handleExport = () => {
    if (exportData.rows.length === 0) {
      toast.error("No data to export");
      return;
    }

    try {
      exportTableToPdf(exportData);
      toast.success("PDF exported");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || exportData.rows.length === 0}
      onClick={handleExport}
    >
      <FileDown className="mr-2 size-4" />
      Export PDF
    </Button>
  );
}
