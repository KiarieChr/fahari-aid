import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MemberStatus {
  id: string;
  name: string;
  status: "paid" | "late" | "unpaid";
  lastContribution?: string;
}

const statusConfig = {
  paid: { label: "Paid", className: "bg-success/10 text-success border-success/20" },
  late: { label: "Late", className: "bg-warning/10 text-warning border-warning/20" },
  unpaid: { label: "Not Paid", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

interface MemberStatusListProps {
  members: MemberStatus[];
  title?: string;
}

export function MemberStatusList({ members, title = "Member Payment Status" }: MemberStatusListProps) {
  return (
    <Card className="h-full rounded-2xl border-border/60 shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="font-display text-lg">{title}</CardTitle>
        <Badge variant="outline" className="rounded-full font-normal">
          {members.length} Members
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 ring-2 ring-background transition-all group-hover:ring-primary/10">
                  <AvatarFallback className={cn(
                    "text-xs font-bold",
                    member.status === 'paid' ? "bg-success/10 text-success" : 
                    member.status === 'late' ? "bg-warning/10 text-warning" : 
                    "bg-destructive/10 text-destructive"
                  )}>
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {member.name}
                  </p>
                  {member.lastContribution && (
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                      Last: {member.lastContribution}
                    </p>
                  )}
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={cn("rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-wider transition-all", statusConfig[member.status].className)}
              >
                {statusConfig[member.status].label}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
