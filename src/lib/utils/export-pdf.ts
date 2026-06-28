import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { appConfig } from "@/config/app.config";

export interface TablePdfExport {
  title: string;
  headers: string[];
  rows: string[][];
  filename?: string;
}

export function exportTableToPdf({
  title,
  headers,
  rows,
  filename,
}: TablePdfExport): void {
  const doc = new jsPDF({
    orientation: headers.length > 5 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.setFontSize(14);
  doc.text(appConfig.fullName, 14, 16);
  doc.setFontSize(12);
  doc.text(title, 14, 24);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Exported ${format(new Date(), "dd MMM yyyy HH:mm")}`, 14, 30);
  doc.setTextColor(0);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 36,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 64, 175], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const slug = title.toLowerCase().replace(/\s+/g, "-");
  doc.save(filename ?? `${slug}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
