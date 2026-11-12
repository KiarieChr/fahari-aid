import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  Users,
  Flame,
  UserCheck,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Search,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  X,
  MapPin,
  Clock,
  ArrowRight,
  Filter,
  Loader2,
  Check,
  Send,
  BookOpen,
  FileText,
  Building,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell as RechartsCell,
} from "recharts";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiCall } from "@/api/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leadership")({
  head: () => ({
    meta: [
      { title: "Leadership Command — J.E.N Church ERP" },
      {
        name: "description",
        content:
          "Senior pastoral oversight, discipleship pipeline funnel, priority pastoral care alerts, and 360-degree spiritual journey lookup.",
      },
    ],
  }),
  component: LeadershipPage,
});

// ============================================================================
// TypeScript Interfaces (Strict Contract with Django Backend)
// ============================================================================

export interface LeadershipKpis {
  new_converts: { value: number; trend: number; trend_type: string; label: string };
  followup_rate: { value: number; trend: number; trend_type: string; label: string };
  weekly_cell_turnout: { value: number; trend: number; trend_type: string; label: string };
  discipleship_saturation: { value: number; trend: number; trend_type: string; label: string };
  active_trainees: { value: number; trend: number; trend_type: string; label: string };
  reproduced_cells: { value: number; trend: number; trend_type: string; label: string };
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface PastoralAlertItem {
  id: number;
  member_id: number;
  member_name: string;
  severity: "Red" | "Amber";
  stalled_days: number | string;
  source_module: string;
  status: "Active" | "Pending" | "Resolved" | "pending" | "resolved" | string;
  assigned_to: string | null;
  created_at: string;
  action_label?: string;
  action_url?: string;
  actioned?: boolean;
}

export interface CellReturnItem {
  cell_id: number;
  code: string;
  name: string;
  leader: string;
  meeting_day: string;
  meeting_time: string;
  status: "Submitted" | "Pending" | "Overdue";
  attendance_count: number;
  offering_amount: number;
  topic: string | null;
  scripture: string | null;
  prayer_requests: string | null;
  submitted_at: string | null;
}

export interface CellWeeklyReturnsSummary {
  active_cells: number;
  submitted: number;
  submitted_pct: number;
  pending: number;
  overdue: number;
  total_offerings: number;
}

export interface SalvationIntakeMilestone {
  date: string | null;
  service: string | null;
  intake_officer: string | null;
  complete: boolean;
}

export interface BaptismMilestone {
  status: string | null;
  date: string | null;
  officiator: string | null;
  complete: boolean;
}

export interface CellLifeMilestone {
  cell_name: string | null;
  leader: string | null;
  streak_days: number | null;
  attendance_frequency_pct: number | null;
  complete: boolean;
}

export interface DiscipleshipMilestone {
  discipler_name: string | null;
  rubric_score: number | null;
  completed_sessions: number | null;
  total_sessions: number | null;
  complete: boolean;
}

export interface LmsMilestone {
  track: string | null;
  modules_completed: number | null;
  modules_total: number | null;
  practical_score: number | null;
  complete: boolean;
}

export interface CommissioningMilestone {
  date: string | null;
  ordained_role: string | null;
  department: string | null;
  complete: boolean;
}

export interface MemberMilestones {
  salvation_intake: SalvationIntakeMilestone | null;
  baptism: BaptismMilestone | null;
  cell_life: CellLifeMilestone | null;
  discipleship: DiscipleshipMilestone | null;
  lms: LmsMilestone | null;
  commissioning: CommissioningMilestone | null;
}

export interface Member360 {
  id: number;
  name: string;
  phone: string;
  email: string;
  joined: string;
  department: string;
  status: string;
  cell_life: {
    cell_name: string;
    cell_code: string;
    meeting_day?: string | null;
    location?: string | null;
    join_date: string;
    attendance_rate: string;
    last_attendance: string;
    leader_name?: string | null;
  };
  discipleship: {
    stage: string;
    discipler: string;
    last_session: string;
    total_sessions: number;
    sparkline_data: number[];
  };
  lms: {
    enrolled_course: string;
    progress: number;
    coach: string;
    pending_evals: number;
  };
  attendance_count: number;
}

export interface LeadershipApiResponse {
  kpis: LeadershipKpis;
  discipleship_funnel: FunnelStage[];
  pastoral_alerts: PastoralAlertItem[];
  members_360: Member360[];
  milestones: Record<string, MemberMilestones>;
  cell_weekly_returns: {
    summary: CellWeeklyReturnsSummary;
    cells: CellReturnItem[];
  };
}

interface PastoralActionResponse {
  success: boolean;
  message: string;
  alert?: {
    id: number;
    action_type: string;
    assigned_to: string;
    notes: string;
    status: string;
    updated_at: string;
  };
}

function LeadershipPage() {
  const [kpis, setKpis] = useState<LeadershipKpis | null>(null);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [alerts, setAlerts] = useState<PastoralAlertItem[]>([]);
  const [cellSummary, setCellSummary] = useState<CellWeeklyReturnsSummary | null>(null);
  const [cellRows, setCellRows] = useState<CellReturnItem[]>([]);
  const [members360, setMembers360] = useState<Member360[]>([]);
  const [milestones, setMilestones] = useState<Record<string, MemberMilestones>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Search 360 State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member360 | null>(null);
  const [searchError, setSearchError] = useState("");

  // Modal 1: Pastoral Action Dialog State
  const [actionAlert, setActionAlert] = useState<PastoralAlertItem | null>(null);
  const [actionAssignee, setActionAssignee] = useState<string>("Pastoral Care Team");
  const [actionNotes, setActionNotes] = useState<string>("");
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  // Modal 2: 360 Milestone Roadmap State
  const [isRoadmapOpen, setIsRoadmapOpen] = useState<boolean>(false);

  // Modal 3: Review Return Modal State
  const [selectedReturn, setSelectedReturn] = useState<CellReturnItem | null>(null);

  const fetchLeadershipData = async (queryParam?: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const url = queryParam
        ? `/analytics/leadership/?q=${encodeURIComponent(queryParam)}`
        : "/analytics/leadership/";
      const res = await apiCall<LeadershipApiResponse>(url);

      if (res) {
        if (res.kpis) setKpis(res.kpis);
        if (res.discipleship_funnel) setFunnel(res.discipleship_funnel);
        if (res.pastoral_alerts) {
          // Augment with display action_label if not provided by backend
          const augmentedAlerts = res.pastoral_alerts.map((a) => {
            let label = "Assign Follow-Up";
            if (a.source_module === "Leadership LMS") label = "Message Coach";
            else if (a.source_module === "Cell Ministry") label = "Contact Leader";
            else if (a.source_module === "Discipleship") label = "Message Discipler";
            return {
              ...a,
              action_label: a.action_label || label,
              actioned: a.status === "Resolved",
            };
          });
          setAlerts(augmentedAlerts);
        }
        if (res.cell_weekly_returns) {
          setCellSummary(res.cell_weekly_returns.summary);
          setCellRows(res.cell_weekly_returns.cells || []);
        }
        if (res.members_360) {
          setMembers360(res.members_360);
          // If no member is currently selected, default to the first one available
          if (!selectedMember && res.members_360.length > 0) {
            setSelectedMember(res.members_360[0]);
          }
        }
        if (res.milestones) {
          setMilestones((prev) => ({ ...prev, ...res.milestones }));
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load leadership analytics from database.";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadershipData();
  }, []);

  const handleMemberSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery ?? searchQuery).trim();
    if (!q || q.length < 2) {
      setSearchError("Please enter at least 2 characters to search");
      return;
    }
    setSearchError("");

    // First check local in-memory list
    const localMatch = members360.find(
      (m) =>
        m.name.toLowerCase().includes(q.toLowerCase()) ||
        m.email.toLowerCase().includes(q.toLowerCase()) ||
        m.phone.includes(q)
    );

    if (localMatch) {
      setSelectedMember(localMatch);
      return;
    }

    // Query backend leadership endpoint with filter query
    setIsSearching(true);
    try {
      const res = await apiCall<LeadershipApiResponse>(`/analytics/leadership/?q=${encodeURIComponent(q)}`);
      if (res && res.members_360 && res.members_360.length > 0) {
        // Merge fetched members and milestones
        setMembers360((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          const newOnes = res.members_360.filter((m) => !ids.has(m.id));
          return [...prev, ...newOnes];
        });
        if (res.milestones) {
          setMilestones((prev) => ({ ...prev, ...res.milestones }));
        }

        const match = res.members_360.find(
          (m) =>
            m.name.toLowerCase().includes(q.toLowerCase()) ||
            m.email.toLowerCase().includes(q.toLowerCase()) ||
            m.phone.includes(q)
        ) || res.members_360[0];

        setSelectedMember(match);
      } else {
        setSearchError("No member found matching your query");
      }
    } catch (_err) {
      setSearchError("Error searching member database. Please retry.");
    } finally {
      setIsSearching(false);
    }
  };

  // Submit Pastoral Intervention Action
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionAlert) return;

    setIsSubmittingAction(true);
    try {
      const res = await apiCall<PastoralActionResponse>("/analytics/pastoral-action/", {
        method: "POST",
        body: {
          alert_id: actionAlert.id,
          target_name: actionAlert.member_name,
          action_type: actionAlert.action_label || "Pastoral Intervention",
          assigned_to: actionAssignee,
          notes: actionNotes.trim(),
        },
      });

      toast.success(res?.message || `Pastoral intervention dispatched to ${actionAssignee}.`);

      // Update state locally
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === actionAlert.id
            ? {
                ...a,
                status: "Resolved",
                actioned: true,
                assigned_to: res?.alert?.assigned_to || actionAssignee,
              }
            : a
        )
      );

      // Close modal
      setActionAlert(null);
      setActionNotes("");
      setActionAssignee("Pastoral Care Team");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to dispatch pastoral action. Please retry.";
      toast.error(message);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Find biggest drop off stage in discipleship pipeline
  let maxDropIdx = 0;
  let maxDropPct = 0;
  for (let i = 0; i < funnel.length - 1; i++) {
    if (funnel[i].count > 0) {
      const drop = (funnel[i].count - funnel[i + 1].count) / funnel[i].count;
      if (drop > maxDropPct) {
        maxDropPct = drop;
        maxDropIdx = i + 1;
      }
    }
  }

  // Derived KPI chips from cell_weekly_returns.summary (Single source of truth)
  const cellSummaryDisplay: CellWeeklyReturnsSummary = cellSummary || {
    active_cells: cellRows.length,
    submitted: cellRows.filter((c) => c.status === "Submitted").length,
    submitted_pct: cellRows.length > 0 ? Math.round((cellRows.filter((c) => c.status === "Submitted").length / cellRows.length) * 100) : 0,
    pending: cellRows.filter((c) => c.status === "Pending").length,
    overdue: cellRows.filter((c) => c.status === "Overdue").length,
    total_offerings: cellRows.reduce((sum, c) => sum + (c.offering_amount || 0), 0),
  };

  const pendingAlertsCount = alerts.filter((a) => a.status !== "Resolved" && !a.actioned).length;

  // Selected member's milestones
  const selectedMemberMilestones: MemberMilestones | null = selectedMember
    ? milestones[String(selectedMember.id)] || null
    : null;

  return (
    <div className="mx-auto w-full max-w-[1600px] animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title="Leadership Command & Pastoral Oversight"
          description="Senior pastoral oversight, governance, discipleship pipeline funnel, and 360° spiritual journey intelligence."
          className="mb-0"
        />

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-9 px-3 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
            Senior Pastoral Security Level
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLeadershipData()}
            disabled={isLoading}
            className="h-9 rounded-xl border-border/70 hover:bg-secondary/40 text-xs font-semibold"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isLoading && "animate-spin")} />
            Sync
          </Button>
        </div>
      </div>

      {/* Error State Banner */}
      {loadError && !isLoading && (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-destructive">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold text-sm">Failed to synchronize live leadership data</p>
              <p className="text-xs text-muted-foreground mt-0.5">{loadError}</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => fetchLeadershipData()}
            className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* 360-Degree Member Search Input Bar */}
      <Card className="rounded-2xl border-border/60 shadow-soft mb-8 bg-card/60 backdrop-blur-md">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMemberSearch()}
                placeholder="Search member for 360° Spiritual Journey Profile (e.g., James, Benjamin, Timothy, Faith, email or phone)..."
                className="pl-11 h-12 text-sm md:text-base rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary font-medium"
              />
            </div>
            <Button
              onClick={() => handleMemberSearch()}
              disabled={isSearching}
              className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold shadow-glow hover:bg-primary/90 w-full sm:w-auto"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              {isSearching ? "Searching..." : "Search Member"}
            </Button>
          </div>

          {searchError && (
            <p className="text-xs text-destructive mt-2 ml-2 font-medium">{searchError}</p>
          )}

          {/* Quick Real Suggestions from Live Database */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground ml-1">
            <span>Quick lookups:</span>
            {members360.slice(0, 6).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSearchQuery(m.name);
                  setSelectedMember(m);
                }}
                className="rounded-lg bg-secondary/50 px-2 py-0.5 font-semibold text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {m.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 360-Degree Profile Inspector View (Shown when member is selected) */}
      {selectedMember && (
        <Card className="rounded-2xl border-primary/30 shadow-elevated mb-8 overflow-hidden bg-card transition-all animate-in slide-in-from-top-4 duration-300">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/20 to-gold/10 pb-4 border-b border-border/40 flex flex-row items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-black font-display shadow-glow">
                {selectedMember.name
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="font-display text-xl font-bold">{selectedMember.name}</CardTitle>
                  <Badge className="bg-success/15 text-success hover:bg-success/20 text-[10px] font-bold">
                    {selectedMember.status}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-secondary/40">
                    {selectedMember.department}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {selectedMember.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {selectedMember.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Joined {selectedMember.joined}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMember(null)}
              className="h-8 w-8 p-0 rounded-full hover:bg-secondary/60 text-muted-foreground"
              aria-label="Close profile"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Pillar 1: Assimilation & Follow-up */}
              <div className="rounded-xl border border-border/50 bg-secondary/10 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span>1. First-Timers</span>
                  <UserCheck className="h-4 w-4 text-primary" />
                </div>
                <p className="font-display text-base font-bold text-foreground">
                  {selectedMember.cell_life.cell_name !== "Unassigned" ? "Cell Assigned" : "Intake Recorded"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Joined on {selectedMember.joined}. Completed intake record.
                </p>
                <div className="pt-2">
                  <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30 font-semibold">
                    Assimilation Intake
                  </Badge>
                </div>
              </div>

              {/* Pillar 2: Cell Fellowship Life */}
              <div className="rounded-xl border border-border/50 bg-secondary/10 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span>2. Cell Fellowship</span>
                  <Flame className="h-4 w-4 text-gold" />
                </div>
                <p className="font-display text-base font-bold text-foreground">{selectedMember.cell_life.cell_name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {selectedMember.cell_life.location || "Nairobi Zone"}
                </div>
                <div className="flex justify-between items-center text-xs font-medium pt-1">
                  <span className="text-muted-foreground">Attendance:</span>
                  <span className="font-bold text-primary">{selectedMember.cell_life.attendance_rate}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Leader: {selectedMember.cell_life.leader_name || "—"}
                </p>
              </div>

              {/* Pillar 3: Discipleship Pipeline */}
              <div className="rounded-xl border border-border/50 bg-secondary/10 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span>3. Discipleship</span>
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <p className="font-display text-base font-bold text-foreground">{selectedMember.discipleship.stage}</p>
                <div className="text-xs text-muted-foreground">
                  Discipler: <span className="font-semibold text-foreground">{selectedMember.discipleship.discipler}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Sessions: {selectedMember.discipleship.total_sessions} completed</span>
                  <span className="font-semibold text-success">{selectedMember.discipleship.last_session}</span>
                </div>
                {/* Visual sparkline sessions */}
                <div className="flex items-end gap-1.5 h-6 pt-1">
                  {selectedMember.discipleship.sparkline_data.map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-primary/70 hover:bg-primary rounded-t transition-all"
                      style={{ height: `${Math.max(15, (val / 7) * 100)}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Pillar 4: Leadership Academy (LMS) */}
              <div className="rounded-xl border border-border/50 bg-secondary/10 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span>4. Leadership LMS</span>
                  <GraduationCap className="h-4 w-4 text-gold" />
                </div>
                <p className="font-display text-base font-bold text-foreground">{selectedMember.lms.enrolled_course}</p>
                <div className="text-xs text-muted-foreground">
                  Coach: <span className="font-semibold text-foreground">{selectedMember.lms.coach}</span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Course Progress</span>
                    <span className="text-gold-foreground">{selectedMember.lms.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold transition-all duration-700"
                      style={{ width: `${selectedMember.lms.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar: View Complete Spiritual Milestone Roadmap */}
            <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Senior pastoral tracking: review milestone checkpoints from salvation to commissioning.
              </span>
              <Button
                onClick={() => setIsRoadmapOpen(true)}
                className="rounded-xl font-bold bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4 text-gold" />
                View Complete Spiritual Milestone Roadmap
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6 Strategic Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {isLoading || !kpis ? (
          Array(6)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            {/* KPI 1: New Converts */}
            <Card className="rounded-2xl border-border/60 shadow-soft p-4 transition-all hover:-translate-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total New Converts
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-2xl font-black text-foreground">
                  {kpis.new_converts.value}
                </span>
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3 text-primary" /> {kpis.new_converts.trend}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Last 30 days intake</p>
            </Card>

            {/* KPI 2: Follow-up Completion */}
            <Card className="rounded-2xl border-border/60 shadow-soft p-4 transition-all hover:-translate-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Follow-Up Rate
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-2xl font-black text-primary">
                  {kpis.followup_rate.value}%
                </span>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Converts assimilated</p>
            </Card>

            {/* KPI 3: Active Cell Turnout */}
            <Card className="rounded-2xl border-border/60 shadow-soft p-4 transition-all hover:-translate-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Active Cell Turnout
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-2xl font-black text-foreground">
                  {kpis.weekly_cell_turnout.value}
                </span>
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3 text-gold" /> {kpis.weekly_cell_turnout.trend}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Weekly home turnout</p>
            </Card>

            {/* KPI 4: Discipleship Saturation */}
            <Card className="rounded-2xl border-border/60 shadow-soft p-4 transition-all hover:-translate-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Disciple Saturation
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-2xl font-black text-gold-foreground">
                  {kpis.discipleship_saturation.value}%
                </span>
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3 text-success" /> {kpis.discipleship_saturation.trend}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Members in tracks</p>
            </Card>

            {/* KPI 5: Leaders in Training */}
            <Card className="rounded-2xl border-border/60 shadow-soft p-4 transition-all hover:-translate-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Leaders in Training
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-2xl font-black text-foreground">
                  {kpis.active_trainees.value}
                </span>
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3 text-primary" /> {kpis.active_trainees.trend}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">In LMS Tracks</p>
            </Card>

            {/* KPI 6: Multiplied Cells */}
            <Card className="rounded-2xl border-border/60 shadow-soft p-4 transition-all hover:-translate-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Multiplied Cells
              </p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="font-display text-2xl font-black text-success">
                  {kpis.reproduced_cells.value}
                </span>
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3 text-success" /> +{kpis.reproduced_cells.trend}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Formed this year</p>
            </Card>
          </>
        )}
      </div>

      {/* Main Analytical Section: Pipeline Funnel (7 cols) + Priority Pastoral Alerts (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: End-to-End Discipleship Pipeline Funnel */}
        <div className="lg:col-span-7">
          <Card className="rounded-2xl border-border/60 shadow-soft h-full flex flex-col overflow-hidden">
            <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display text-lg flex items-center gap-2 text-primary">
                  <Filter className="h-5 w-5" />
                  End-to-End Discipleship Pipeline
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Tracking congregational conversion from First-Timers to Commissioned Cell Leaders
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] bg-secondary/40 font-bold">
                Live Data
              </Badge>
            </CardHeader>

            <CardContent className="pt-6 flex-1 flex flex-col justify-between">
              {isLoading ? (
                <div className="h-[360px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : funnel.length === 0 ? (
                <div className="h-[360px] flex flex-col items-center justify-center text-muted-foreground">
                  <Filter className="h-10 w-10 text-muted-foreground/40 mb-2" />
                  <p className="font-semibold text-foreground">No pipeline stages recorded</p>
                  <p className="text-xs text-muted-foreground mt-1">Congregational stages will appear as members progress.</p>
                </div>
              ) : (
                <>
                  {/* Funnel Horizontal Bar Chart */}
                  <div className="w-full" style={{ minHeight: "360px" }}>
                    <ResponsiveContainer width="100%" height={360}>
                      <BarChart
                        data={funnel}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 140, bottom: 10 }}
                      >
                        <XAxis type="number" stroke="oklch(0.5 0.03 260)" fontSize={10} hide />
                        <YAxis
                          dataKey="stage"
                          type="category"
                          stroke="oklch(0.2 0.05 265)"
                          fontSize={11}
                          fontWeight={600}
                          tickLine={false}
                          axisLine={false}
                          width={130}
                        />
                        <Tooltip
                          cursor={{ fill: "oklch(0.92 0.01 260 / 0.3)" }}
                          formatter={(val: unknown) => [`${val} Members`, "Count"]}
                          contentStyle={{
                            background: "oklch(1 0 0)",
                            border: "1px solid oklch(0.92 0.01 260)",
                            borderRadius: 12,
                            padding: "8px 12px",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={28}>
                          {funnel.map((_, index) => (
                            <RechartsCell
                              key={`cell-${index}`}
                              fill={
                                index === maxDropIdx && maxDropPct > 0
                                  ? "oklch(0.6 0.22 25)" // High-drop alert red
                                  : index < 2
                                  ? "oklch(0.28 0.14 252)" // Royal Sapphire
                                  : "oklch(0.75 0.13 78)" // Warm Gold
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Funnel Bottleneck Indicator Alert */}
                  {maxDropPct > 0 && funnel[maxDropIdx] && (
                    <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                        <span className="text-foreground font-medium">
                          Critical Conversion Drop detected at:{" "}
                          <strong className="text-destructive font-bold">
                            {funnel[maxDropIdx]?.stage}
                          </strong>{" "}
                          ({Math.round(maxDropPct * 100)}% drop-off).
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                        Attention Required
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 5 Columns: Priority Pastoral Actions & Alerts Queue */}
        <div className="lg:col-span-5">
          <Card className="rounded-2xl border-border/60 shadow-soft h-full flex flex-col overflow-hidden">
            <CardHeader className="bg-destructive/5 pb-4 border-b border-destructive/10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display text-lg flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Priority Pastoral Actions
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Actionable pastoral care items requiring leadership intervention
                </CardDescription>
              </div>
              <Badge className="bg-destructive text-destructive-foreground font-bold text-xs rounded-full px-2.5">
                {pendingAlertsCount} Action {pendingAlertsCount === 1 ? "Item" : "Items"}
              </Badge>
            </CardHeader>

            <CardContent className="p-0 flex-1">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-success/60 mb-2" />
                  <p className="font-semibold text-foreground">No active pastoral alerts</p>
                  <p className="text-xs text-muted-foreground mt-1">All members are engaged with no stalled milestones.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30 overflow-y-auto max-h-[500px]">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 hover:bg-secondary/20 transition-colors flex flex-col gap-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                              alert.actioned || alert.status === "Resolved"
                                ? "bg-muted-foreground/40"
                                : alert.severity === "Red"
                                ? "bg-destructive animate-pulse"
                                : "bg-warning"
                            }`}
                          />
                          <span
                            className={cn(
                              "font-semibold text-sm transition-colors",
                              alert.actioned || alert.status === "Resolved"
                                ? "line-through text-muted-foreground"
                                : "text-foreground group-hover:text-primary"
                            )}
                          >
                            {alert.member_name}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            alert.actioned || alert.status === "Resolved"
                              ? "bg-secondary text-muted-foreground border-border"
                              : alert.severity === "Red"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          )}
                        >
                          {alert.source_module}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pl-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground/80">Stalled {alert.stalled_days} days</span>
                          {alert.assigned_to && (
                            <>
                              <span>•</span>
                              <span className="text-primary font-medium">Assigned: {alert.assigned_to}</span>
                            </>
                          )}
                        </div>

                        {alert.actioned || alert.status === "Resolved" ? (
                          <Badge
                            variant="outline"
                            className="bg-success/15 text-success border-success/30 text-[10px] font-semibold py-0.5 px-2 flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" /> Resolved
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActionAlert(alert);
                              setActionAssignee("Pastoral Care Team");
                              setActionNotes("");
                            }}
                            className="h-7 text-xs font-bold rounded-lg border-primary/20 text-primary hover:bg-primary/10 transition-colors"
                          >
                            {alert.action_label || "Take Action"} <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Weekly Home Fellowship Returns & Oversight Monitor                     */}
      {/* ========================================================================= */}
      <Card className="rounded-2xl border-border/60 shadow-soft mt-8 overflow-hidden">
        <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="font-display text-lg flex items-center gap-2 text-primary">
              <Flame className="h-5 w-5 text-gold" />
              Weekly Home Fellowship Returns & Oversight
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Live cell meeting attendance, weekly return submission status, and fellowship offerings across all cells
            </CardDescription>
          </div>

          {/* KPI Chips derived directly from cell_weekly_returns.summary (Single source of truth) */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold bg-background border-border/60">
              Active Cells: <span className="font-bold text-foreground ml-1">{cellSummaryDisplay.active_cells}</span>
            </Badge>
            <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold bg-success/10 text-success border-success/30">
              Submitted: <span className="font-bold ml-1">{cellSummaryDisplay.submitted} ({cellSummaryDisplay.submitted_pct}%)</span>
            </Badge>
            <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold bg-gold/15 text-gold-foreground border-gold/30">
              Pending: <span className="font-bold ml-1">{cellSummaryDisplay.pending}</span>
            </Badge>
            <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold bg-destructive/10 text-destructive border-destructive/30">
              Overdue: <span className="font-bold ml-1">{cellSummaryDisplay.overdue}</span>
            </Badge>
            <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
              Total Offerings: <span className="font-bold ml-1">KES {cellSummaryDisplay.total_offerings.toLocaleString()}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
            </div>
          ) : cellRows.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="font-semibold text-foreground">No cell returns recorded</p>
              <p className="text-xs text-muted-foreground mt-1">There are currently no active cells in the database.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/40">
                  <TableHead className="font-bold text-xs pl-6">Cell Code & Name</TableHead>
                  <TableHead className="font-bold text-xs">Assigned Leader</TableHead>
                  <TableHead className="font-bold text-xs">Meeting Schedule</TableHead>
                  <TableHead className="font-bold text-xs">Return Status</TableHead>
                  <TableHead className="font-bold text-xs text-center">Weekly Turnout</TableHead>
                  <TableHead className="font-bold text-xs text-right">Collected Offering</TableHead>
                  <TableHead className="font-bold text-xs text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cellRows.map((cell) => (
                  <TableRow
                    key={cell.cell_id}
                    className="hover:bg-secondary/20 transition-colors group cursor-pointer"
                  >
                    <TableCell className="font-medium pl-6">
                      <button
                        type="button"
                        onClick={() => setSelectedReturn(cell)}
                        className="text-left group-hover:text-primary transition-colors focus:outline-none focus-visible:underline"
                      >
                        <div className="font-bold text-sm text-foreground group-hover:text-primary flex items-center gap-1.5">
                          <span className="text-primary font-mono text-xs">{cell.code}</span>
                          <span>—</span>
                          <span>{cell.name}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">Meeting Day: {cell.meeting_day}</div>
                      </button>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span className="font-semibold text-foreground">{cell.leader}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{cell.meeting_day}</span> at {cell.meeting_time}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          cell.status === "Submitted"
                            ? "bg-success/15 text-success border-success/30 hover:bg-success/20"
                            : cell.status === "Pending"
                            ? "bg-gold/15 text-gold-foreground border-gold/30 hover:bg-gold/20"
                            : "bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20"
                        )}
                      >
                        {cell.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-display font-bold text-sm text-foreground">{cell.attendance_count}</span>
                    </TableCell>
                    <TableCell className="text-right font-display font-bold text-sm text-foreground">
                      KES {cell.offering_amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReturn(cell)}
                        className="h-7 text-xs font-bold rounded-lg border-primary/20 text-primary hover:bg-primary/10"
                      >
                        Review Return
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* MODAL 1: Interactive Pastoral Action Dialog (Alert Triage)                */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(actionAlert)}
        onOpenChange={(open) => {
          if (!open) {
            setActionAlert(null);
            setActionNotes("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2 text-primary">
              <Send className="h-5 w-5 text-gold" />
              Pastoral Care Intervention
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Dispatch actionable follow-up instructions to ministry leaders and overseers.
            </DialogDescription>
          </DialogHeader>

          {actionAlert && (
            <form onSubmit={handleActionSubmit} className="space-y-4 pt-2">
              {/* Alert Context Summary */}
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">{actionAlert.member_name}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold uppercase",
                      actionAlert.severity === "Red"
                        ? "bg-destructive/10 text-destructive border-destructive/20"
                        : "bg-warning/10 text-warning border-warning/20"
                    )}
                  >
                    {actionAlert.severity} Alert
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Module: <strong className="text-foreground">{actionAlert.source_module}</strong></span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Stalled {alertDaysLabel(actionAlert.stalled_days)}
                  </span>
                </div>
              </div>

              {/* Assignee Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Assign Intervention To
                </label>
                <Select value={actionAssignee} onValueChange={setActionAssignee}>
                  <SelectTrigger className="h-10 rounded-xl border-border/60 bg-background text-sm">
                    <SelectValue placeholder="Select Ministry Assignee" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Pastoral Care Team">Pastoral Care Team</SelectItem>
                    <SelectItem value="Cell Supervisor">Cell Supervisor</SelectItem>
                    <SelectItem value="Assigned Discipler">Assigned Discipler</SelectItem>
                    <SelectItem value="Deacons Board">Deacons Board</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Pastoral Guidance & Intervention Notes
                </label>
                <Textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Provide pastoral instructions, urgent follow-up objectives, or meeting coordination notes..."
                  className="rounded-xl border-border/60 bg-background text-sm min-h-[90px] resize-none"
                  rows={3}
                />
              </div>

              <DialogFooter className="pt-2 flex sm:justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActionAlert(null)}
                  disabled={isSubmittingAction}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="rounded-xl font-bold bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 flex items-center gap-2"
                >
                  {isSubmittingAction ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Action
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: Member 360° Spiritual Journey Milestone Roadmap                  */}
      {/* ========================================================================= */}
      <Dialog open={isRoadmapOpen} onOpenChange={setIsRoadmapOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5 text-gold" />
              Spiritual Milestone Journey Roadmap
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedMember?.name} — End-to-end spiritual development and ecclesiastical milestone tracker.
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="py-4 space-y-6">
              {/* Member Quick Summary */}
              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-base text-foreground">{selectedMember.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Member ID: #{selectedMember.id} • {selectedMember.department}
                  </div>
                </div>
                <Badge className="bg-success/15 text-success border-success/30 font-semibold text-xs">
                  {selectedMember.status}
                </Badge>
              </div>

              {/* Vertical Milestone Timeline */}
              <div className="relative border-l-2 border-border/70 ml-4 space-y-6 pl-6 py-2">
                {/* 1. Salvation & Intake */}
                {(() => {
                  const m1 = selectedMemberMilestones?.salvation_intake;
                  const isDone = m1?.complete;
                  return (
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute -left-[35px] top-0 flex h-6 w-6 items-center justify-center rounded-full shadow-glow",
                          isDone ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground border border-border"
                        )}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-sm text-foreground">
                            1. Salvation & First Contact Intake
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold",
                              isDone ? "bg-success/10 text-success border-success/30" : "bg-secondary text-muted-foreground"
                            )}
                          >
                            {isDone ? "Complete" : "Not Recorded"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs bg-secondary/15 p-2.5 rounded-xl border border-border/40">
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Intake Date</span>
                            <span className="font-medium text-foreground">{m1?.date || "—"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Intake Service</span>
                            <span className="font-medium text-muted-foreground">{m1?.service || "—"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Intake Officer</span>
                            <span className="font-medium text-muted-foreground">{m1?.intake_officer || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Water & Holy Spirit Baptism */}
                {(() => {
                  const m2 = selectedMemberMilestones?.baptism;
                  const isDone = m2?.complete;
                  return (
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute -left-[35px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-border",
                          isDone ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                      </div>
                      <div className={cn(!isDone && "opacity-85")}>
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-sm text-foreground">
                            2. Water & Holy Spirit Baptism
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold",
                              isDone ? "bg-success/10 text-success border-success/30" : "bg-secondary text-muted-foreground"
                            )}
                          >
                            {isDone ? "Complete" : "Not Recorded"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs bg-secondary/15 p-2.5 rounded-xl border border-border/40">
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Baptismal Status</span>
                            <span className="font-medium text-muted-foreground">{m2?.status || "—"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Baptism Date</span>
                            <span className="font-medium text-muted-foreground">{m2?.date || "—"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Officiating Pastor</span>
                            <span className="font-medium text-muted-foreground">{m2?.officiator || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Cell Fellowship Life */}
                {(() => {
                  const m3 = selectedMemberMilestones?.cell_life;
                  const isDone = m3?.complete;
                  return (
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute -left-[35px] top-0 flex h-6 w-6 items-center justify-center rounded-full shadow-glow",
                          isDone ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
                        )}
                      >
                        <Flame className="h-3.5 w-3.5 text-gold" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-sm text-foreground">
                            3. Cell Fellowship Life
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold",
                              isDone ? "bg-success/10 text-success border-success/30" : "bg-secondary text-muted-foreground"
                            )}
                          >
                            {isDone ? "Active" : "Not Recorded"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-2 text-xs bg-secondary/15 p-2.5 rounded-xl border border-border/40">
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Home Cell</span>
                            <span className="font-medium text-foreground">{m3?.cell_name || "—"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Cell Leader</span>
                            <span className="font-medium text-foreground">{m3?.leader || "—"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Active Streak</span>
                            <span className="font-medium text-muted-foreground">
                              {m3?.streak_days !== null && m3?.streak_days !== undefined ? `${m3.streak_days} days` : "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Attendance Rate</span>
                            <span className="font-medium text-muted-foreground">
                              {m3?.attendance_frequency_pct !== null && m3?.attendance_frequency_pct !== undefined ? `${m3.attendance_frequency_pct}%` : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Discipleship Pipeline */}
                {(() => {
                  const m4 = selectedMemberMilestones?.discipleship;
                  const isDone = m4?.complete;
                  return (
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute -left-[35px] top-0 flex h-6 w-6 items-center justify-center rounded-full",
                          isDone
                            ? "bg-gold text-gold-foreground shadow-glow"
                            : "bg-secondary text-muted-foreground border border-border"
                        )}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-sm text-foreground">
                            4. Discipleship Pipeline
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold",
                              isDone ? "bg-success/10 text-success border-success/30" : "bg-secondary text-muted-foreground"
                            )}
                          >
                            {isDone ? "Complete" : "Not Recorded"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-2 text-xs bg-secondary/15 p-2.5 rounded-xl border border-border/40">
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Discipler</span>
                            <span className="font-medium text-muted-foreground">{m4?.discipler_name || "—"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Rubric Score</span>
                            <span className="font-medium text-muted-foreground">
                              {m4?.rubric_score !== null && m4?.rubric_score !== undefined ? `${m4.rubric_score}/100` : "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Completed Sessions</span>
                            <span className="font-medium text-muted-foreground">
                              {m4?.completed_sessions !== null && m4?.completed_sessions !== undefined ? `${m4.completed_sessions}` : "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Total Sessions</span>
                            <span className="font-medium text-muted-foreground">
                              {m4?.total_sessions !== null && m4?.total_sessions !== undefined ? `${m4.total_sessions}` : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 5. Leadership Academy (LMS) */}
                {(() => {
                  const m5 = selectedMemberMilestones?.lms;
                  const isDone = m5?.complete;
                  return (
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute -left-[35px] top-0 flex h-6 w-6 items-center justify-center rounded-full",
                          isDone
                            ? "bg-success text-success-foreground"
                            : m5?.track
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : "bg-secondary text-muted-foreground border border-border"
                        )}
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-sm text-foreground">
                            5. Leadership Academy (LMS)
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold",
                              isDone
                                ? "bg-success/15 text-success border-success/30"
                                : m5?.track
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-secondary text-muted-foreground"
                            )}
                          >
                            {isDone ? "Graduated" : m5?.track ? "In Training" : "Not Recorded"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-2 text-xs bg-secondary/15 p-2.5 rounded-xl border border-border/40">
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Enrolled Track</span>
                            <span className="font-medium text-foreground">{m5?.track || "—"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Modules Completed</span>
                            <span className="font-medium text-muted-foreground">
                              {m5?.modules_completed !== null && m5?.modules_completed !== undefined ? `${m5.modules_completed}` : "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Total Modules</span>
                            <span className="font-medium text-muted-foreground">
                              {m5?.modules_total !== null && m5?.modules_total !== undefined ? `${m5.modules_total}` : "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Practical Score</span>
                            <span className="font-medium text-muted-foreground">
                              {m5?.practical_score !== null && m5?.practical_score !== undefined ? `${m5.practical_score}%` : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 6. Ministry Commissioning */}
                {(() => {
                  const m6 = selectedMemberMilestones?.commissioning;
                  const isDone = m6?.complete;
                  return (
                    <div className="relative">
                      <div
                        className={cn(
                          "absolute -left-[35px] top-0 flex h-6 w-6 items-center justify-center rounded-full",
                          isDone
                            ? "bg-primary text-primary-foreground shadow-glow"
                            : "bg-secondary text-muted-foreground border border-border"
                        )}
                      >
                        <Building className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-sm text-foreground">
                            6. Ministry Commissioning
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold",
                              isDone ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-muted-foreground"
                            )}
                          >
                            {isDone ? "Commissioned" : "Not Recorded"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs bg-secondary/15 p-2.5 rounded-xl border border-border/40">
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Commission Date</span>
                            <span className="font-medium text-muted-foreground">{m6?.date || "—"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Ordained Role</span>
                            <span className="font-medium text-muted-foreground">{m6?.ordained_role || "—"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Department Placement</span>
                            <span className="font-medium text-foreground">{m6?.department || "—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsRoadmapOpen(false)} className="rounded-xl w-full sm:w-auto">
              Close Roadmap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: Review Cell Weekly Return Modal                                  */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(selectedReturn)}
        onOpenChange={(open) => {
          if (!open) setSelectedReturn(null);
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5 text-gold" />
              Weekly Return: {selectedReturn?.code} — {selectedReturn?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Leader: {selectedReturn?.leader} ({selectedReturn?.meeting_day} at {selectedReturn?.meeting_time})
            </DialogDescription>
          </DialogHeader>

          {selectedReturn && (
            <div className="space-y-4 pt-2">
              {/* Return Status Indicator */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-secondary/20">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Submission Status
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-bold uppercase",
                    selectedReturn.status === "Submitted"
                      ? "bg-success/15 text-success border-success/30"
                      : selectedReturn.status === "Pending"
                      ? "bg-gold/15 text-gold-foreground border-gold/30"
                      : "bg-destructive/15 text-destructive border-destructive/30"
                  )}
                >
                  {selectedReturn.status}
                </Badge>
              </div>

              {selectedReturn.status === "Submitted" ? (
                <>
                  {/* Attendance & Offering Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-border/50 bg-secondary/15 text-center">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                        Turnout
                      </span>
                      <span className="font-display font-black text-xl text-foreground">
                        {selectedReturn.attendance_count}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl border border-border/50 bg-secondary/15 text-center">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                        Offering
                      </span>
                      <span className="font-display font-black text-sm sm:text-base text-foreground mt-1 block">
                        KES {selectedReturn.offering_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Weekly Topic / Scripture */}
                  <div className="rounded-xl border border-border/60 bg-secondary/10 p-3 space-y-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                      Weekly Discussion Topic & Scripture Focus
                    </span>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      {selectedReturn.topic || "—"}
                    </p>
                    {selectedReturn.scripture && (
                      <p className="text-xs text-muted-foreground">Scripture: {selectedReturn.scripture}</p>
                    )}
                  </div>

                  {/* Prayer Requests */}
                  <div className="rounded-xl border border-border/60 bg-secondary/10 p-3 space-y-1">
                    <span className="text-[10px] font-bold text-gold-foreground uppercase tracking-wider block">
                      Cell Prayer Requests & Praise Items
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedReturn.prayer_requests || "—"}
                    </p>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-right">
                    Report filed on: <span className="font-semibold text-foreground">{selectedReturn.submitted_at || "—"}</span>
                  </p>
                </>
              ) : (
                <div className="p-6 text-center space-y-3 rounded-xl border border-dashed border-border/70 bg-secondary/10">
                  <AlertTriangle
                    className={cn(
                      "h-10 w-10 mx-auto",
                      selectedReturn.status === "Overdue" ? "text-destructive" : "text-gold"
                    )}
                  />
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-foreground">
                      No return submitted yet for this weekly cycle
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedReturn.status === "Overdue"
                        ? "This cell report is overdue. Urgent pastoral contact is advised."
                        : "The cell leader has not submitted the weekly fellowship attendance and offering return yet."}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      toast.success(`Reminder notification sent to ${selectedReturn.leader}.`);
                      setSelectedReturn(null);
                    }}
                    className="h-8 rounded-lg text-xs font-bold bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 mt-2"
                  >
                    Send Prompt Reminder to Leader
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button onClick={() => setSelectedReturn(null)} className="rounded-xl w-full sm:w-auto">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function alertDaysLabel(days: number | string): string {
  if (typeof days === "string") {
    return days.includes("ago") ? days : `${days} days ago`;
  }
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}
