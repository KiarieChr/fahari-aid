import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Banknote } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Wallet, Receipt, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/loans")({
  head: () => ({
    meta: [
      { title: "Loans — Fahari Ledger" },
      { name: "description", content: "Loan applications, disbursals and portfolio tracking." },
    ],
  }),
  component: LoansPage,
});

const LOANS = [
  { id: "LN-1042", member: "Wanjiku Mwangi", product: "Development", principal: "KSh 250,000", balance: "KSh 142,300", rate: "13%", status: "active" as const },
  { id: "LN-1041", member: "Grace Achieng", product: "Emergency", principal: "KSh 80,000", balance: "KSh 0", rate: "12%", status: "closed" as const },
  { id: "LN-1040", member: "Samuel Kiprop", product: "Asset Finance", principal: "KSh 600,000", balance: "KSh 480,000", rate: "14%", status: "overdue" as const },
  { id: "LN-1039", member: "Mercy Njeri", product: "Business", principal: "KSh 1,200,000", balance: "KSh 980,000", rate: "13.5%", status: "active" as const },
  { id: "LN-1038", member: "Brian Otieno", product: "Education", principal: "KSh 320,000", balance: "KSh 210,000", rate: "11%", status: "active" as const },
  { id: "LN-1037", member: "Faith Wairimu", product: "Development", principal: "KSh 450,000", balance: "KSh 0", rate: "13%", status: "pending" as const },
];

function LoansPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <PageHeader
        title="Loans"
        description="Track applications, disbursals and portfolio health."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-lg bg-primary text-primary-foreground shadow-glow hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> New application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle className="font-display">Loan application</DialogTitle>
                <DialogDescription>
                  Capture loan request. Eligibility is auto-evaluated against guarantor cover.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => { e.preventDefault(); setOpen(false); toast.success("Application submitted to credit committee"); }}
                className="grid gap-4 py-2"
              >
                <div className="grid gap-1.5">
                  <Label>Member</Label>
                  <Select defaultValue="FL-00421">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FL-00421">Wanjiku Mwangi (FL-00421)</SelectItem>
                      <SelectItem value="FL-00422">Brian Otieno (FL-00422)</SelectItem>
                      <SelectItem value="FL-00423">Grace Achieng (FL-00423)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Product</Label>
                    <Select defaultValue="Development">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Development">Development</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Asset Finance">Asset Finance</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Term (months)</Label>
                    <Input type="number" defaultValue={24} min={1} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>Principal (KSh)</Label>
                    <Input type="number" placeholder="250000" required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Interest rate (%)</Label>
                    <Input type="number" step="0.1" defaultValue={13} />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label>Purpose</Label>
                  <Textarea rows={3} placeholder="Brief loan purpose…" />
                </div>
                <DialogFooter className="mt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary text-primary-foreground">Submit application</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Outstanding Portfolio" value="KSh 162.8M" change={8.1} icon={Wallet} accent="primary" />
        <KpiCard label="Disbursed (MTD)" value="KSh 18.4M" change={14.2} icon={Banknote} accent="gold" />
        <KpiCard label="Repayments (MTD)" value="KSh 21.6M" change={-2.3} icon={Receipt} accent="success" />
        <KpiCard label="PAR > 30 days" value="6.4%" change={-0.8} icon={Users} accent="destructive" />
      </div>

      <Card className="mt-6 rounded-2xl border-border/60 p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Loan facilities</h2>
        </div>
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="font-semibold">Loan ID</TableHead>
                <TableHead className="font-semibold">Member</TableHead>
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="font-semibold">Principal</TableHead>
                <TableHead className="font-semibold">Balance</TableHead>
                <TableHead className="font-semibold">Rate</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LOANS.map((l) => (
                <TableRow key={l.id} className="border-border/60">
                  <TableCell className="font-mono text-xs">{l.id}</TableCell>
                  <TableCell className="text-sm font-medium">{l.member}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.product}</TableCell>
                  <TableCell className="font-display text-sm font-semibold">{l.principal}</TableCell>
                  <TableCell className="font-display text-sm">{l.balance}</TableCell>
                  <TableCell className="text-sm">{l.rate}</TableCell>
                  <TableCell><StatusBadge status={l.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
