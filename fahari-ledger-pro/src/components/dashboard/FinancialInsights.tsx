import { TrendingUp, Users, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "success" | "warning" | "info";
  message: string;
  subtext?: string;
}

interface FinancialInsightsProps {
  insights: Insight[];
}

export function FinancialInsights({ insights }: FinancialInsightsProps) {
  return (
    <Card className="h-full rounded-2xl border-border/60 shadow-soft overflow-hidden">
      <CardHeader className="bg-secondary/20 pb-4 border-b border-border/40">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Financial Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-5">
          {insights.map((insight) => (
            <div key={insight.id} className="flex gap-4 group">
              <div className={cn(
                "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-110",
                insight.type === "success" && "bg-success/10 text-success",
                insight.type === "warning" && "bg-warning/10 text-warning",
                insight.type === "info" && "bg-primary/10 text-primary"
              )}>
                {insight.type === "success" && <Users className="h-5 w-5" />}
                {insight.type === "warning" && <AlertCircle className="h-5 w-5" />}
                {insight.type === "info" && <Info className="h-5 w-5" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold leading-snug text-foreground">
                  {insight.message}
                </p>
                {insight.subtext && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.subtext}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 rounded-xl bg-gradient-to-br from-primary/5 to-gold/5 p-4 border border-primary/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">Pro Tip</p>
          <p className="text-xs text-foreground/80 italic leading-relaxed">
            "Regularly reviewing your PAR (Portfolio at Risk) can help identify potential issues before they impact your liquidity."
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
