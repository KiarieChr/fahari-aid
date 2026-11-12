import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Receipt, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/repayments")({
  head: () => ({
    meta: [
      { title: "Repayments — Fahari Ledger" },
      { name: "description", content: "Track loan repayment schedules and arrears." },
    ],
  }),
  component: RepaymentsPage,
});

const schedule = [
  { id: "RP-7781", loan: "LN-1042", member: "Wanjiku Mwangi", due: "2026-05-05", amount: "KSh 24,500", paid: 100, status: "paid" as const },
  { id: "RP-7782", loan: "LN-1040", member: "Samuel Kiprop", due: "2026-04-28", amount: "KSh 38,200", paid: 60, status: "overdue" as const },
  { id: "RP-7783", loan: "LN-1039", member: "Mercy Njeri", due: "2026-05-10", amount: "KSh 64,800", paid: 0, status: "pending" as const },
  { id: "RP-7784", loan: "LN-1038", member: "Brian Otieno", due: "2026-05-02", amount: "KSh 18,500", paid: 100, status: "paid" as const },
  { id: "RP-7785", loan: "LN-1042", member: "Wanjiku Mwangi", due: "2026-06-05", amount: "KSh 24,500", paid: 0, status: "pending" as const },
];

function RepaymentsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <PageHeader title="Repayments" description="Schedules, collections and arrears across the portfolio." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Collected (MTD)" value="KSh 21.6M" change={-2.3} icon={Receipt} accent="success" />
        <KpiCard label="Due this week" value="KSh 4.2M" change={6.1} icon={Clock} accent="primary" />
        <KpiCard label="Overdue" value="KSh 1.8M" change={-4.2} icon={AlertTriangle} accent="destructive" />
        <KpiCard label="On-time rate" value="93.6%" change={1.2} icon={CheckCircle2} accent="gold" />
      </div>

      <Card className="mt-6 rounded-2xl border-border/60 p-5 shadow-soft">
        <h2 className="mb-3 font-display text-lg font-semibold">Upcoming & recent installments</h2>
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead>Ref</TableHead><TableHead>Loan</TableHead><TableHead>Member</TableHead>
                <TableHead>Due date</TableHead><TableHead>Amount</TableHead>
                <TableHead className="w-[180px]">Progress</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((r) => (
                <TableRow key={r.id} className="border-border/60">
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="font-mono text-xs">{r.loan}</TableCell>
                  <TableCell className="text-sm font-medium">{r.member}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.due}</TableCell>
                  <TableCell className="font-display text-sm font-semibold">{r.amount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={r.paid} className="h-2" />
                      <span className="w-9 text-right text-xs text-muted-foreground">{r.paid}%</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
