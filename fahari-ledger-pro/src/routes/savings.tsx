import { createFileRoute } from "@tanstack/react-router";
import { PiggyBank, TrendingUp, Coins, Users } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/savings")({
  head: () => ({
    meta: [
      { title: "Savings & Shares — Fahari Ledger" },
      { name: "description", content: "Member deposits, share capital and savings products." },
    ],
  }),
  component: SavingsPage,
});

const trend = Array.from({ length: 12 }).map((_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  bosa: 4000 + i * 420 + (i % 3) * 200,
  fosa: 2200 + i * 280,
}));

const accounts = [
  { id: "SA-9001", member: "Wanjiku Mwangi", product: "BOSA", balance: "KSh 124,500", rate: "7%", status: "active" as const },
  { id: "SA-9002", member: "Brian Otieno", product: "FOSA", balance: "KSh 64,500", rate: "5.5%", status: "active" as const },
  { id: "SA-9003", member: "Grace Achieng", product: "Holiday", balance: "KSh 210,000", rate: "6%", status: "active" as const },
  { id: "SA-9004", member: "Mercy Njeri", product: "BOSA", balance: "KSh 88,000", rate: "7%", status: "active" as const },
  { id: "SA-9005", member: "David Mutua", product: "FOSA", balance: "KSh 12,000", rate: "5.5%", status: "pending" as const },
];

function SavingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <PageHeader title="Savings & Shares" description="Deposits, share capital and product performance." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Deposits" value="KSh 84.2M" change={12.4} icon={PiggyBank} accent="primary" />
        <KpiCard label="Share Capital" value="KSh 31.6M" change={6.2} icon={Coins} accent="gold" />
        <KpiCard label="Avg. Monthly Growth" value="3.8%" change={0.4} icon={TrendingUp} accent="success" />
        <KpiCard label="Active Savers" value="2,948" change={5.1} icon={Users} accent="primary" />
      </div>

      <Card className="mt-6 rounded-2xl border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="font-display text-lg">Savings trend by product</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trend} margin={{ left: -10, right: 8 }}>
              <defs>
                <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.42 0.20 265)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.42 0.20 265)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.14 80)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="oklch(0.78 0.14 80)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 260)" vertical={false} />
              <XAxis dataKey="m" stroke="oklch(0.5 0.03 260)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.5 0.03 260)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.92 0.01 260)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="bosa" name="BOSA" stroke="oklch(0.42 0.20 265)" strokeWidth={2.5} fill="url(#b)" />
              <Area type="monotone" dataKey="fosa" name="FOSA" stroke="oklch(0.78 0.14 80)" strokeWidth={2.5} fill="url(#f)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-2xl border-border/60 p-5 shadow-soft">
        <h2 className="mb-3 font-display text-lg font-semibold">Savings accounts</h2>
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead>Account</TableHead><TableHead>Member</TableHead><TableHead>Product</TableHead>
                <TableHead>Balance</TableHead><TableHead>Rate</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((a) => (
                <TableRow key={a.id} className="border-border/60">
                  <TableCell className="font-mono text-xs">{a.id}</TableCell>
                  <TableCell className="text-sm font-medium">{a.member}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.product}</TableCell>
                  <TableCell className="font-display text-sm font-semibold">{a.balance}</TableCell>
                  <TableCell className="text-sm">{a.rate}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
