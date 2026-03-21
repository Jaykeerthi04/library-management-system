import { ReactNode } from "react";

interface StatusBadgeProps {
  status: "Available" | "Issued" | "Overdue" | "Returned" | "Paid" | "Unpaid";
}

const statusStyles: Record<string, string> = {
  Available: "bg-success/15 text-success",
  Returned: "bg-success/15 text-success",
  Paid: "bg-success/15 text-success",
  Issued: "bg-info/15 text-info",
  Overdue: "bg-destructive/15 text-destructive",
  Unpaid: "bg-warning/15 text-warning",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${statusStyles[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
