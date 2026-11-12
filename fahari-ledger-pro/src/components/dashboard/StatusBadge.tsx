import { Badge } from "@/components/ui/badge";

type Status = "paid" | "pending" | "overdue" | "active" | "closed";

const map: Record<Status, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-success/15 text-success border-success/20" },
  pending: { label: "Pending", cls: "bg-warning/20 text-warning-foreground border-warning/30" },
  overdue: { label: "Overdue", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  active: { label: "Active", cls: "bg-primary/10 text-primary border-primary/20" },
  closed: { label: "Closed", cls: "bg-muted text-muted-foreground border-border" },
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, cls } = map[status];
  return (
    <Badge variant="outline" className={`rounded-md border font-medium ${cls}`}>
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}
