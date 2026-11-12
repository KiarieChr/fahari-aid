import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";

export const Route = createFileRoute("/accounting")({
  head: () => ({
    meta: [
      { title: "General Ledger — J.E.N Church ERP" },
      { name: "description", content: "Church general ledger, chart of accounts, and journal entries." },
    ],
  }),
  component: AccountingPage,
});

const ledger = [
  { date: "2026-04-29", ref: "JE-3201", account: "1010 · Bank Account - Main", debit: "1,250,000", credit: "—", desc: "Sunday tithes & offerings batch" },
  { date: "2026-04-29", ref: "JE-3201", account: "4000 · Tithes Revenue", debit: "—", credit: "1,250,000", desc: "Sunday tithes & offerings batch" },
  { date: "2026-04-29", ref: "JE-3202", account: "1100 · Pledges Receivable", debit: "600,000", credit: "—", desc: "Kingdom Alignment Pledge Batch" },
  { date: "2026-04-29", ref: "JE-3202", account: "4030 · Pledges Revenue", debit: "—", credit: "600,000", desc: "Kingdom Alignment Pledge Batch" },
  { date: "2026-04-28", ref: "JE-3199", account: "5010 · Rent & Utilities", debit: "84,300", credit: "—", desc: "Facility electricity payment" },
  { date: "2026-04-28", ref: "JE-3199", account: "1010 · Bank Account - Main", debit: "—", credit: "84,300", desc: "Facility electricity payment" },
];

const trial = [
  { code: "1010", name: "Bank Account - Main", debit: "12,840,200", credit: "—" },
  { code: "1100", name: "Pledges Receivable", debit: "3,800,000", credit: "—" },
  { code: "3000", name: "General Fund Balance", debit: "—", credit: "8,420,000" },
  { code: "3010", name: "Building Fund Balance", debit: "—", credit: "4,600,000" },
  { code: "4000", name: "Tithes Revenue", debit: "—", credit: "4,210,000" },
  { code: "4010", name: "Sunday Offerings", debit: "—", credit: "1,842,000" },
];

function AccountingPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <PageHeader
        title="General Ledger & Accounting"
        description="Double-entry general ledger, journal entries, and fund accounts directly linked to Django Account and JournalEntry models."
        actions={
          <>
            <Button variant="outline" className="rounded-lg"><Download className="mr-2 h-4 w-4" /> Export</Button>
            <Button className="rounded-lg bg-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Journal entry</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-2xl border-border/60 shadow-soft">
          <CardHeader><CardTitle className="font-display text-lg">Recent journal entries</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead>Date</TableHead><TableHead>Ref</TableHead><TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((l, i) => (
                    <TableRow key={i} className="border-border/60">
                      <TableCell className="text-xs text-muted-foreground">{l.date}</TableCell>
                      <TableCell className="font-mono text-xs">{l.ref}</TableCell>
                      <TableCell className="text-sm">{l.account}<div className="text-xs text-muted-foreground">{l.desc}</div></TableCell>
                      <TableCell className="text-right font-display text-sm">{l.debit}</TableCell>
                      <TableCell className="text-right font-display text-sm">{l.credit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-soft">
          <CardHeader><CardTitle className="font-display text-lg">Trial Balance</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Dr</TableHead>
                    <TableHead className="text-right">Cr</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trial.map((t) => (
                    <TableRow key={t.code} className="border-border/60">
                      <TableCell className="text-sm"><span className="font-mono text-xs text-muted-foreground">{t.code}</span> {t.name}</TableCell>
                      <TableCell className="text-right font-display text-xs">{t.debit}</TableCell>
                      <TableCell className="text-right font-display text-xs">{t.credit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
