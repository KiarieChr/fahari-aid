import { ArrowUpRight, ArrowDownLeft, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: "Contribution" | "Loan" | "Expense" | "Fine" | "Repayment" | "Deposit" | "Withdrawal";
  source: "M-Pesa" | "Bank" | "Cash";
  amount: number;
  type: "income" | "expense";
  status: "paid" | "pending" | "overdue" | "active" | "closed";
}

interface CategorizedTransactionTableProps {
  transactions: Transaction[];
}

export function CategorizedTransactionTable({ transactions }: CategorizedTransactionTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/30 hover:bg-secondary/30">
            <TableHead className="w-[100px] font-semibold text-muted-foreground">Date</TableHead>
            <TableHead className="font-semibold text-muted-foreground">Description</TableHead>
            <TableHead className="font-semibold text-muted-foreground">Category</TableHead>
            <TableHead className="font-semibold text-muted-foreground">Source</TableHead>
            <TableHead className="font-semibold text-muted-foreground text-right">Amount</TableHead>
            <TableHead className="font-semibold text-muted-foreground text-center">Status</TableHead>
            <TableHead className="font-semibold text-muted-foreground">Type</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn) => (
            <TableRow key={txn.id} className="group hover:bg-muted/30 transition-colors border-border/40">
              <TableCell className="text-xs text-muted-foreground font-medium">
                {txn.date}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {txn.description}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{txn.id}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-medium bg-secondary/50 text-secondary-foreground border-transparent">
                  {txn.category}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-xs font-medium text-muted-foreground">
                  {txn.source}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className={cn(
                  "font-display text-sm font-bold",
                  txn.type === "income" ? "text-success" : "text-destructive"
                )}>
                  {txn.type === "income" ? "+" : "-"} KSh {txn.amount.toLocaleString()}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <StatusBadge status={txn.status} />
              </TableCell>
              <TableCell>
                <div className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  txn.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {txn.type === "income" ? (
                    <ArrowDownLeft className="h-3 w-3" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3" />
                  )}
                  {txn.type}
                </div>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
