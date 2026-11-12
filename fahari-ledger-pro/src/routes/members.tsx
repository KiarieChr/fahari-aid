import { createFileRoute, useRouterState, useNavigate, Link } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Users,
  UserPlus,
  GitBranch,
  TrendingUp,
  Sparkles,
  Search,
  Phone,
  Mail,
  Calendar,
  Download,
  AlertTriangle,
  Flame,
  BarChart3,
  RefreshCw,
  Plus,
  Heart,
  Briefcase,
  X,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Link2,
  UserCheck,
  Building2,
  MapPin,
  Check,
  ShieldCheck,
  UserX,
  HelpCircle,
  FileDown,
  Loader2,
} from "lucide-react";
import { downloadPdf } from "@/api/pdf";
import {
  AreaChart,
  Area,
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
import { Label } from "@/components/ui/label";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiCall, ApiError, getAccessToken } from "@/api/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members & Growth Hub — J.E.N Church ERP" },
      {
        name: "description",
        content: "Track membership growth trajectories, department distribution, committed guests, and cell assimilation.",
      },
    ],
  }),
  component: MembersHubPage,
});

// ============================================================================
// TypeScript Interfaces (Strictly mirrors Django API Payloads, no `any`)
// ============================================================================

export interface PeakMonthInfo {
  label: string;
  count: number;
}

export interface MembersKpis {
  total_members: number;
  active_members: number;
  new_last_30_days: number;
  assigned_cell_count: number;
  unassigned_cell_count: number;
  cell_assimilation_pct: number;
  avg_monthly_registrations: number;
  peak_month: PeakMonthInfo;
}

export interface GrowthTimelineItem {
  month: string;
  label: string;
  count: number;
}

export interface CellDistributionItem {
  cell_id: number | null;
  cell_name: string;
  count: number;
  pct: number;
}

export interface DepartmentDistributionItem {
  dept_name: string;
  count: number;
  pct: number;
}

export interface DemographicDistributionItem {
  label: string;
  count: number;
}

export interface RecentMemberItem {
  id: number;
  member_id: number;
  full_name: string;
  cell_name: string;
  phone: string;
  email: string;
  joined_on: string;
  is_new: boolean;
}

export interface InsightsData {
  peak_month: { label: string; count: number };
  cell_integration: { pct: number; unassigned_count: number };
  dept_engagement: { pct: number; unassigned_count: number };
}

export interface CommittedKpis {
  regular_total: number;
  committed_total: number;
  committed_linked: number;
  committed_unlinked: number;
}

export interface MembersAnalyticsPayload {
  kpis: MembersKpis;
  growth_timeline: GrowthTimelineItem[];
  cells_distribution: CellDistributionItem[];
  departments_distribution: DepartmentDistributionItem[];
  gender_distribution: DemographicDistributionItem[];
  marital_distribution: DemographicDistributionItem[];
  employment_distribution: DemographicDistributionItem[];
  insights: InsightsData;
  committed_kpis: CommittedKpis;
  recent_members: RecentMemberItem[];
}

export interface MemberListItem {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  phone_no: string;
  email: string;
  gender: string;
  marital: string;
  emp_status: string;
  bod: string | null;
  address: string | null;
  location: string | null;
  cell_id: number | null;
  cell_name: string;
  department_id: number | null;
  department: string | null;
  department_name?: string;
  delete_status: string;
  joined_on: string;
  joined_on_formatted?: string;
  is_new?: boolean;
}

export interface MonthDrilldownMember {
  id: number;
  full_name: string;
  email: string;
  phone_no: string;
  cell_name: string;
  joined_on_formatted: string;
  department_name?: string;
}

export interface CommittedMemberItem {
  id: number;
  member_id: number | null;
  full_name: string;
  phone: string;
  email: string;
  residence: string;
  committed_on: string | null;
  committed_on_formatted: string;
  created_at: string;
  created_at_formatted: string;
  linked_member_name: string | null;
  member_email: string | null;
  member_phone: string | null;
}

export interface MemberProfileAttendance {
  attended_count: number;
  total_meetings: number;
  attendance_rate: number;
  status_label: "Regular" | "Irregular" | "Needs Follow-up";
}

export interface MemberProfileDetail {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  photo: string | null;
  department: string | null;
  joined_on: string | null;
  joined_on_formatted: string;
  email: string;
  phone_no: string;
  location: string | null;
  gender: string;
  marital: string;
  emp_status: string;
  cell_code: string;
  cell_name: string;
  attendance: MemberProfileAttendance;
}

export interface MemberSearchResult {
  id: number;
  full_name: string;
  phone_no: string;
  email: string;
  department: string | null;
}

export interface PaginatedMembersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MemberListItem[];
}

interface RegisterMemberFormData {
  first_name: string;
  last_name: string;
  phone_no: string;
  email: string;
  gender: string;
  marital: string;
  emp_status: string;
  department_id: string;
  cell_id: string;
  joined_on: string;
  location: string;
}

interface CommitmentFormData {
  member_id: number | null;
  full_name: string;
  phone: string;
  email: string;
  residence: string;
  committed_on: string;
}

const CELL_PALETTE = [
  "oklch(0.38 0.16 250)", // Royal Sapphire
  "oklch(0.72 0.14 75)",  // Warm Gold
  "oklch(0.55 0.17 145)", // Emerald
  "oklch(0.65 0.16 35)",  // Amber
  "oklch(0.52 0.16 285)", // Amethyst Purple
  "oklch(0.60 0.13 210)", // Teal
];
const UNASSIGNED_COLOR = "oklch(0.55 0.02 260)";

// Helper: Deterministic color for initials avatar
function getAvatarColor(id: number): string {
  const colors = [
    "bg-blue-600 text-white",
    "bg-indigo-600 text-white",
    "bg-purple-600 text-white",
    "bg-emerald-600 text-white",
    "bg-amber-600 text-white",
    "bg-rose-600 text-white",
    "bg-cyan-600 text-white",
  ];
  return colors[id % colors.length];
}

function MembersHubPage() {
  const routerLocation = useRouterState({ select: (s) => s.location });
  const navigate = useNavigate();

  // Search parameters derived from URL (individual direct sidebar links)
  const searchParams = useMemo(() => {
    return (routerLocation.search || {}) as Record<string, string | undefined>;
  }, [routerLocation.search]);

  // View state: 'analytics' | 'directory' | 'committed'
  const activeView =
    searchParams.view === "committed"
      ? "committed"
      : searchParams.view === "directory"
      ? "directory"
      : "analytics";

  // Analytics State
  const [analytics, setAnalytics] = useState<MembersAnalyticsPayload | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Directory State
  const [membersList, setMembersList] = useState<MemberListItem[]>([]);
  const [totalDirectoryCount, setTotalDirectoryCount] = useState<number>(0);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState<boolean>(true);
  const [directoryError, setDirectoryError] = useState<string | null>(null);

  // Committed Guests State
  const [committedList, setCommittedList] = useState<CommittedMemberItem[]>([]);
  const [isLoadingCommitted, setIsLoadingCommitted] = useState<boolean>(false);
  const [committedError, setCommittedError] = useState<string | null>(null);
  const [committedFilterStatus, setCommittedFilterStatus] = useState<"all" | "linked" | "unlinked">("all");
  const [committedSearchQuery, setCommittedSearchQuery] = useState<string>("");

  // Directory Filter States
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [cellFilter, setCellFilter] = useState<string>(searchParams.cell_id || "all");
  const [monthFilter, setMonthFilter] = useState<string>(searchParams.month || "all");
  const [page, setPage] = useState<number>(1);
  const [isExportingCSV, setIsExportingCSV] = useState<boolean>(false);

  // Register Member Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [newMemberForm, setNewMemberForm] = useState<RegisterMemberFormData>({
    first_name: "",
    last_name: "",
    phone_no: "",
    email: "",
    gender: "Male",
    marital: "Single",
    emp_status: "Student",
    department_id: "0",
    cell_id: "0",
    joined_on: new Date().toISOString().split("T")[0],
    location: "",
  });

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<MemberListItem | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  // Drilldown Modal State
  const [drilldownMonth, setDrilldownMonth] = useState<{ month: string; label: string } | null>(null);
  const [drilldownMembers, setDrilldownMembers] = useState<MonthDrilldownMember[]>([]);
  const [isLoadingDrilldown, setIsLoadingDrilldown] = useState<boolean>(false);
  const [drilldownSearch, setDrilldownSearch] = useState<string>("");

  // Member Profile Offcanvas State
  const [profileOffcanvasId, setProfileOffcanvasId] = useState<number | null>(null);
  const [profileDetail, setProfileDetail] = useState<MemberProfileDetail | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  const [downloadingMemberPdf, setDownloadingMemberPdf] = useState<boolean>(false);

  const handleDownloadMemberPdf = async (memberId: number) => {
    try {
      setDownloadingMemberPdf(true);
      await downloadPdf(`/members/${memberId}/profile/pdf/`, `member_profile_${memberId}.pdf`);
      toast.success("Member Dossier (PDF) downloaded successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to download member profile PDF");
    } finally {
      setDownloadingMemberPdf(false);
    }
  };

  // Commitment Modal (Add Commitment / Add Guest)
  const [isCommitmentModalOpen, setIsCommitmentModalOpen] = useState<boolean>(false);
  const [isSubmittingCommitment, setIsSubmittingCommitment] = useState<boolean>(false);
  const [commitmentForm, setCommitmentForm] = useState<CommitmentFormData>({
    member_id: null,
    full_name: "",
    phone: "",
    email: "",
    residence: "",
    committed_on: new Date().toISOString().split("T")[0],
  });

  // Committed Details Modal (Inspect)
  const [viewingCommitted, setViewingCommitted] = useState<CommittedMemberItem | null>(null);

  // Link to Member Modal State
  const [linkingGuest, setLinkingGuest] = useState<CommittedMemberItem | null>(null);
  const [memberSearchTerm, setMemberSearchTerm] = useState<string>("");
  const [memberSearchResults, setMemberSearchResults] = useState<MemberSearchResult[]>([]);
  const [isSearchingMembers, setIsSearchingMembers] = useState<boolean>(false);
  const [selectedMemberToLink, setSelectedMemberToLink] = useState<number | null>(null);
  const [isSubmittingLink, setIsSubmittingLink] = useState<boolean>(false);

  // Delete Committed Guest Dialog
  const [deletingGuest, setDeletingGuest] = useState<CommittedMemberItem | null>(null);
  const [isDeletingGuest, setIsDeletingGuest] = useState<boolean>(false);

  // Quick Inspect Modal (legacy fallback)
  const [inspectedMember, setInspectedMember] = useState<MemberListItem | null>(null);

  // Sync action=register from URL
  useEffect(() => {
    if (searchParams.action === "register") {
      setIsRegisterOpen(true);
    } else if (searchParams.action === "add-guest") {
      setCommitmentForm({
        member_id: null,
        full_name: "",
        phone: "",
        email: "",
        residence: "",
        committed_on: new Date().toISOString().split("T")[0],
      });
      setIsCommitmentModalOpen(true);
    }
  }, [searchParams.action]);

  // Sync cell_id and month from URL
  useEffect(() => {
    if (searchParams.cell_id && searchParams.cell_id !== cellFilter) {
      setCellFilter(searchParams.cell_id);
    }
  }, [searchParams.cell_id]);

  useEffect(() => {
    if (searchParams.month && searchParams.month !== monthFilter) {
      setMonthFilter(searchParams.month);
    }
  }, [searchParams.month]);

  // Debounce directory search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Analytics Data
  const fetchAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const res = await apiCall<MembersAnalyticsPayload>("/members/analytics/");
      if (res) {
        setAnalytics(res);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load growth analytics from server.";
      setAnalyticsError(msg);
      toast.error("Failed to load membership analytics");
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  // Fetch Directory List
  const fetchDirectory = useCallback(
    async (targetPage = 1, currentQ = debouncedSearch, currentCell = cellFilter, currentMonth = monthFilter) => {
      setIsLoadingDirectory(true);
      setDirectoryError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(targetPage));
        if (currentQ) params.set("q", currentQ);
        if (currentCell !== "all") params.set("cell_id", currentCell);
        if (currentMonth !== "all") params.set("month", currentMonth);

        const res = await apiCall<PaginatedMembersResponse>(`/members/?${params.toString()}`);
        if (res && res.results) {
          setMembersList(res.results);
          setTotalDirectoryCount(res.count);
          setPage(targetPage);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load directory records from server.";
        setDirectoryError(msg);
        toast.error("Failed to load member records");
      } finally {
        setIsLoadingDirectory(false);
      }
    },
    [debouncedSearch, cellFilter, monthFilter]
  );

  // Fetch Committed Guests
  const fetchCommitted = useCallback(async () => {
    setIsLoadingCommitted(true);
    setCommittedError(null);
    try {
      const res = await apiCall<CommittedMemberItem[]>("/members/committed/");
      if (res && Array.isArray(res)) {
        setCommittedList(res);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load committed guests.";
      setCommittedError(msg);
      toast.error("Failed to load committed guests list");
    } finally {
      setIsLoadingCommitted(false);
    }
  }, []);

  // Initial load
  const initialLoadRef = useRef(false);
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchAnalytics();
      fetchDirectory(1, "", searchParams.cell_id || "all", searchParams.month || "all");
      fetchCommitted();
    }
  }, [fetchAnalytics, fetchDirectory, fetchCommitted, searchParams.cell_id, searchParams.month]);

  // Subsequent directory filter updates
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchDirectory(1, debouncedSearch, cellFilter, monthFilter);
  }, [debouncedSearch, cellFilter, monthFilter, fetchDirectory]);

  // Profile Offcanvas Loader
  useEffect(() => {
    if (profileOffcanvasId === null) {
      setProfileDetail(null);
      return;
    }
    let isCancelled = false;
    setIsLoadingProfile(true);
    apiCall<MemberProfileDetail>(`/members/${profileOffcanvasId}/profile/`)
      .then((data) => {
        if (!isCancelled && data) {
          setProfileDetail(data);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          toast.error("Failed to load member profile details");
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingProfile(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [profileOffcanvasId]);

  // Drilldown loader
  const handleOpenDrilldown = async (monthKey: string, label: string) => {
    setDrilldownMonth({ month: monthKey, label });
    setDrilldownSearch("");
    setIsLoadingDrilldown(true);
    try {
      const res = await apiCall<MonthDrilldownMember[]>(`/members/?month=${monthKey}&all=true`);
      if (res && Array.isArray(res)) {
        setDrilldownMembers(res);
      } else {
        setDrilldownMembers([]);
      }
    } catch (_err) {
      toast.error("Failed to load drilldown member roster");
      setDrilldownMembers([]);
    } finally {
      setIsLoadingDrilldown(false);
    }
  };

  // Live member search for linking
  useEffect(() => {
    if (!linkingGuest || memberSearchTerm.trim().length < 3) {
      setMemberSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingMembers(true);
      try {
        const res = await apiCall<MemberSearchResult[]>(`/members/search/?q=${encodeURIComponent(memberSearchTerm.trim())}`);
        if (res && Array.isArray(res)) {
          setMemberSearchResults(res);
        }
      } catch (_err) {
        // quiet error
      } finally {
        setIsSearchingMembers(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [linkingGuest, memberSearchTerm]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setCellFilter("all");
    setMonthFilter("all");
    setPage(1);
    navigate({
      to: "/members",
      search: { view: activeView },
    });
  };

  // CSV Export hitting real backend endpoint
  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (cellFilter !== "all") params.set("cell_id", cellFilter);
      if (monthFilter !== "all") params.set("month", monthFilter);

      const envBase = import.meta.env.VITE_API_BASE as string | undefined;
      const baseUrl = (envBase && envBase.trim().length > 0 ? envBase : "http://localhost:8000/api").replace(/\/$/, "");
      const token = getAccessToken();

      const response = await fetch(`${baseUrl}/members/export/?${params.toString()}`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Export failed with HTTP status ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `JEN_Members_Roster_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);

      toast.success("CSV export downloaded successfully.");
    } catch (_err) {
      toast.error("Failed to download CSV export. Please try again.");
    } finally {
      setIsExportingCSV(false);
    }
  };

  // Member Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNew(true);
    setFieldErrors({});

    try {
      const payload: Record<string, string | number | null> = {
        first_name: newMemberForm.first_name.trim(),
        last_name: newMemberForm.last_name.trim(),
        phone_no: newMemberForm.phone_no.trim(),
        gender: newMemberForm.gender,
        joined_on: newMemberForm.joined_on || null,
      };

      if (newMemberForm.email.trim()) {
        payload.email = newMemberForm.email.trim();
      }
      if (newMemberForm.marital) {
        payload.marital = newMemberForm.marital.toLowerCase();
      }
      if (newMemberForm.emp_status) {
        payload.emp_status = newMemberForm.emp_status.toLowerCase();
      }
      if (newMemberForm.location.trim()) {
        payload.location = newMemberForm.location.trim();
      }
      if (newMemberForm.cell_id && newMemberForm.cell_id !== "0") {
        payload.cell_id = parseInt(newMemberForm.cell_id, 10);
      } else {
        payload.cell_id = null;
      }
      if (newMemberForm.department_id && newMemberForm.department_id !== "0") {
        payload.department_id = parseInt(newMemberForm.department_id, 10);
      }

      const res = await apiCall<{ id: number; full_name: string }>("/members/", {
        method: "POST",
        body: payload,
      });

      if (res) {
        toast.success(`Member registered successfully!`);
        setIsRegisterOpen(false);
        setNewMemberForm({
          first_name: "",
          last_name: "",
          phone_no: "",
          email: "",
          gender: "Male",
          marital: "Single",
          emp_status: "Student",
          department_id: "0",
          cell_id: "0",
          joined_on: new Date().toISOString().split("T")[0],
          location: "",
        });
        if (searchParams.action === "register") {
          navigate({
            to: "/members",
            search: { view: activeView },
          });
        }
        fetchDirectory(1);
        fetchAnalytics();
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 400 && typeof err.data === "object" && err.data !== null) {
        const errorRecord = err.data as Record<string, string[]>;
        setFieldErrors(errorRecord);
        toast.error("Please correct the highlighted form errors.");
      } else {
        const msg = err instanceof Error ? err.message : "Failed to register member.";
        toast.error(msg);
      }
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Member Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setIsSubmittingEdit(true);

    try {
      const payload: Record<string, string | number | null> = {
        first_name: editingMember.first_name,
        last_name: editingMember.last_name,
        phone_no: editingMember.phone_no || editingMember.phone_number,
        email: editingMember.email,
        gender: editingMember.gender,
        marital: editingMember.marital,
        emp_status: editingMember.emp_status,
        location: editingMember.location,
        cell_id: editingMember.cell_id,
        department_id: editingMember.department_id,
      };

      await apiCall(`/members/${editingMember.id}/`, {
        method: "PATCH",
        body: payload,
      });

      toast.success("Member record updated successfully");
      setEditingMember(null);
      fetchDirectory(page);
      fetchAnalytics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update member.";
      toast.error(msg);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Commitment Form Submit (Save commitment / guest)
  const handleCommitmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCommitment(true);
    try {
      const payload = {
        member_id: commitmentForm.member_id,
        full_name: commitmentForm.full_name.trim(),
        phone: commitmentForm.phone.trim(),
        email: commitmentForm.email.trim(),
        residence: commitmentForm.residence.trim(),
        committed_on: commitmentForm.committed_on || undefined,
      };

      await apiCall("/members/committed/", {
        method: "POST",
        body: payload,
      });

      toast.success("Commitment saved successfully!");
      setIsCommitmentModalOpen(false);
      setCommitmentForm({
        member_id: null,
        full_name: "",
        phone: "",
        email: "",
        residence: "",
        committed_on: new Date().toISOString().split("T")[0],
      });
      if (searchParams.action === "add-guest") {
        navigate({
          to: "/members",
          search: { view: activeView },
        });
      }
      fetchCommitted();
      fetchAnalytics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save commitment record.";
      toast.error(msg);
    } finally {
      setIsSubmittingCommitment(false);
    }
  };

  // Link Committed Guest to Member Submit
  const handleLinkGuestSubmit = async () => {
    if (!linkingGuest || !selectedMemberToLink) return;
    setIsSubmittingLink(true);
    try {
      await apiCall(`/members/committed/${linkingGuest.id}/link/`, {
        method: "POST",
        body: { member_id: selectedMemberToLink },
      });
      toast.success("Guest successfully linked to congregation member profile!");
      setLinkingGuest(null);
      setSelectedMemberToLink(null);
      setMemberSearchTerm("");
      fetchCommitted();
      fetchAnalytics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to link member.";
      toast.error(msg);
    } finally {
      setIsSubmittingLink(false);
    }
  };

  // Delete Committed Guest Submit
  const handleDeleteGuestSubmit = async () => {
    if (!deletingGuest) return;
    setIsDeletingGuest(true);
    try {
      await apiCall(`/members/committed/${deletingGuest.id}/`, {
        method: "DELETE",
      });
      toast.success("Committed record removed.");
      setDeletingGuest(null);
      fetchCommitted();
      fetchAnalytics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete record.";
      toast.error(msg);
    } finally {
      setIsDeletingGuest(false);
    }
  };

  // Filtered drilldown list based on live text search
  const filteredDrilldownMembers = useMemo(() => {
    if (!drilldownSearch.trim()) return drilldownMembers;
    const q = drilldownSearch.toLowerCase();
    return drilldownMembers.filter(
      (m) =>
        m.full_name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone_no.toLowerCase().includes(q) ||
        m.cell_name.toLowerCase().includes(q)
    );
  }, [drilldownMembers, drilldownSearch]);

  // Filtered committed list
  const filteredCommittedList = useMemo(() => {
    return committedList.filter((item) => {
      if (committedFilterStatus === "linked" && !item.member_id) return false;
      if (committedFilterStatus === "unlinked" && item.member_id) return false;
      if (committedSearchQuery.trim()) {
        const q = committedSearchQuery.toLowerCase();
        return (
          item.full_name.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.residence.toLowerCase().includes(q) ||
          (item.linked_member_name && item.linked_member_name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [committedList, committedFilterStatus, committedSearchQuery]);

  // Demographics lists
  const demographicLists = useMemo(() => {
    if (!analytics) return { marital: [], employment: [] };
    const total = analytics.kpis.total_members || 1;

    const marital = [...analytics.marital_distribution]
      .sort((a, b) => b.count - a.count)
      .map((item) => ({
        label: item.label,
        count: item.count,
        pct: Number(((item.count / total) * 100).toFixed(1)),
      }));

    const employment = [...analytics.employment_distribution]
      .sort((a, b) => b.count - a.count)
      .map((item) => ({
        label: item.label,
        count: item.count,
        pct: Number(((item.count / total) * 100).toFixed(1)),
      }));

    return { marital, employment };
  }, [analytics]);

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-[1600px] animate-in fade-in duration-300 pb-16">
        {/* ===================================================================== */}
        {/* PAGE HEADER & ACTION TOOLBAR (URL DRIVEN)                             */}
        {/* ===================================================================== */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <PageHeader
            title={
              activeView === "analytics"
                ? "Growth Analytics & Overview"
                : activeView === "committed"
                ? "Committed Members & Guests"
                : "Members Directory"
            }
            description={
              activeView === "analytics"
                ? "Live database metrics tracking intake trajectories, department representation, and cell assimilation."
                : activeView === "committed"
                ? "Track committed visitors, record commitments, and link guest profiles directly to registered members."
                : "Manage congregational membership records, category assignments, and contact profiles."
            }
            className="mb-0"
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchAnalytics();
                fetchDirectory(page);
                fetchCommitted();
              }}
              disabled={isLoadingAnalytics || isLoadingDirectory || isLoadingCommitted}
              className="h-9 rounded-xl border-border/70 hover:bg-secondary/40 text-xs font-semibold"
            >
              <RefreshCw
                className={cn(
                  "h-3.5 w-3.5 mr-1.5",
                  (isLoadingAnalytics || isLoadingDirectory || isLoadingCommitted) && "animate-spin"
                )}
              />
              Refresh Data
            </Button>

            {/* View Switch CTAs */}
            {activeView === "analytics" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/members", search: { view: "directory" } })}
                className="h-9 rounded-xl border-primary/30 text-primary hover:bg-primary/10 text-xs font-semibold"
              >
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Directory View
              </Button>
            )}

            {/* Action Toolbar buttons for Directory view */}
            {activeView === "directory" && (
              <>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="h-9 rounded-xl border-border/60 text-xs text-muted-foreground opacity-60 cursor-not-allowed"
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Upload Excel
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Coming soon — tracked as a gap
                  </TooltipContent>
                </UITooltip>

                <UITooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="h-9 rounded-xl border-border/60 text-xs text-muted-foreground opacity-60 cursor-not-allowed"
                      >
                        <Building2 className="h-3.5 w-3.5 mr-1.5" />
                        New Category
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Coming soon — category management
                  </TooltipContent>
                </UITooltip>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-9 rounded-xl border-border/60 text-xs hover:bg-secondary/40"
                >
                  <Link to="/cells">
                    <GitBranch className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Cell Groups Directory
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCommitmentForm({
                      member_id: null,
                      full_name: "",
                      phone: "",
                      email: "",
                      residence: "",
                      committed_on: new Date().toISOString().split("T")[0],
                    });
                    setIsCommitmentModalOpen(true);
                  }}
                  className="h-9 rounded-xl border-gold/40 text-gold-foreground hover:bg-gold/10 text-xs font-semibold"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1.5 text-gold" />
                  Add Committed Guest
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={isExportingCSV || totalDirectoryCount === 0}
                  className="h-9 rounded-xl border-border/70 hover:bg-secondary/40 text-xs font-semibold"
                >
                  <Download className={cn("h-3.5 w-3.5 mr-1.5", isExportingCSV && "animate-spin")} />
                  {isExportingCSV ? "Exporting..." : "Export CSV"}
                </Button>
              </>
            )}

            {/* Committed View Actions */}
            {activeView === "committed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCommitmentForm({
                    member_id: null,
                    full_name: "",
                    phone: "",
                    email: "",
                    residence: "",
                    committed_on: new Date().toISOString().split("T")[0],
                  });
                  setIsCommitmentModalOpen(true);
                }}
                className="h-9 rounded-xl border-primary/30 text-primary hover:bg-primary/10 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Committed Guest
              </Button>
            )}

            {/* Primary Action Button: New Member */}
            <Button
              onClick={() => setIsRegisterOpen(true)}
              className="h-9 rounded-xl font-bold bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 text-xs px-3.5"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              New Member
            </Button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* VIEW 1: GROWTH ANALYTICS & ASSIMILATION (members_dashboard.php)       */}
        {/* ===================================================================== */}
        {activeView === "analytics" && (
          <div className="space-y-6">
            {isLoadingAnalytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-80 rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Skeleton className="h-72 rounded-2xl" />
                  <Skeleton className="h-72 rounded-2xl" />
                </div>
              </div>
            ) : analyticsError ? (
              <Card className="rounded-2xl border-destructive/30 bg-destructive/5 p-8 text-center space-y-4">
                <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
                <div>
                  <h3 className="font-bold text-foreground">Failed to load analytics</h3>
                  <p className="text-xs text-muted-foreground mt-1">{analyticsError}</p>
                </div>
                <Button onClick={() => fetchAnalytics()} variant="outline" className="rounded-xl text-xs">
                  Retry Connection
                </Button>
              </Card>
            ) : !analytics || analytics.kpis.total_members === 0 ? (
              <Card className="rounded-2xl border-border/60 p-12 text-center space-y-3">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <h3 className="font-bold text-foreground text-base">No member records yet</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  No congregational records were found in the database. Start by adding members through the New
                  Member button.
                </p>
              </Card>
            ) : (
              <>
                {/* Hero Banner with CTA */}
                <Card className="rounded-2xl border-border/60 shadow-soft bg-gradient-to-r from-primary/10 via-background to-secondary/30 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground font-bold text-[10px]">
                        Legacy Parity
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">Congregational Growth Hub</span>
                    </div>
                    <h2 className="text-xl font-black font-display text-foreground">
                      Membership Insights & Assimilation Performance
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-xl">
                      Real-time aggregates across member registrations, department integration, and home cell coverage.
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate({ to: "/members", search: { view: "directory" } })}
                    className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 text-xs shrink-0"
                  >
                    Directory View <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Card>

                {/* Top 4 KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Total Members */}
                  <Card className="rounded-2xl border-border/60 shadow-soft p-5 transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Total Members
                        </p>
                        <h3 className="font-display text-3xl font-black text-foreground mt-1">
                          {analytics.kpis.total_members}
                        </h3>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold mt-2">
                          Active Database Intake
                        </Badge>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-glow">
                        <Users className="h-6 w-6" />
                      </div>
                    </div>
                  </Card>

                  {/* 2. New Registrations (30d) */}
                  <Card className="rounded-2xl border-border/60 shadow-soft p-5 transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          New Registrations (30d)
                        </p>
                        <h3 className="font-display text-3xl font-black text-foreground mt-1">
                          {analytics.kpis.new_last_30_days}
                        </h3>
                        <span className="text-[10px] text-muted-foreground block mt-2 font-medium">
                          Recent intake window
                        </span>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <UserPlus className="h-6 w-6" />
                      </div>
                    </div>
                  </Card>

                  {/* 3. Cell Assimilation % */}
                  <Card className="rounded-2xl border-border/60 shadow-soft p-5 transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Cell Assimilation %
                        </p>
                        <h3 className="font-display text-3xl font-black text-primary mt-1">
                          {analytics.kpis.cell_assimilation_pct}%
                        </h3>
                        <span className="text-[10px] text-muted-foreground block mt-2 font-medium">
                          {analytics.kpis.assigned_cell_count} assigned • {analytics.kpis.unassigned_cell_count} pending
                        </span>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <GitBranch className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-secondary/50 rounded-full mt-3 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-700"
                        style={{ width: `${Math.min(analytics.kpis.cell_assimilation_pct, 100)}%` }}
                      />
                    </div>
                  </Card>

                  {/* 4. Average Growth */}
                  <Card className="rounded-2xl border-border/60 shadow-soft p-5 transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Average Growth
                        </p>
                        <h3 className="font-display text-3xl font-black text-foreground mt-1">
                          {analytics.kpis.avg_monthly_registrations}
                          <span className="text-xs font-normal text-muted-foreground ml-1">/ mo</span>
                        </h3>
                        <span className="text-[10px] text-muted-foreground block mt-2 font-medium">
                          Monthly intake average
                        </span>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Growth Timeline Chart (Interactive click-to-drilldown) */}
                <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                        <TrendingUp className="h-5 w-5 text-gold" />
                        Monthly Member Growth Timeline
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Click any point on the growth timeline to open the drilldown roster for that month.
                      </CardDescription>
                    </div>
                    {analytics.insights?.peak_month && (
                      <Badge variant="outline" className="text-[10px] bg-secondary/50 font-bold">
                        Peak: {analytics.insights.peak_month.label} ({analytics.insights.peak_month.count})
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    {analytics.growth_timeline.length === 0 ? (
                      <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
                        No monthly registration timeline data recorded.
                      </div>
                    ) : (
                      <div className="w-full h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={analytics.growth_timeline}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            onClick={(e) => {
                              if (e && e.activePayload && e.activePayload[0]) {
                                const item = e.activePayload[0].payload as GrowthTimelineItem;
                                handleOpenDrilldown(item.month, item.label);
                              }
                            }}
                          >
                            <defs>
                              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="oklch(0.38 0.16 250)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="oklch(0.38 0.16 250)" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <XAxis
                              dataKey="label"
                              stroke="oklch(0.5 0.03 260)"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="oklch(0.5 0.03 260)"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "oklch(1 0 0)",
                                border: "1px solid oklch(0.92 0.01 260)",
                                borderRadius: 12,
                                padding: "8px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                              formatter={(val: unknown) => [`${val} registered members (Click to drill down)`, "Intake"]}
                            />
                            <Area
                              type="monotone"
                              dataKey="count"
                              stroke="oklch(0.38 0.16 250)"
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#growthGradient)"
                              activeDot={{ r: 7, fill: "oklch(0.72 0.14 75)", strokeWidth: 0 }}
                              className="cursor-pointer"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Distributions: Departmental + Cell Allocation */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Departmental Representation */}
                  <div className="lg:col-span-6">
                    <Card className="rounded-2xl border-border/60 shadow-soft h-full flex flex-col">
                      <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                        <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                          <Building2 className="h-4 w-4 text-gold" />
                          Departmental Representation
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Congregational membership distribution across ministry departments.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                        {analytics.departments_distribution.length === 0 ? (
                          <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
                            No departmental distribution data recorded.
                          </div>
                        ) : (
                          <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={analytics.departments_distribution}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                              >
                                <XAxis type="number" hide />
                                <YAxis
                                  dataKey="dept_name"
                                  type="category"
                                  fontSize={11}
                                  fontWeight={600}
                                  tickLine={false}
                                  axisLine={false}
                                  width={110}
                                />
                                <Tooltip
                                  formatter={(val: unknown) => [`${val} members`, "Total"]}
                                  contentStyle={{
                                    background: "oklch(1 0 0)",
                                    border: "1px solid oklch(0.92 0.01 260)",
                                    borderRadius: 12,
                                    fontSize: 11,
                                    fontWeight: 600,
                                  }}
                                />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                                  {analytics.departments_distribution.map((item, idx) => (
                                    <RechartsCell
                                      key={`dept-bar-${idx}`}
                                      fill={
                                        item.dept_name === "Unassigned"
                                          ? UNASSIGNED_COLOR
                                          : CELL_PALETTE[idx % CELL_PALETTE.length]
                                      }
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Departments: <strong className="text-foreground">{analytics.departments_distribution.length}</strong></span>
                          <span>Unassigned: <strong className="text-destructive font-bold">{analytics.insights?.dept_engagement?.unassigned_count ?? 0}</strong></span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Cell Group Allocation */}
                  <div className="lg:col-span-6">
                    <Card className="rounded-2xl border-border/60 shadow-soft h-full flex flex-col">
                      <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                        <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                          <Flame className="h-4 w-4 text-gold" />
                          Cell Group Representation
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Active cell fellowships vs unassigned congregants from database.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6 flex-1 flex flex-col justify-between">
                        {analytics.cells_distribution.length === 0 ? (
                          <div className="h-60 flex items-center justify-center text-xs text-muted-foreground">
                            No cell distribution data recorded.
                          </div>
                        ) : (
                          <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={analytics.cells_distribution}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                              >
                                <XAxis type="number" hide />
                                <YAxis
                                  dataKey="cell_name"
                                  type="category"
                                  fontSize={11}
                                  fontWeight={600}
                                  tickLine={false}
                                  axisLine={false}
                                  width={110}
                                />
                                <Tooltip
                                  formatter={(val: unknown) => [`${val} members`, "Total"]}
                                  contentStyle={{
                                    background: "oklch(1 0 0)",
                                    border: "1px solid oklch(0.92 0.01 260)",
                                    borderRadius: 12,
                                    fontSize: 11,
                                    fontWeight: 600,
                                  }}
                                />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                                  {analytics.cells_distribution.map((item, idx) => (
                                    <RechartsCell
                                      key={`cell-bar-${idx}`}
                                      fill={
                                        item.cell_id === null || item.cell_name === "Unassigned"
                                          ? UNASSIGNED_COLOR
                                          : CELL_PALETTE[idx % CELL_PALETTE.length]
                                      }
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                        <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Assigned: <strong className="text-foreground">{analytics.kpis.assigned_cell_count}</strong></span>
                          <span>Pending Allocation: <strong className="text-destructive font-bold">{analytics.kpis.unassigned_cell_count}</strong></span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Demographics Profile + Insights Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left 6 Cols: Gender & Employment profile */}
                  <div className="lg:col-span-6 space-y-6">
                    <Card className="rounded-2xl border-border/60 shadow-soft">
                      <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                        <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                          <Users className="h-4 w-4 text-gold" />
                          Gender & Demographics Profile
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Congregational gender distribution and life-stage representation.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-5 space-y-5">
                        {/* Gender Breakdown */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Users className="h-3.5 w-3.5 text-primary" /> Gender Distribution
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {analytics.gender_distribution.map((g) => (
                              <div key={g.label} className="p-3 rounded-xl bg-secondary/30 border border-border/50 text-center">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block">{g.label}</span>
                                <span className="text-base font-black text-foreground mt-0.5 block">{g.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Employment Breakdown */}
                        <div className="space-y-2 pt-3 border-t border-border/30">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Briefcase className="h-3.5 w-3.5 text-gold" /> Employment Status
                          </div>
                          <div className="space-y-1.5">
                            {demographicLists.employment.map((item, idx) => (
                              <div key={item.label} className="space-y-0.5">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-medium text-foreground">{item.label}</span>
                                  <span className="text-muted-foreground font-mono">
                                    {item.count} · {item.pct}%
                                  </span>
                                </div>
                                <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${Math.min(item.pct, 100)}%`,
                                      backgroundColor: CELL_PALETTE[(idx + 2) % CELL_PALETTE.length],
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right 6 Cols: Growth Analysis Insights Card */}
                  <div className="lg:col-span-6">
                    <Card className="rounded-2xl border-border/60 shadow-soft h-full flex flex-col">
                      <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40">
                        <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                          <Sparkles className="h-4 w-4 text-gold" />
                          Growth Analysis Insights
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Server-side calculated metrics highlighting key retention and integration indicators.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-5 flex-1 flex flex-col justify-between space-y-4">
                        {/* 1. Peak Month Insight */}
                        <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm space-y-1 border-l-4 border-l-primary">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              <TrendingUp className="h-3.5 w-3.5 text-gold" />
                              Peak Registration Month
                            </h4>
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {analytics.insights?.peak_month?.label || "None"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {analytics.insights?.peak_month && analytics.insights.peak_month.count > 0
                              ? `All-time high intake recorded in ${analytics.insights.peak_month.label} with ${analytics.insights.peak_month.count} newly registered members.`
                              : "No peak registration month recorded yet."}
                          </p>
                        </div>

                        {/* 2. Cell Group Integration */}
                        <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm space-y-1 border-l-4 border-l-emerald-600">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              <GitBranch className="h-3.5 w-3.5 text-emerald-600" />
                              Cell Group Integration
                            </h4>
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {analytics.insights?.cell_integration?.pct ?? 0}% Integrated
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {analytics.insights?.cell_integration?.unassigned_count ?? 0} members are currently unassigned to any cell fellowship. Prompt cell placement enhances pastoral care and retention.
                          </p>
                        </div>

                        {/* 3. Departmental Engagement */}
                        <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm space-y-1 border-l-4 border-l-amber-500">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-amber-500" />
                              Departmental Engagement
                            </h4>
                            <Badge variant="outline" className="text-[10px] font-bold">
                              {analytics.insights?.dept_engagement?.pct ?? 0}% Active
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {analytics.insights?.dept_engagement?.pct ?? 0}% of congregants are serving in official departments, with {analytics.insights?.dept_engagement?.unassigned_count ?? 0} members available for volunteer ministry recruitment.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Recently Joined Members Table */}
                <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden">
                  <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-base flex items-center gap-2 text-primary">
                        <UserPlus className="h-4 w-4 text-gold" />
                        Recently Joined Members
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Latest 5 member intake registrations with cell assignment and contacts.
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate({ to: "/members", search: { view: "directory" } })}
                      className="h-8 text-xs font-bold text-primary hover:bg-primary/10"
                    >
                      View Directory <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                          <TableHead className="pl-6 text-xs font-bold">Member</TableHead>
                          <TableHead className="text-xs font-bold">Home Cell</TableHead>
                          <TableHead className="text-xs font-bold">Telephone</TableHead>
                          <TableHead className="text-xs font-bold">Email</TableHead>
                          <TableHead className="text-xs font-bold pr-6">Joined Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analytics.recent_members.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                              No recent member records found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          analytics.recent_members.map((m) => (
                            <TableRow
                              key={m.id}
                              className="hover:bg-secondary/20 transition-colors cursor-pointer"
                              onClick={() => setProfileOffcanvasId(m.id)}
                            >
                              <TableCell className="pl-6">
                                <div className="flex items-center gap-2.5">
                                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-black shrink-0", getAvatarColor(m.id))}>
                                    {m.full_name ? m.full_name[0] : "?"}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-xs text-foreground block">{m.full_name}</span>
                                      {m.is_new && (
                                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[9px] px-1 py-0 font-bold">
                                          New
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-mono">ID #{m.id}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] font-bold",
                                    m.cell_name !== "Unassigned"
                                      ? "bg-primary/10 text-primary border-primary/20"
                                      : "bg-secondary text-muted-foreground"
                                  )}
                                >
                                  {m.cell_name}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground font-medium">{m.phone || "—"}</TableCell>
                              <TableCell className="text-xs text-muted-foreground truncate max-w-[160px]">{m.email || "—"}</TableCell>
                              <TableCell className="text-xs text-muted-foreground pr-6">{m.joined_on || "—"}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2: CONGREGATIONAL DIRECTORY (view-members.php)                   */}
        {/* ===================================================================== */}
        {activeView === "directory" && (
          <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden">
            {/* Filter Toolbar */}
            <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="font-display text-base text-primary">Members Directory</CardTitle>
                <CardDescription className="text-xs">
                  Filter by substring search, home cell group, or joined month.
                </CardDescription>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Input (Debounced 300ms) */}
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search name, phone, email, ID..."
                    className="pl-8 h-9 rounded-xl border-border/60 text-xs bg-background"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Cell Filter Dropdown */}
                <Select
                  value={cellFilter}
                  onValueChange={(val) => {
                    setCellFilter(val);
                    setPage(1);
                    navigate({
                      to: "/members",
                      search: {
                        view: "directory",
                        cell_id: val !== "all" ? val : undefined,
                        month: monthFilter !== "all" ? monthFilter : undefined,
                      },
                    });
                  }}
                >
                  <SelectTrigger className="h-9 rounded-xl border-border/60 text-xs bg-background min-w-[140px]">
                    <SelectValue placeholder="All Cell Groups" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Cell Groups</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {analytics?.cells_distribution
                      .filter((c) => c.cell_id !== null)
                      .map((c) => (
                        <SelectItem key={String(c.cell_id)} value={String(c.cell_id)}>
                          {c.cell_name} ({c.count})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Month Filter Dropdown (Last 12 months) */}
                <Select
                  value={monthFilter}
                  onValueChange={(val) => {
                    setMonthFilter(val);
                    setPage(1);
                    navigate({
                      to: "/members",
                      search: {
                        view: "directory",
                        cell_id: cellFilter !== "all" ? cellFilter : undefined,
                        month: val !== "all" ? val : undefined,
                      },
                    });
                  }}
                >
                  <SelectTrigger className="h-9 rounded-xl border-border/60 text-xs bg-background min-w-[130px]">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All Months</SelectItem>
                    {analytics?.growth_timeline.map((item) => (
                      <SelectItem key={item.month} value={item.month}>
                        {item.label} ({item.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Reset Filters Button */}
                {(searchInput || cellFilter !== "all" || monthFilter !== "all") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-9 text-xs rounded-xl hover:bg-secondary/60 text-muted-foreground"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoadingDirectory ? (
                <div className="p-8 space-y-3">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))}
                </div>
              ) : directoryError ? (
                <div className="p-12 text-center space-y-3">
                  <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
                  <p className="font-semibold text-foreground">Error loading directory</p>
                  <p className="text-xs text-muted-foreground">{directoryError}</p>
                  <Button onClick={() => fetchDirectory(page)} variant="outline" className="rounded-xl text-xs">
                    Retry
                  </Button>
                </div>
              ) : membersList.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground space-y-2">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <p className="font-semibold text-foreground">No member records match the criteria</p>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting the search query, selecting another cell group, or clearing filters.
                  </p>
                  {(searchInput || cellFilter !== "all" || monthFilter !== "all") && (
                    <Button onClick={handleResetFilters} variant="outline" size="sm" className="rounded-xl text-xs mt-2">
                      Clear All Filters
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/40 hover:bg-transparent">
                        <TableHead className="pl-6 text-xs font-bold w-12">#</TableHead>
                        <TableHead className="text-xs font-bold">Member</TableHead>
                        <TableHead className="text-xs font-bold">Invited By / Category</TableHead>
                        <TableHead className="text-xs font-bold">Home Cell</TableHead>
                        <TableHead className="text-xs font-bold">Telephone</TableHead>
                        <TableHead className="text-xs font-bold">Email</TableHead>
                        <TableHead className="text-xs font-bold">Joined Date</TableHead>
                        <TableHead className="text-xs font-bold text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {membersList.map((m, idx) => (
                        <TableRow
                          key={m.id}
                          className="hover:bg-secondary/20 transition-colors cursor-pointer"
                          onClick={() => setProfileOffcanvasId(m.id)}
                        >
                          <TableCell className="pl-6 text-xs text-muted-foreground font-semibold">
                            {(page - 1) * 20 + idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-black shrink-0", getAvatarColor(m.id))}>
                                {m.first_name ? m.first_name[0] : "?"}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-foreground block">{m.full_name}</span>
                                  {m.is_new && (
                                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[9px] px-1 py-0 font-bold">
                                      New
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono">ID #{m.id}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] font-medium bg-secondary/30">
                              {m.department_name || m.department || "General"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-bold",
                                m.cell_name !== "Unassigned"
                                  ? "bg-primary/10 text-primary border-primary/20"
                                  : "bg-secondary text-muted-foreground"
                              )}
                            >
                              {m.cell_name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-medium">
                            {m.phone_number || m.phone_no || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {m.email || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {m.joined_on_formatted || m.joined_on || "—"}
                          </TableCell>
                          <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 rounded-xl">
                                <DropdownMenuItem onClick={() => setProfileOffcanvasId(m.id)}>
                                  <Eye className="h-3.5 w-3.5 mr-2 text-primary" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingMember(m)}>
                                  <Edit className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                  Edit Info
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setCommitmentForm({
                                      member_id: m.id,
                                      full_name: m.full_name,
                                      phone: m.phone_no || m.phone_number || "",
                                      email: m.email || "",
                                      residence: m.location || "",
                                      committed_on: new Date().toISOString().split("T")[0],
                                    });
                                    setIsCommitmentModalOpen(true);
                                  }}
                                >
                                  <Heart className="h-3.5 w-3.5 mr-2 text-gold" />
                                  Add Commitment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  <div className="p-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Showing <strong>{membersList.length}</strong> of <strong>{totalDirectoryCount}</strong> members
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || isLoadingDirectory}
                        onClick={() => fetchDirectory(page - 1)}
                        className="h-8 rounded-lg text-xs"
                      >
                        Previous
                      </Button>
                      <span className="font-semibold text-foreground px-1">Page {page}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page * 20 >= totalDirectoryCount || isLoadingDirectory}
                        onClick={() => fetchDirectory(page + 1)}
                        className="h-8 rounded-lg text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ===================================================================== */}
        {/* VIEW 3: COMMITTED GUESTS (view-members.php committed view)            */}
        {/* ===================================================================== */}
        {activeView === "committed" && (
          <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-border/60 shadow-soft p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Members</p>
                <h3 className="font-display text-2xl font-black text-foreground mt-1">
                  {(analytics?.committed_kpis?.regular_total ?? 0) + (analytics?.committed_kpis?.committed_total ?? 0)}
                </h3>
                <span className="text-[10px] text-muted-foreground block mt-1">Regular + Committed</span>
              </Card>

              <Card className="rounded-2xl border-border/60 shadow-soft p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Committed Guests</p>
                <h3 className="font-display text-2xl font-black text-primary mt-1">
                  {analytics?.committed_kpis?.committed_total ?? committedList.length}
                </h3>
                <span className="text-[10px] text-muted-foreground block mt-1">Total commitment records</span>
              </Card>

              <Card className="rounded-2xl border-border/60 shadow-soft p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Linked Profiles</p>
                <h3 className="font-display text-2xl font-black text-emerald-600 mt-1">
                  {analytics?.committed_kpis?.committed_linked ?? committedList.filter((c) => c.member_id).length}
                </h3>
                <span className="text-[10px] text-muted-foreground block mt-1">Linked to registered member</span>
              </Card>

              <Card className="rounded-2xl border-border/60 shadow-soft p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Unlinked Profiles</p>
                <h3 className="font-display text-2xl font-black text-amber-600 mt-1">
                  {analytics?.committed_kpis?.committed_unlinked ?? committedList.filter((c) => !c.member_id).length}
                </h3>
                <span className="text-[10px] text-muted-foreground block mt-1">Awaiting member link</span>
              </Card>
            </div>

            {/* Committed Guests Table Card */}
            <Card className="rounded-2xl border-border/60 shadow-soft overflow-hidden">
              <CardHeader className="bg-secondary/15 pb-4 border-b border-border/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="font-display text-base text-primary">Committed Guests Roster</CardTitle>
                  <CardDescription className="text-xs">
                    Guests who have made commitments to J.E.N, with link status to congregational membership records.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={committedSearchQuery}
                      onChange={(e) => setCommittedSearchQuery(e.target.value)}
                      placeholder="Search guest name, phone..."
                      className="pl-8 h-9 rounded-xl border-border/60 text-xs bg-background"
                    />
                    {committedSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCommittedSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <Select
                    value={committedFilterStatus}
                    onValueChange={(val: "all" | "linked" | "unlinked") => setCommittedFilterStatus(val)}
                  >
                    <SelectTrigger className="h-9 rounded-xl border-border/60 text-xs bg-background min-w-[130px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="linked">Linked</SelectItem>
                      <SelectItem value="unlinked">Unlinked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {isLoadingCommitted ? (
                  <div className="p-8 space-y-3">
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-xl" />
                      ))}
                  </div>
                ) : committedError ? (
                  <div className="p-12 text-center space-y-3">
                    <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
                    <p className="font-semibold text-foreground">Error loading committed roster</p>
                    <p className="text-xs text-muted-foreground">{committedError}</p>
                    <Button onClick={() => fetchCommitted()} variant="outline" className="rounded-xl text-xs">
                      Retry
                    </Button>
                  </div>
                ) : filteredCommittedList.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground space-y-2">
                    <UserCheck className="h-10 w-10 mx-auto text-muted-foreground/40" />
                    <p className="font-semibold text-foreground">No committed guest records found</p>
                    <p className="text-xs text-muted-foreground">
                      Use the "Add Committed Guest" button above to record committed guests.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/40 hover:bg-transparent">
                        <TableHead className="pl-6 text-xs font-bold w-12">#</TableHead>
                        <TableHead className="text-xs font-bold">Guest Name</TableHead>
                        <TableHead className="text-xs font-bold">Contact</TableHead>
                        <TableHead className="text-xs font-bold">Residence</TableHead>
                        <TableHead className="text-xs font-bold">Member Status</TableHead>
                        <TableHead className="text-xs font-bold">Committed On</TableHead>
                        <TableHead className="text-xs font-bold">Created</TableHead>
                        <TableHead className="text-xs font-bold text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCommittedList.map((guest, idx) => (
                        <TableRow key={guest.id} className="hover:bg-secondary/20 transition-colors">
                          <TableCell className="pl-6 text-xs text-muted-foreground font-semibold">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-bold text-xs text-foreground block">{guest.full_name}</span>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[150px] block font-mono">
                                {guest.email || "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-medium">
                            {guest.phone || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {guest.residence || "—"}
                          </TableCell>
                          <TableCell>
                            {guest.member_id ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                                Linked (ID #{guest.member_id}){guest.linked_member_name ? ` • ${guest.linked_member_name}` : ""}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold">
                                Not Linked
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {guest.committed_on_formatted || guest.committed_on || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {guest.created_at_formatted || guest.created_at}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44 rounded-xl">
                                <DropdownMenuItem onClick={() => setViewingCommitted(guest)}>
                                  <Eye className="h-3.5 w-3.5 mr-2 text-primary" />
                                  View Details
                                </DropdownMenuItem>
                                {!guest.member_id && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setLinkingGuest(guest);
                                      setMemberSearchTerm(guest.full_name);
                                      setSelectedMemberToLink(null);
                                    }}
                                  >
                                    <Link2 className="h-3.5 w-3.5 mr-2 text-emerald-600" />
                                    Link to Profile
                                  </DropdownMenuItem>
                                )}
                                {guest.member_id && (
                                  <DropdownMenuItem onClick={() => setProfileOffcanvasId(guest.member_id)}>
                                    <Users className="h-3.5 w-3.5 mr-2 text-primary" />
                                    View Linked Member
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeletingGuest(guest)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Delete Guest
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* JOINED MEMBERS DRILLDOWN MODAL (Growth Timeline click)                   */}
        {/* ========================================================================= */}
        <Dialog
          open={Boolean(drilldownMonth)}
          onOpenChange={(open) => {
            if (!open) setDrilldownMonth(null);
          }}
        >
          <DialogContent className="sm:max-w-3xl rounded-2xl border-border bg-card max-h-[85vh] flex flex-col p-6">
            <DialogHeader className="pb-3 border-b border-border/40">
              <DialogTitle className="font-display text-lg flex items-center gap-2 text-primary">
                <Calendar className="h-5 w-5 text-gold" />
                Members Joined in {drilldownMonth?.label}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Complete intake roster for {drilldownMonth?.month} from the database. Live text search below.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={drilldownSearch}
                  onChange={(e) => setDrilldownSearch(e.target.value)}
                  placeholder="Filter by name, email, phone, cell..."
                  className="pl-8 h-9 rounded-xl border-border/60 text-xs"
                />
              </div>
              <Badge variant="outline" className="text-xs font-bold px-3 py-1">
                Total: {filteredDrilldownMembers.length} members
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[250px] border border-border/40 rounded-xl">
              {isLoadingDrilldown ? (
                <div className="p-8 space-y-3">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-lg" />
                    ))}
                </div>
              ) : filteredDrilldownMembers.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground">
                  No members found matching query in this month cohort.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                      <TableHead className="text-xs font-bold w-10">#</TableHead>
                      <TableHead className="text-xs font-bold">Full Name</TableHead>
                      <TableHead className="text-xs font-bold">Email</TableHead>
                      <TableHead className="text-xs font-bold">Telephone</TableHead>
                      <TableHead className="text-xs font-bold">Home Cell</TableHead>
                      <TableHead className="text-xs font-bold">Intake Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrilldownMembers.map((m, idx) => (
                      <TableRow
                        key={m.id}
                        className="hover:bg-secondary/20 cursor-pointer"
                        onClick={() => {
                          setDrilldownMonth(null);
                          setProfileOffcanvasId(m.id);
                        }}
                      >
                        <TableCell className="text-xs text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="text-xs font-bold text-foreground">{m.full_name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{m.email || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{m.phone_no || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {m.cell_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{m.joined_on_formatted}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <DialogFooter className="pt-3 border-t border-border/40 flex items-center justify-between sm:justify-between">
              <span className="text-xs text-muted-foreground">
                Showing {filteredDrilldownMembers.length} of {drilldownMembers.length} cohort members
              </span>
              <Button onClick={() => setDrilldownMonth(null)} className="rounded-xl text-xs font-bold">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* MEMBER PROFILE OFFCANVAS (Sheet: 420px right drawer)                     */}
        {/* ========================================================================= */}
        <Sheet
          open={profileOffcanvasId !== null}
          onOpenChange={(open) => {
            if (!open) setProfileOffcanvasId(null);
          }}
        >
          <SheetContent side="right" className="sm:max-w-[420px] w-full overflow-y-auto p-6 flex flex-col justify-between">
            <div>
              <SheetHeader className="text-left pb-4 border-b border-border/40">
                <SheetTitle className="font-display text-lg text-primary flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  Member Profile 360
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Comprehensive profile card and congregational attendance summary.
                </SheetDescription>
              </SheetHeader>

              {isLoadingProfile || !profileDetail ? (
                <div className="py-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              ) : (
                <div className="py-6 space-y-5">
                  {/* Avatar + Name header */}
                  <div className="flex items-center gap-4">
                    <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black shadow-glow shrink-0", getAvatarColor(profileDetail.id))}>
                      {profileDetail.first_name ? profileDetail.first_name[0] : "?"}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground leading-tight">
                        {profileDetail.name || `${profileDetail.first_name} ${profileDetail.last_name}`}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <Badge variant="outline" className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/20">
                          {profileDetail.department || "General Member"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ID #{profileDetail.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Rate Card */}
                  <div className="rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Attendance Rate
                      </span>
                      <Badge
                        className={cn(
                          "text-[10px] font-bold",
                          profileDetail.attendance.status_label === "Regular"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                            : profileDetail.attendance.status_label === "Irregular"
                            ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                            : "bg-destructive/15 text-destructive border-destructive/30"
                        )}
                      >
                        {profileDetail.attendance.status_label}
                      </Badge>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-black text-foreground font-display">
                        {profileDetail.attendance.attendance_rate}%
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {profileDetail.attendance.attended_count} of {profileDetail.attendance.total_meetings} meetings
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary/60 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          profileDetail.attendance.attendance_rate >= 80
                            ? "bg-emerald-600"
                            : profileDetail.attendance.attendance_rate >= 50
                            ? "bg-amber-500"
                            : "bg-destructive"
                        )}
                        style={{ width: `${Math.min(profileDetail.attendance.attendance_rate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Home Cell Card */}
                  <div className="rounded-xl border border-border/60 bg-card p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Home Cell Group</span>
                      <h4 className="font-bold text-sm text-primary mt-0.5">{profileDetail.cell_name}</h4>
                      <span className="text-[10px] font-mono text-muted-foreground">{profileDetail.cell_code}</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Flame className="h-5 w-5 text-gold" />
                    </div>
                  </div>

                  {/* Personal Information Block */}
                  <div className="rounded-xl border border-border/60 bg-secondary/10 p-4 space-y-2.5 text-xs">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground pb-1 border-b border-border/40">
                      Personal Information
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Telephone:</span>
                      <span className="font-semibold text-foreground">{profileDetail.phone_no || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-semibold text-foreground truncate max-w-[200px]">{profileDetail.email || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Residence:</span>
                      <span className="font-semibold text-foreground">{profileDetail.location || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="font-semibold text-foreground">{profileDetail.gender}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Marital Status:</span>
                      <span className="font-semibold text-foreground">{profileDetail.marital}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Employment:</span>
                      <span className="font-semibold text-foreground">{profileDetail.emp_status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Intake Date:</span>
                      <span className="font-semibold text-foreground">{profileDetail.joined_on_formatted}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <SheetFooter className="pt-4 border-t border-border/40 flex items-center justify-between sm:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProfileOffcanvasId(null)}
                  className="rounded-xl text-xs"
                >
                  Close
                </Button>
                {profileDetail && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={downloadingMemberPdf}
                    onClick={() => handleDownloadMemberPdf(profileDetail.id)}
                    className="rounded-xl text-xs gap-1.5 hover:bg-muted font-medium transition-colors"
                  >
                    {downloadingMemberPdf ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <FileDown className="h-3.5 w-3.5 text-primary" />
                    )}
                    Export Dossier (PDF)
                  </Button>
                )}
              </div>
              {profileDetail && (
                <Button
                  size="sm"
                  onClick={() => {
                    const found = membersList.find((m) => m.id === profileDetail.id);
                    if (found) {
                      setEditingMember(found);
                      setProfileOffcanvasId(null);
                    } else {
                      toast.info("Member found in database.");
                    }
                  }}
                  className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit Profile
                </Button>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* ========================================================================= */}
        {/* ADD COMMITMENT MODAL (Add Commitment / Add Guest)                        */}
        {/* ========================================================================= */}
        <Dialog
          open={isCommitmentModalOpen}
          onOpenChange={(open) => {
            if (!open) setIsCommitmentModalOpen(false);
          }}
        >
          <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2 text-primary">
                <Heart className="h-5 w-5 text-gold" />
                {commitmentForm.member_id ? "Record Member Commitment" : "Add Committed Guest"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {commitmentForm.member_id
                  ? `Recording official commitment for registered member #${commitmentForm.member_id}.`
                  : "Record new committed guest. You can later link this guest to a registered member profile."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCommitmentSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Guest / Member Name *</Label>
                <Input
                  required
                  readOnly={Boolean(commitmentForm.member_id)}
                  value={commitmentForm.full_name}
                  onChange={(e) => setCommitmentForm({ ...commitmentForm, full_name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className={cn("rounded-xl border-border/60", commitmentForm.member_id && "bg-secondary/40")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Telephone</Label>
                  <Input
                    readOnly={Boolean(commitmentForm.member_id)}
                    value={commitmentForm.phone}
                    onChange={(e) => setCommitmentForm({ ...commitmentForm, phone: e.target.value })}
                    placeholder="07xxxxxxxx"
                    className={cn("rounded-xl border-border/60", commitmentForm.member_id && "bg-secondary/40")}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Email</Label>
                  <Input
                    type="email"
                    readOnly={Boolean(commitmentForm.member_id)}
                    value={commitmentForm.email}
                    onChange={(e) => setCommitmentForm({ ...commitmentForm, email: e.target.value })}
                    placeholder="guest@example.com"
                    className={cn("rounded-xl border-border/60", commitmentForm.member_id && "bg-secondary/40")}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Residential Location</Label>
                <Input
                  value={commitmentForm.residence}
                  onChange={(e) => setCommitmentForm({ ...commitmentForm, residence: e.target.value })}
                  placeholder="e.g. Nairobi, Roysambu"
                  className="rounded-xl border-border/60"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Committed Date *</Label>
                <Input
                  type="date"
                  required
                  value={commitmentForm.committed_on}
                  onChange={(e) => setCommitmentForm({ ...commitmentForm, committed_on: e.target.value })}
                  className="rounded-xl border-border/60"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCommitmentModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingCommitment}
                  className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmittingCommitment ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Save Commitment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* LINK COMMITTED GUEST TO MEMBER MODAL                                      */}
        {/* ========================================================================= */}
        <Dialog
          open={Boolean(linkingGuest)}
          onOpenChange={(open) => {
            if (!open) {
              setLinkingGuest(null);
              setSelectedMemberToLink(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2 text-primary">
                <Link2 className="h-5 w-5 text-emerald-600" />
                Link Guest to Member Profile
              </DialogTitle>
              <DialogDescription className="text-xs">
                Search and link <strong>{linkingGuest?.full_name}</strong> to their registered congregational member record.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Search Member (Name, Phone, or Email)</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    placeholder="Type at least 3 characters..."
                    className="pl-8 rounded-xl border-border/60"
                  />
                  {isSearchingMembers && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Search Results List */}
              <div className="border border-border/40 rounded-xl max-h-48 overflow-y-auto divide-y divide-border/30">
                {memberSearchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    {memberSearchTerm.trim().length < 3
                      ? "Enter at least 3 characters to search members."
                      : isSearchingMembers
                      ? "Searching..."
                      : "No members matched your search query."}
                  </div>
                ) : (
                  memberSearchResults.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMemberToLink(m.id)}
                      className={cn(
                        "p-3 flex items-center justify-between cursor-pointer transition-colors text-xs",
                        selectedMemberToLink === m.id
                          ? "bg-primary/10 border-l-4 border-l-primary"
                          : "hover:bg-secondary/30"
                      )}
                    >
                      <div>
                        <span className="font-bold text-foreground block">{m.full_name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ID #{m.id} • {m.phone_no || m.email || "No contact"}
                        </span>
                      </div>
                      {selectedMemberToLink === m.id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLinkingGuest(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLinkGuestSubmit}
                  disabled={!selectedMemberToLink || isSubmittingLink}
                  className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmittingLink ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Confirm Link
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* VIEW COMMITTED GUEST DETAIL MODAL                                         */}
        {/* ========================================================================= */}
        <Dialog
          open={Boolean(viewingCommitted)}
          onOpenChange={(open) => {
            if (!open) setViewingCommitted(null);
          }}
        >
          <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2 text-primary">
                <UserCheck className="h-5 w-5 text-gold" />
                Committed Guest Details
              </DialogTitle>
              <DialogDescription className="text-xs">
                Database commitment record ID #{viewingCommitted?.id}
              </DialogDescription>
            </DialogHeader>

            {viewingCommitted && (
              <div className="space-y-4 pt-2">
                <div className="rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Guest Name:</span>
                    <span className="font-bold text-foreground">{viewingCommitted.full_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Telephone:</span>
                    <span className="font-semibold text-foreground">{viewingCommitted.phone || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-semibold text-foreground">{viewingCommitted.email || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Residence:</span>
                    <span className="font-semibold text-foreground">{viewingCommitted.residence || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {viewingCommitted.member_id ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                        Linked to Member #{viewingCommitted.member_id}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600">
                        Not Linked
                      </Badge>
                    )}
                  </div>
                  {viewingCommitted.linked_member_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Linked Member:</span>
                      <span className="font-semibold text-primary">{viewingCommitted.linked_member_name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Committed On:</span>
                    <span className="font-semibold text-foreground">
                      {viewingCommitted.committed_on_formatted || viewingCommitted.committed_on || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created Date:</span>
                    <span className="font-semibold text-foreground">
                      {viewingCommitted.created_at_formatted || viewingCommitted.created_at}
                    </span>
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <Button onClick={() => setViewingCommitted(null)} className="rounded-xl text-xs font-bold">
                    Close
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* DELETE COMMITTED GUEST CONFIRMATION DIALOG                                */}
        {/* ========================================================================= */}
        <Dialog
          open={Boolean(deletingGuest)}
          onOpenChange={(open) => {
            if (!open) setDeletingGuest(null);
          }}
        >
          <DialogContent className="sm:max-w-md rounded-2xl border-destructive/30 bg-card">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Delete Committed Guest
              </DialogTitle>
              <DialogDescription className="text-xs">
                Are you sure you want to remove the commitment record for <strong>{deletingGuest?.full_name}</strong>?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingGuest(null)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteGuestSubmit}
                disabled={isDeletingGuest}
                variant="destructive"
                className="rounded-xl text-xs font-bold"
              >
                {isDeletingGuest ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* REGISTER NEW MEMBER DIALOG                                               */}
        {/* ========================================================================= */}
        <Dialog
          open={isRegisterOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsRegisterOpen(false);
              setFieldErrors({});
            }
          }}
        >
          <DialogContent className="sm:max-w-lg rounded-2xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2 text-primary">
                <UserPlus className="h-5 w-5 text-gold" />
                Register New Member
              </DialogTitle>
              <DialogDescription className="text-xs">
                Create a member profile in J.E.N database. All required fields must be validated.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">First Name *</Label>
                  <Input
                    required
                    value={newMemberForm.first_name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, first_name: e.target.value })}
                    placeholder="e.g. Samuel"
                    className={cn("rounded-xl border-border/60", fieldErrors.first_name && "border-destructive")}
                  />
                  {fieldErrors.first_name && (
                    <span className="text-[10px] text-destructive block">{fieldErrors.first_name[0]}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Last Name *</Label>
                  <Input
                    required
                    value={newMemberForm.last_name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, last_name: e.target.value })}
                    placeholder="e.g. Mwangi"
                    className={cn("rounded-xl border-border/60", fieldErrors.last_name && "border-destructive")}
                  />
                  {fieldErrors.last_name && (
                    <span className="text-[10px] text-destructive block">{fieldErrors.last_name[0]}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Telephone *</Label>
                  <Input
                    required
                    value={newMemberForm.phone_no}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone_no: e.target.value })}
                    placeholder="07xxxxxxxx"
                    className={cn("rounded-xl border-border/60", fieldErrors.phone_no && "border-destructive")}
                  />
                  {fieldErrors.phone_no && (
                    <span className="text-[10px] text-destructive block">{fieldErrors.phone_no[0]}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Email</Label>
                  <Input
                    type="email"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    placeholder="member@example.com"
                    className="rounded-xl border-border/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Gender *</Label>
                  <Select
                    value={newMemberForm.gender}
                    onValueChange={(val) => setNewMemberForm({ ...newMemberForm, gender: val })}
                  >
                    <SelectTrigger className="rounded-xl border-border/60 h-10">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Marital Status</Label>
                  <Select
                    value={newMemberForm.marital}
                    onValueChange={(val) => setNewMemberForm({ ...newMemberForm, marital: val })}
                  >
                    <SelectTrigger className="rounded-xl border-border/60 h-10">
                      <SelectValue placeholder="Marital" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Employment</Label>
                  <Select
                    value={newMemberForm.emp_status}
                    onValueChange={(val) => setNewMemberForm({ ...newMemberForm, emp_status: val })}
                  >
                    <SelectTrigger className="rounded-xl border-border/60 h-10">
                      <SelectValue placeholder="Employment" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Employed">Employed</SelectItem>
                      <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Unemployed">Unemployed</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Home Cell</Label>
                  <Select
                    value={newMemberForm.cell_id}
                    onValueChange={(val) => setNewMemberForm({ ...newMemberForm, cell_id: val })}
                  >
                    <SelectTrigger className="rounded-xl border-border/60 h-10">
                      <SelectValue placeholder="Assign Cell" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="0">Unassigned</SelectItem>
                      {analytics?.cells_distribution
                        .filter((c) => c.cell_id !== null)
                        .map((c) => (
                          <SelectItem key={String(c.cell_id)} value={String(c.cell_id)}>
                            {c.cell_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase">Joined Date *</Label>
                  <Input
                    type="date"
                    required
                    value={newMemberForm.joined_on}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, joined_on: e.target.value })}
                    className="rounded-xl border-border/60 h-10"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold uppercase">Residential Location</Label>
                <Input
                  value={newMemberForm.location}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, location: e.target.value })}
                  placeholder="e.g. Roysambu, Nairobi"
                  className="rounded-xl border-border/60"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRegisterOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="rounded-xl font-bold bg-primary text-primary-foreground shadow-glow hover:bg-primary/90"
                >
                  {isSubmittingNew ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  Save Member
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* EDIT MEMBER DIALOG                                                        */}
        {/* ========================================================================= */}
        <Dialog
          open={Boolean(editingMember)}
          onOpenChange={(open) => {
            if (!open) setEditingMember(null);
          }}
        >
          <DialogContent className="sm:max-w-lg rounded-2xl border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-display text-lg flex items-center gap-2 text-primary">
                <Edit className="h-5 w-5 text-gold" />
                Edit Member Record: {editingMember?.full_name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Update record ID #{editingMember?.id} in database.
              </DialogDescription>
            </DialogHeader>

            {editingMember && (
              <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase">First Name *</Label>
                    <Input
                      required
                      value={editingMember.first_name}
                      onChange={(e) => setEditingMember({ ...editingMember, first_name: e.target.value })}
                      className="rounded-xl border-border/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase">Last Name *</Label>
                    <Input
                      required
                      value={editingMember.last_name}
                      onChange={(e) => setEditingMember({ ...editingMember, last_name: e.target.value })}
                      className="rounded-xl border-border/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase">Telephone</Label>
                    <Input
                      value={editingMember.phone_no || editingMember.phone_number}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          phone_no: e.target.value,
                          phone_number: e.target.value,
                        })
                      }
                      className="rounded-xl border-border/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase">Email</Label>
                    <Input
                      type="email"
                      value={editingMember.email || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                      className="rounded-xl border-border/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase">Home Cell</Label>
                    <Select
                      value={editingMember.cell_id ? String(editingMember.cell_id) : "0"}
                      onValueChange={(val) =>
                        setEditingMember({
                          ...editingMember,
                          cell_id: val === "0" ? null : parseInt(val, 10),
                          cell_name:
                            analytics?.cells_distribution.find((c) => String(c.cell_id) === val)?.cell_name ||
                            "Unassigned",
                        })
                      }
                    >
                      <SelectTrigger className="rounded-xl border-border/60 h-10">
                        <SelectValue placeholder="Assign Cell" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="0">Unassigned</SelectItem>
                        {analytics?.cells_distribution
                          .filter((c) => c.cell_id !== null)
                          .map((c) => (
                            <SelectItem key={String(c.cell_id)} value={String(c.cell_id)}>
                              {c.cell_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold uppercase">Residential Location</Label>
                    <Input
                      value={editingMember.location || ""}
                      onChange={(e) => setEditingMember({ ...editingMember, location: e.target.value })}
                      className="rounded-xl border-border/60 h-10"
                    />
                  </div>
                </div>

                <DialogFooter className="pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingMember(null)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingEdit}
                    className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmittingEdit ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
