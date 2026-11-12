import { createFileRoute, useRouterState, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  UserPlus,
  GitBranch,
  TrendingUp,
  Activity,
  Search,
  Phone,
  Mail,
  Calendar,
  Download,
  AlertTriangle,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Building2,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Plus,
  Loader2,
  MoreVertical,
  Check,
  LayoutDashboard,
  List,
  Shield,
  Send,
  MessageSquare,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell as RechartsCell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { downloadPdf } from "@/api/pdf";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiCall, ApiError } from "@/api/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assimilation")({
  head: () => ({
    meta: [
      { title: "Member Assimilation & Pastoral Oversight — J.E.N Church ERP" },
      {
        name: "description",
        content: "Track first-time visitors, monitor 48h SLA breach alerts, log pastoral contact, and senior management oversight.",
      },
    ],
  }),
  component: AssimilationPage,
});

// ============================================================================
// TypeScript Interfaces (Strictly mirrors Django API Payloads)
// ============================================================================

export interface AssimilationKpis {
  total_new_members: number;
  pct_change: number;
  completion_rate: number;
  uncontacted: number;
  stick_rate: number;
  sla_breached: number;
}

export interface TrendItem {
  day: string;
  count: number;
}

export interface DecisionTypeItem {
  decision_type: string;
  label: string;
  count: number;
  pct: number;
}

export interface StatusDistributionItem {
  status: string;
  label: string;
  count: number;
  pct: number;
}

export interface AssimilationMemberRow {
  id: number;
  member_id: number;
  full_name: string;
  email: string;
  phone_no: string;
  decision_type: string;
  assimilation_status: "uncontacted" | "attempted" | "contacted" | "cell_assigned";
  created_at: string;
  created_at_formatted: string;
  time_ago: string;
  sla_breached: boolean;
  assigned_to_name: string | null;
  assigned_role: string | null;
  followup_count: number;
}

export interface TeamPerformanceItem {
  user_id: number;
  staff_name: string;
  assigned: number;
  contacted: number;
  uncontacted: number;
  avg_response_hours: number;
  sla_breached: number;
}

export interface AgingBuckets {
  h0_24: number;
  h24_48: number;
  h48_72: number;
  h72_plus: number;
}

export interface AssimilationFunnel {
  total: number;
  first_contact: number;
  first_contact_pct: number;
  second_contact: number;
  second_contact_pct: number;
  cell_assigned: number;
  cell_assigned_pct: number;
}

export interface PastoralAlertItem {
  id: number;
  member_id: number;
  member_name: string;
  severity: "Red" | "Amber" | "Green";
  stalled_days: string;
  source_module: string;
  status: "pending" | "actioned";
  assigned_to: string | null;
  created_at: string;
  action_label: string;
  action_url: string;
}

export interface AuditLogItem {
  id: number;
  member_name: string;
  actor_name: string;
  contact_type: string;
  notes: string;
  created_at_formatted: string;
  resulting_status: string;
}

export interface AssimilationPayload {
  kpis: AssimilationKpis;
  trend: TrendItem[];
  decision_types: DecisionTypeItem[];
  status_distribution: StatusDistributionItem[];
  members: {
    results: AssimilationMemberRow[];
    total: number;
    page: number;
  };
  oversight: {
    team_performance: TeamPerformanceItem[];
    aging_buckets: AgingBuckets;
    funnel: AssimilationFunnel;
    pastoral_alerts: PastoralAlertItem[];
    audit_log: AuditLogItem[];
  };
}

const DECISION_PALETTE: Record<string, string> = {
  raised_hand: "#3b82f6",
  connection_card: "#10b981",
  personal_invite: "#f59e0b",
  online_form: "#8b5cf6",
  salvation_decision: "#ec4899",
  other: "#64748b",
};

const OUTCOME_TAGS = [
  "Interested in Cell",
  "Requested Prayer",
  "Ready for Discipleship",
  "Relocating Soon",
  "Wrong Number",
  "Call Back Later",
  "Warm & Welcoming",
];

const NEXT_STEPS = [
  "Assign to Cell Fellowship",
  "Schedule Pastor Visit",
  "Invite to Foundation Class",
  "Send Welcome SMS",
];

function AssimilationPage() {
  const routerLocation = useRouterState({ select: (s) => s.location });
  const navigate = useNavigate();

  // Search parameters derived from URL (individual direct sidebar links)
  const searchParams = useMemo(() => {
    return (routerLocation.search || {}) as Record<string, string | undefined>;
  }, [routerLocation.search]);

  // View state: 'overview' | 'list' | 'oversight'
  const activeView =
    searchParams.view === "oversight" || searchParams.view === "alerts"
      ? "oversight"
      : searchParams.view === "list"
      ? "list"
      : "overview";

  // Date Range state
  const [startDate, setStartDate] = useState<string>(searchParams.start_date || "");
  const [endDate, setEndDate] = useState<string>(searchParams.end_date || "");
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.status || "all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Payload State
  const [data, setData] = useState<AssimilationPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  const handleDownloadAssimilationPdf = async () => {
    try {
      setDownloadingPdf(true);
      await downloadPdf('/assimilation/reports/pdf/', 'assimilation_followup_report.pdf');
      toast.success("Assimilation PDF report downloaded successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to download assimilation report");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Log Follow-up Modal State
  const [logModalRow, setLogModalRow] = useState<AssimilationMemberRow | null>(null);
  const [logContactType, setLogContactType] = useState<string>("phone_call");
  const [logReached, setLogReached] = useState<boolean>(true);
  const [selectedOutcomeTags, setSelectedOutcomeTags] = useState<string[]>([]);
  const [selectedNextSteps, setSelectedNextSteps] = useState<string[]>([]);
  const [logNotes, setLogNotes] = useState<string>("");
  const [isSubmittingLog, setIsSubmittingLog] = useState<boolean>(false);

  // Assign Modal State
  const [assignModalRow, setAssignModalRow] = useState<AssimilationMemberRow | null>(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>("");
  const [isSubmittingAssign, setIsSubmittingAssign] = useState<boolean>(false);

  // Pastoral Triage Modal State (for Senior Oversight tab)
  const [triagingAlert, setTriagingAlert] = useState<PastoralAlertItem | null>(null);
  const [triageActionType, setTriageActionType] = useState<string>("assign_followup");
  const [triageAssignee, setTriageAssignee] = useState<string>("Pastoral Team");
  const [triageNotes, setTriageNotes] = useState<string>("");
  const [isSubmittingTriage, setIsSubmittingTriage] = useState<boolean>(false);

  // Fetch assimilation data from Django database
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("page", String(page));

      const res = await apiCall<AssimilationPayload>(`/analytics/assimilation/?${params.toString()}`);
      if (res) {
        setData(res);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load assimilation data.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, statusFilter, searchQuery, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Log Follow-up submit
  const handleLogFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logModalRow) return;
    setIsSubmittingLog(true);
    try {
      await apiCall("/analytics/assimilation/followup/", {
        method: "POST",
        body: {
          assimilation_id: logModalRow.id,
          contact_type: logContactType,
          reached: logReached ? 1 : 0,
          outcome_tags: selectedOutcomeTags,
          next_steps: selectedNextSteps,
          notes: logNotes.trim(),
        },
      });
      toast.success("Follow-up action logged successfully!");
      setLogModalRow(null);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to persist follow-up log.";
      toast.error(msg);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Assign submit
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalRow || !selectedCaregiver) return;
    setIsSubmittingAssign(true);
    try {
      await apiCall("/analytics/assimilation/assign/", {
        method: "POST",
        body: {
          assimilation_id: assignModalRow.id,
          assigned_to: selectedCaregiver,
        },
      });
      toast.success("Caregiver assignment updated successfully!");
      setAssignModalRow(null);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update assignment.";
      toast.error(msg);
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Pastoral Triage Alert submit
  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triagingAlert) return;
    setIsSubmittingTriage(true);
    try {
      await apiCall("/analytics/pastoral-action/", {
        method: "POST",
        body: {
          alert_id: triagingAlert.id,
          target_name: triagingAlert.member_name,
          action_type: triageActionType,
          assignee: triageAssignee,
          notes: triageNotes.trim(),
        },
      });
      toast.success(`Pastoral intervention for '${triagingAlert.member_name}' dispatched to ${triageAssignee}.`);
      setTriagingAlert(null);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record pastoral intervention.";
      toast.error(msg);
    } finally {
      setIsSubmittingTriage(false);
    }
  };

  // CSV Export
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);
      if (statusFilter !== "all") params.set("status", statusFilter);

      window.open(`/api/analytics/assimilation/export/?${params.toString()}`, "_blank");
    } catch (_err) {
      toast.error("CSV Export unavailable.");
    }
  };

  const handleTabChange = (view: "overview" | "list" | "oversight") => {
    navigate({
      to: "/assimilation",
      search: {
        view,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      },
    });
  };

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-[1600px] animate-in fade-in duration-300 pb-16 space-y-6">
        {/* ===================================================================== */}
        {/* PAGE HEADER                                                           */}
        {/* ===================================================================== */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <PageHeader
            title={
              activeView === "oversight"
                ? "Senior Management Oversight & Pastoral Alerts"
                : activeView === "list"
                ? "New Members Assimilation Roster"
                : "Member Assimilation & Follow-Up"
            }
            description={
              activeView === "oversight"
                ? "Pastoral alert triage, caregiver team performance, SLA breach compliance, and full audit log."
                : activeView === "list"
                ? "Review newly joined congregants, assign cell leaders, and log pastoral touchpoints."
                : "Track, follow up, and retain every new congregant with live database statistics."
            }
            className="mb-0"
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* Date Range Inputs */}
            <div className="flex items-center gap-1.5 bg-card border border-border/60 rounded-xl px-2.5 py-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-7 w-28 text-xs border-0 p-0 focus-visible:ring-0"
                placeholder="Start"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-7 w-28 text-xs border-0 p-0 focus-visible:ring-0"
                placeholder="End"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isLoading}
              className="h-9 rounded-xl border-border/70 text-xs font-semibold"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* TOP VIEW TABS (MATCHING LEGACY assimilation.php TABS)                 */}
        {/* ===================================================================== */}
        <div className="flex items-center gap-2 p-1 bg-secondary/30 rounded-2xl border border-border/50 max-w-fit">
          <Button
            variant={activeView === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange("overview")}
            className={cn(
              "rounded-xl text-xs font-bold transition-all",
              activeView === "overview" && "bg-primary text-primary-foreground shadow-glow"
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
            Overview
          </Button>

          <Button
            variant={activeView === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange("list")}
            className={cn(
              "rounded-xl text-xs font-bold transition-all",
              activeView === "list" && "bg-primary text-primary-foreground shadow-glow"
            )}
          >
            <List className="h-3.5 w-3.5 mr-1.5" />
            New Members List
            {data && data.members.total > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 h-4">
                {data.members.total}
              </Badge>
            )}
          </Button>

          <Button
            variant={activeView === "oversight" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange("oversight")}
            className={cn(
              "rounded-xl text-xs font-bold transition-all",
              activeView === "oversight" && "bg-primary text-primary-foreground shadow-glow"
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-gold" />
            Pastoral Alerts & Senior Oversight
            {data && data.kpis.sla_breached > 0 && (
              <Badge className="ml-1.5 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0 h-4 font-bold">
                {data.kpis.sla_breached}
              </Badge>
            )}
          </Button>
        </div>

        {/* ===================================================================== */}
        {/* VIEW 1: OVERVIEW TAB (#pane-overview)                                 */}
        {/* ===================================================================== */}
        {activeView === "overview" && (
          <div className="space-y-6">
            {/* 5 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 1. Total New Members */}
              <Card className="rounded-2xl border-border/60 shadow-soft p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total New Members</p>
                <h3 className="font-display text-2xl font-black text-foreground mt-1">
                  {data?.kpis.total_new_members ?? 0}
                </h3>
                <span className="text-[10px] text-muted-foreground block mt-1">
                  {data ? `${data.kpis.pct_change >= 0 ? "▲ +" : "▼ "}${data.kpis.pct_change}% vs prev period` : "—"}
                </span>
              </Card>

              {/* 2. Follow-Up Rate */}
              <Card className="rounded-2xl border-border/60 shadow-soft p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Follow-Up Rate</p>
                <h3 className="font-display text-2xl font-black text-primary mt-1">
                  {data?.kpis.completion_rate ?? 0}%
                </h3>
                <span className="text-[10px] text-muted-foreground block mt-1">First contact completed</span>
              </Card>

              {/* 3. Pending First Contact */}
              <Card className="rounded-2xl border-border/60 shadow-soft p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pending Contact</p>
                <h3 className="font-display text-2xl font-black text-amber-600 mt-1">
                  {data?.kpis.uncontacted ?? 0}
                </h3>
                <span className="text-[10px] text-muted-foreground block mt-1">Uncontacted in cohort</span>
              </Card>

              {/* 4. Stick Rate */}
              <Card className="rounded-2xl border-border/60 shadow-soft p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Stick Rate</p>
                <h3 className="font-display text-2xl font-black text-emerald-600 mt-1">
                  {data?.kpis.stick_rate ?? 0}
                </h3>
                <span className="text-[10px] text-muted-foreground block mt-1">≥2 service attendances</span>
              </Card>

              {/* 5. SLA Breached (>48h) */}
              <Card className="rounded-2xl border-border/60 shadow-soft p-5 border-l-4 border-l-destructive">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">SLA Breached (&gt;48h)</p>
                <h3 className="font-display text-2xl font-black text-destructive mt-1">
                  {data?.kpis.sla_breached ?? 0}
                </h3>
                <span className="text-[10px] text-destructive block mt-1">&gt;48h without contact</span>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Daily Trend Line Chart */}
              <div className="lg:col-span-6">
                <Card className="rounded-2xl border-border/60 shadow-soft h-full flex flex-col">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                    <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                      <TrendingUp className="h-4 w-4 text-gold" />
                      New Members — Daily Trend
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Intake registrations recorded in database.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                    {!data || data.trend.length === 0 ? (
                      <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
                        No intake timeline trend data recorded.
                      </div>
                    ) : (
                      <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data.trend} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <XAxis dataKey="day" fontSize={11} stroke="oklch(0.5 0.03 260)" tickLine={false} />
                            <YAxis fontSize={11} stroke="oklch(0.5 0.03 260)" tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Decision Type Donut */}
              <div className="lg:col-span-3">
                <Card className="rounded-2xl border-border/60 shadow-soft h-full flex flex-col">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                    <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                      <Activity className="h-4 w-4 text-gold" />
                      By Decision Type
                    </CardTitle>
                    <CardDescription className="text-xs">Intake decision categories.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                    {!data || data.decision_types.length === 0 ? (
                      <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
                        No decision type data.
                      </div>
                    ) : (
                      <>
                        <div className="w-full h-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={data.decision_types}
                                dataKey="count"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                              >
                                {data.decision_types.map((entry, index) => (
                                  <RechartsCell
                                    key={`cell-${index}`}
                                    fill={DECISION_PALETTE[entry.decision_type] || "#64748b"}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-1 pt-2 border-t border-border/40 text-[11px]">
                          {data.decision_types.map((d) => (
                            <div key={d.decision_type} className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: DECISION_PALETTE[d.decision_type] || "#64748b" }}
                                />
                                {d.label}
                              </span>
                              <span className="font-bold text-foreground">
                                {d.count} ({d.pct}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Status Distribution Horizontal Bar */}
              <div className="lg:col-span-3">
                <Card className="rounded-2xl border-border/60 shadow-soft h-full flex flex-col">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                    <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                      <GitBranch className="h-4 w-4 text-gold" />
                      Status Distribution
                    </CardTitle>
                    <CardDescription className="text-xs">Assimilation progress stages.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1 flex flex-col justify-center space-y-4">
                    {!data || data.status_distribution.length === 0 ? (
                      <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
                        No status distribution recorded.
                      </div>
                    ) : (
                      data.status_distribution.map((s) => (
                        <div key={s.status} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">{s.label}</span>
                            <span className="text-muted-foreground font-mono">
                              {s.count} ({s.pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(s.pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2: NEW MEMBERS LIST TAB (#pane-list)                             */}
        {/* ===================================================================== */}
        {activeView === "list" && (
          <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden">
            <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="font-display text-base text-primary">New Members Assimilation Roster</CardTitle>
                <CardDescription className="text-xs">
                  Review new congregants, resolve SLA breached follow-ups, and assign to home cell leaders.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search member name, phone..."
                    className="pl-8 h-9 rounded-xl border-border/60 text-xs bg-background"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                  <SelectTrigger className="h-9 rounded-xl border-border/60 text-xs bg-background min-w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="uncontacted">Uncontacted</SelectItem>
                    <SelectItem value="attempted">Attempted</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="cell_assigned">Cell Assigned</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="h-9 rounded-xl border-border/60 text-xs hover:bg-secondary/40 font-semibold"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                  Export CSV
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={downloadingPdf}
                  onClick={handleDownloadAssimilationPdf}
                  className="h-9 rounded-xl border-border/60 text-xs hover:bg-muted font-medium transition-colors"
                >
                  {downloadingPdf ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  )}
                  Export PDF
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {!data || data.members.results.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground space-y-2">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <p className="font-semibold text-foreground">No assimilation records found in range</p>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting the search query or date range filters.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                      <TableHead className="pl-6 text-xs font-bold">Member</TableHead>
                      <TableHead className="text-xs font-bold">Date Added</TableHead>
                      <TableHead className="text-xs font-bold">Decision Type</TableHead>
                      <TableHead className="text-xs font-bold">Contact</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                      <TableHead className="text-xs font-bold">Assigned To</TableHead>
                      <TableHead className="text-xs font-bold">Follow-ups</TableHead>
                      <TableHead className="text-xs font-bold text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.members.results.map((row) => (
                      <TableRow key={row.id} className="hover:bg-secondary/20 transition-colors">
                        <TableCell className="pl-6">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-foreground block">{row.full_name}</span>
                              {row.sla_breached && (
                                <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[9px] px-1 py-0 font-bold">
                                  SLA &gt;48h
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">{row.email || "No email"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>
                            <span>{row.created_at_formatted}</span>
                            <span className="text-[10px] text-muted-foreground block">{row.time_ago}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {row.decision_type.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`tel:${row.phone_no}`}
                            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {row.phone_no}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-[10px] font-bold capitalize",
                              row.assimilation_status === "cell_assigned"
                                ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                                : row.assimilation_status === "contacted"
                                ? "bg-primary/15 text-primary border-primary/30"
                                : row.assimilation_status === "attempted"
                                ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                                : "bg-secondary text-muted-foreground"
                            )}
                          >
                            {row.assimilation_status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.assigned_to_name ? (
                            <div>
                              <span className="font-semibold text-foreground block">{row.assigned_to_name}</span>
                              <span className="text-[10px] text-muted-foreground">{row.assigned_role}</span>
                            </div>
                          ) : (
                            <span className="italic text-muted-foreground/60">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-center font-mono font-bold text-foreground">
                          {row.followup_count}
                        </TableCell>
                        <TableCell className="text-right pr-6 space-x-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLogModalRow(row);
                              setSelectedOutcomeTags([]);
                              setSelectedNextSteps([]);
                              setLogNotes("");
                            }}
                            className="h-7 text-xs font-bold rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                          >
                            Log
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAssignModalRow(row);
                            }}
                            className="h-7 text-xs font-bold rounded-lg border-border/70 hover:bg-secondary/40"
                          >
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* ===================================================================== */}
        {/* VIEW 3: SENIOR MANAGEMENT OVERSIGHT & PASTORAL ALERTS (#pane-oversight)*/}
        {/* ===================================================================== */}
        {activeView === "oversight" && (
          <div className="space-y-6">
            {/* Senior Management Oversight Header Card */}
            <Card className="rounded-2xl border-border/60 shadow-soft bg-gradient-to-r from-primary/10 via-background to-secondary/30 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-glow">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-display text-foreground">
                    Senior Management Oversight & Pastoral Alerts
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Monitor staff/caregiver team performance, SLA breach compliance, priority alert triage, and complete audit trail.
                  </p>
                </div>
              </div>

              <Badge className="bg-primary text-primary-foreground font-bold text-xs px-3 py-1">
                Active Pastoral Command
              </Badge>
            </Card>

            {/* Priority Pastoral Actions Queue (Alerts Triage) */}
            {data?.oversight.pastoral_alerts && data.oversight.pastoral_alerts.length > 0 && (
              <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5 shadow-soft overflow-hidden">
                <CardHeader className="bg-amber-500/10 pb-3 border-b border-amber-500/20 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-base text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Priority Pastoral Intervention Queue
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Uncontacted intake members whose initial contact window has breached 48 hours.
                    </CardDescription>
                  </div>
                  <Badge className="bg-amber-500 text-white font-bold text-xs">
                    {data.oversight.pastoral_alerts.length} Pending Actions
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/30 hover:bg-transparent">
                        <TableHead className="pl-6 text-xs font-bold">Severity</TableHead>
                        <TableHead className="text-xs font-bold">Member</TableHead>
                        <TableHead className="text-xs font-bold">Elapsed Duration</TableHead>
                        <TableHead className="text-xs font-bold">Assigned Caregiver</TableHead>
                        <TableHead className="text-xs font-bold text-right pr-6">Intervention</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.oversight.pastoral_alerts.map((alert) => (
                        <TableRow key={alert.id} className="hover:bg-amber-500/10 transition-colors">
                          <TableCell className="pl-6">
                            <Badge
                              className={cn(
                                "text-[10px] font-bold",
                                alert.severity === "Red"
                                  ? "bg-destructive text-destructive-foreground"
                                  : "bg-amber-500 text-white"
                              )}
                            >
                              {alert.severity} Alert
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-xs text-foreground block">{alert.member_name}</span>
                            <span className="text-[10px] text-muted-foreground">ID #{alert.member_id} • {alert.source_module}</span>
                          </TableCell>
                          <TableCell className="text-xs text-destructive font-semibold font-mono">
                            {alert.stalled_days}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {alert.assigned_to || "Pastoral Team"}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button
                              size="sm"
                              onClick={() => {
                                setTriagingAlert(alert);
                                setTriageActionType("assign_followup");
                                setTriageAssignee("Senior Pastor");
                                setTriageNotes("");
                              }}
                              className="h-7 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-soft"
                            >
                              {alert.action_label}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Team Performance Oversight Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12">
                <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                    <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                      <UserCheck className="h-4 w-4 text-gold" />
                      Caregiver & Staff Performance Oversight
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Active cell leaders and staff follow-up responsiveness and SLA breach compliance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {!data || data.oversight.team_performance.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground">
                        No team performance records recorded.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-border/40 hover:bg-transparent">
                            <TableHead className="pl-6 text-xs font-bold">Staff / Volunteer Leader</TableHead>
                            <TableHead className="text-xs font-bold text-center">Assigned</TableHead>
                            <TableHead className="text-xs font-bold text-center">Contacted</TableHead>
                            <TableHead className="text-xs font-bold text-center">Uncontacted</TableHead>
                            <TableHead className="text-xs font-bold text-center">Avg Response</TableHead>
                            <TableHead className="text-xs font-bold text-right pr-6">SLA Breached</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.oversight.team_performance.map((staff) => (
                            <TableRow key={staff.user_id}>
                              <TableCell className="pl-6 text-xs font-semibold text-foreground">
                                {staff.staff_name}
                              </TableCell>
                              <TableCell className="text-xs text-center font-bold">{staff.assigned}</TableCell>
                              <TableCell className="text-xs text-center text-emerald-600 font-bold">
                                {staff.contacted}
                              </TableCell>
                              <TableCell className="text-xs text-center text-amber-600 font-bold">
                                {staff.uncontacted}
                              </TableCell>
                              <TableCell className="text-xs text-center font-mono">
                                {staff.avg_response_hours}h
                              </TableCell>
                              <TableCell className="text-xs text-right pr-6 font-bold text-destructive">
                                {staff.sla_breached > 0 ? (
                                  <Badge className="bg-destructive text-destructive-foreground text-[10px]">
                                    {staff.sla_breached}
                                  </Badge>
                                ) : (
                                  <span className="text-emerald-600 font-bold text-xs">✓ None</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Aging Buckets + Funnel */}
              <div className="lg:col-span-6">
                <Card className="rounded-2xl border-border/60 shadow-soft h-full flex flex-col">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                    <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                      <Clock className="h-4 w-4 text-gold" />
                      Aging Buckets — Uncontacted
                    </CardTitle>
                    <CardDescription className="text-xs">Elapsed duration since initial intake.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1 flex flex-col justify-center space-y-3">
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-secondary/30 border border-border/40">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">0 - 24 hrs</span>
                        <span className="text-xl font-black text-emerald-600 mt-1 block">
                          {data?.oversight.aging_buckets.h0_24 ?? 0}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/30 border border-border/40">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">24 - 48 hrs</span>
                        <span className="text-xl font-black text-amber-600 mt-1 block">
                          {data?.oversight.aging_buckets.h24_48 ?? 0}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/30 border border-border/40">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">48 - 72 hrs</span>
                        <span className="text-xl font-black text-orange-600 mt-1 block">
                          {data?.oversight.aging_buckets.h48_72 ?? 0}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30">
                        <span className="text-[10px] text-destructive uppercase font-bold block">&gt; 72 hrs ⚠</span>
                        <span className="text-xl font-black text-destructive mt-1 block">
                          {data?.oversight.aging_buckets.h72_plus ?? 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Assimilation Pipeline Funnel */}
              <div className="lg:col-span-6">
                <Card className="rounded-2xl border-border/60 shadow-soft h-full flex flex-col">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                    <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                      <Activity className="h-4 w-4 text-gold" />
                      Assimilation Funnel Progression
                    </CardTitle>
                    <CardDescription className="text-xs">Intake cohort conversion stages.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">1. Total New Intake</span>
                        <span className="font-bold">{data?.oversight.funnel.total ?? 0} (100%)</span>
                      </div>
                      <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-full" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">2. First Contact Achieved</span>
                        <span className="font-bold">
                          {data?.oversight.funnel.first_contact ?? 0} ({data?.oversight.funnel.first_contact_pct ?? 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(data?.oversight.funnel.first_contact_pct ?? 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">3. Second Contact (Stick Rate)</span>
                        <span className="font-bold">
                          {data?.oversight.funnel.second_contact ?? 0} ({data?.oversight.funnel.second_contact_pct ?? 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(data?.oversight.funnel.second_contact_pct ?? 0, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">4. Cell Fellowship Assigned</span>
                        <span className="font-bold">
                          {data?.oversight.funnel.cell_assigned ?? 0} ({data?.oversight.funnel.cell_assigned_pct ?? 0}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-secondary/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(data?.oversight.funnel.cell_assigned_pct ?? 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Audit Log (Last 30-50 Pastoral Actions) */}
              <div className="lg:col-span-12">
                <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                    <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                      <Clock className="h-4 w-4 text-gold" />
                      Pastoral Care Audit Trail
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Complete activity history of follow-up outreach, assignments, and pastoral triage interventions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {!data || data.oversight.audit_log.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground">
                        No recent pastoral action logs found in database.
                      </div>
                    ) : (
                      <div className="divide-y divide-border/30 max-h-96 overflow-y-auto">
                        {data.oversight.audit_log.map((log) => (
                          <div key={log.id} className="p-4 flex items-start justify-between text-xs hover:bg-secondary/20 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                <Shield className="h-4 w-4 text-gold" />
                              </div>
                              <div>
                                <span className="font-bold text-foreground block">{log.member_name}</span>
                                <p className="text-muted-foreground mt-0.5">{log.notes}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-semibold text-primary block">{log.actor_name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{log.created_at_formatted}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* LOG FOLLOW-UP MODAL                                                  */}
        {/* ===================================================================== */}
        <Dialog
          open={Boolean(logModalRow)}
          onOpenChange={(open) => {
            if (!open) setLogModalRow(null);
          }}
        >
          <DialogContent className="sm:max-w-lg rounded-2xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2 text-primary">
                <Phone className="h-5 w-5 text-gold" />
                Log Assimilation Follow-Up
              </DialogTitle>
              <DialogDescription className="text-xs">
                Record outreach action for member: <strong>{logModalRow?.full_name}</strong>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleLogFollowupSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Contact Type *</Label>
                  <Select value={logContactType} onValueChange={(val) => setLogContactType(val)}>
                    <SelectTrigger className="rounded-xl border-border/60">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="phone_call">Phone Call</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="in_person">In-Person Visit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Reached Person? *</Label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="reached"
                        checked={logReached}
                        onChange={() => setLogReached(true)}
                        className="text-primary"
                      />
                      Yes, reached
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="reached"
                        checked={!logReached}
                        onChange={() => setLogReached(false)}
                        className="text-primary"
                      />
                      No, unanswered
                    </label>
                  </div>
                </div>
              </div>

              {/* Outcome Tags */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase">Outcome Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {OUTCOME_TAGS.map((tag) => {
                    const isSelected = selectedOutcomeTags.includes(tag);
                    return (
                      <Badge
                        key={tag}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer text-xs transition-colors",
                          isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                        )}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedOutcomeTags(selectedOutcomeTags.filter((t) => t !== tag));
                          } else {
                            setSelectedOutcomeTags([...selectedOutcomeTags, tag]);
                          }
                        }}
                      >
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase">Next Steps</Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {NEXT_STEPS.map((step) => {
                    const isChecked = selectedNextSteps.includes(step);
                    return (
                      <label key={step} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNextSteps([...selectedNextSteps, step]);
                            } else {
                              setSelectedNextSteps(selectedNextSteps.filter((s) => s !== step));
                            }
                          }}
                        />
                        <span>{step}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Pastoral / Interaction Notes</Label>
                <Textarea
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Record conversational notes, spiritual concerns, and follow-up guidance..."
                  className="rounded-xl border-border/60 min-h-[70px] text-xs"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLogModalRow(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingLog}
                  className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmittingLog ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Save Follow-Up
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ===================================================================== */}
        {/* ASSIGN CAREGIVER MODAL                                                */}
        {/* ===================================================================== */}
        <Dialog
          open={Boolean(assignModalRow)}
          onOpenChange={(open) => {
            if (!open) setAssignModalRow(null);
          }}
        >
          <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2 text-primary">
                <UserCheck className="h-5 w-5 text-gold" />
                Assign Caregiver / Cell Leader
              </DialogTitle>
              <DialogDescription className="text-xs">
                Assign caregiver responsible for <strong>{assignModalRow?.full_name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAssignSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Caregiver / Cell Leader Name *</Label>
                <Input
                  placeholder="e.g. Pastor Samuel, Cell Leader Grace..."
                  value={selectedCaregiver}
                  onChange={(e) => setSelectedCaregiver(e.target.value)}
                  className="rounded-xl border-border/60"
                  required
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssignModalRow(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingAssign}
                  className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmittingAssign ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Confirm Assignment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ===================================================================== */}
        {/* PASTORAL ACTION TRIAGE MODAL                                          */}
        {/* ===================================================================== */}
        <Dialog
          open={Boolean(triagingAlert)}
          onOpenChange={(open) => {
            if (!open) setTriagingAlert(null);
          }}
        >
          <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2 text-primary">
                <Send className="h-5 w-5 text-gold" />
                Dispatch Pastoral Intervention
              </DialogTitle>
              <DialogDescription className="text-xs">
                Action alert for congregant: <strong>{triagingAlert?.member_name}</strong> ({triagingAlert?.stalled_days})
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleTriageSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Action Type *</Label>
                <Select value={triageActionType} onValueChange={(val) => setTriageActionType(val)}>
                  <SelectTrigger className="rounded-xl border-border/60">
                    <SelectValue placeholder="Select Action" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="assign_followup">Assign Pastoral Follow-Up</SelectItem>
                    <SelectItem value="message_discipler">Message Cell Leader / Discipler</SelectItem>
                    <SelectItem value="contact_leader">Contact Zone Pastor</SelectItem>
                    <SelectItem value="emergency_care">Schedule Pastoral Home Visit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Assignee Caregiver *</Label>
                <Input
                  value={triageAssignee}
                  onChange={(e) => setTriageAssignee(e.target.value)}
                  placeholder="e.g. Senior Pastor, Deacon John..."
                  className="rounded-xl border-border/60"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Triage Guidance / Notes</Label>
                <Textarea
                  value={triageNotes}
                  onChange={(e) => setTriageNotes(e.target.value)}
                  placeholder="Add specific instructions for the assigned caregiver..."
                  className="rounded-xl border-border/60 min-h-[70px] text-xs"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTriagingAlert(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingTriage}
                  className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmittingTriage ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Dispatch Intervention
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
