import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileBarChart2,
  FileSpreadsheet,
  FileText,
  Download,
  ScrollText,
  ShieldCheck,
  Building,
  Sparkles,
} from "lucide-react";
import { DocumentStudioView } from "@/components/documents/DocumentStudioView";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Document Studio — Fahari Ledger" },
      { name: "description", content: "Statutory, financial and uniform document reporting for the institution." },
    ],
  }),
  component: ReportsPage,
});

const reports = [
  { icon: FileBarChart2, name: "Loan Portfolio Report", desc: "Outstanding balances, PAR aging and concentration.", tag: "Operational" },
  { icon: FileSpreadsheet, name: "Trial Balance", desc: "All GL accounts with debit and credit positions.", tag: "Financial" },
  { icon: FileText, name: "Profit & Loss", desc: "Income and expenses for the selected period.", tag: "Financial" },
  { icon: ScrollText, name: "Balance Sheet", desc: "Statement of financial position at period end.", tag: "Financial" },
  { icon: ShieldCheck, name: "SASRA Returns", desc: "Quarterly statutory return for licensed SACCOs.", tag: "Statutory" },
  { icon: FileBarChart2, name: "Member Statements", desc: "Per-member savings and loan account statements.", tag: "Operational" },
];

function ReportsPage() {
  const [activeTab, setActiveTab] = useState<string>("catalog");

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Reports & Document Center"
          description="Generate financial and statutory reports, and inspect uniform institutional PDF documents in portrait and landscape."
        />

        <div className="shrink-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="h-10 rounded-xl bg-secondary/50 p-1 border border-border/60">
              <TabsTrigger value="catalog" className="rounded-lg text-xs font-bold gap-1.5 px-3">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Financial Reports
              </TabsTrigger>
              <TabsTrigger value="studio" className="rounded-lg text-xs font-bold gap-1.5 px-3">
                <Building className="h-3.5 w-3.5 text-primary" />
                Document Studio & Header
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {activeTab === "catalog" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => (
            <Card key={r.name} className="group rounded-2xl border-border/60 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <r.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-foreground">
                    {r.tag}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">{r.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                <div className="mt-5 flex gap-2">
                  <Button size="sm" className="rounded-lg bg-primary text-primary-foreground">
                    <Download className="mr-2 h-3.5 w-3.5" /> Generate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("studio")}
                    className="rounded-lg"
                  >
                    Open Studio
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DocumentStudioView />
      )}
    </div>
  );
}
