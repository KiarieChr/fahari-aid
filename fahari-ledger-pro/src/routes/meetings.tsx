import { createFileRoute, useRouterState, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { apiCall } from "@/api/client";
import { MeetingsHubView } from "@/components/meetings/MeetingsHubView";
import { AttendanceToolbar } from "@/components/meetings/AttendanceToolbar";
import { AttendanceKpiStrip } from "@/components/meetings/AttendanceKpiStrip";
import { AttendanceSubNav } from "@/components/meetings/AttendanceSubNav";
import { AttendanceOverviewTab } from "@/components/meetings/AttendanceOverviewTab";
import { AttendanceIndividualTab } from "@/components/meetings/AttendanceIndividualTab";
import { AttendanceFollowupTab } from "@/components/meetings/AttendanceFollowupTab";
import { AttendanceAnalyticsTab } from "@/components/meetings/AttendanceAnalyticsTab";
import { CheckInKioskModal } from "@/components/meetings/CheckInKioskModal";
import { MemberAttendanceOffcanvas } from "@/components/meetings/MemberAttendanceOffcanvas";
import type {
  MeetingListItem,
  MeetingsFiltersLookup,
  AttendanceSummary,
  AttendanceRecord,
  IndividualAttendanceMember,
  IndividualTrackingResponse,
  AttendanceFollowupResponse,
  AttendanceAnalyticsPayload,
} from "@/components/meetings/types";

export interface MeetingsSearchParams {
  view?: "meetings" | "attendance" | "analytics";
  tab?: "overview" | "individual" | "followup" | "analytics";
  meeting_id?: string;
  cell_id?: string;
  department_id?: string;
  gender?: string;
  status?: string;
  year?: string;
  q?: string;
  type_id?: string;
  page?: string;
}

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meetings & Attendance Tracking — J.E.N Church ERP" },
      {
        name: "description",
        content:
          "Centralized congregational meetings, service check-ins, pastoral attendance tracking, and annual analytics.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): MeetingsSearchParams => ({
    view:
      s.view === "analytics"
        ? "analytics"
        : s.view === "attendance"
        ? "attendance"
        : s.view === "meetings"
        ? "meetings"
        : undefined,
    tab:
      s.view === "attendance" &&
      ["overview", "individual", "followup", "analytics"].includes(s.tab as string)
        ? (s.tab as "overview" | "individual" | "followup" | "analytics")
        : undefined,
    meeting_id: typeof s.meeting_id === "string" ? s.meeting_id : undefined,
    cell_id: typeof s.cell_id === "string" ? s.cell_id : undefined,
    department_id: typeof s.department_id === "string" ? s.department_id : undefined,
    gender: typeof s.gender === "string" ? s.gender : undefined,
    status: typeof s.status === "string" ? s.status : undefined,
    year: typeof s.year === "string" ? s.year : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
    type_id: typeof s.type_id === "string" ? s.type_id : undefined,
    page: typeof s.page === "string" || typeof s.page === "number" ? String(s.page) : undefined,
  }),
  component: MeetingsRouteComponent,
});

function MeetingsRouteComponent() {
  const routerState = useRouterState();
  const searchParams = useMemo(() => {
    return (routerState.location.search || {}) as Record<string, string | undefined>;
  }, [routerState.location.search]);

  const activeView = searchParams.view || "meetings";
  const activeTab =
    activeView === "analytics"
      ? "analytics"
      : searchParams.tab || "overview";

  // Common Lookups
  const [filtersLookup, setFiltersLookup] = useState<MeetingsFiltersLookup>({
    types: [],
    cells: [],
    departments: [],
    facilitators: [],
    years: [new Date().getFullYear()],
  });
  const [allMeetings, setAllMeetings] = useState<MeetingListItem[]>([]);

  // Attendance states
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [loadingAttendances, setLoadingAttendances] = useState(false);

  // Individual tracking state
  const [individualMembers, setIndividualMembers] = useState<IndividualAttendanceMember[]>([]);
  const [individualTotal, setIndividualTotal] = useState(0);
  const [individualTotalPages, setIndividualTotalPages] = useState(1);
  const [individualCurrentPage, setIndividualCurrentPage] = useState(1);
  const [loadingIndividual, setLoadingIndividual] = useState(false);

  // Follow-up state
  const [followupMembers, setFollowupMembers] = useState<IndividualAttendanceMember[]>([]);
  const [loadingFollowup, setLoadingFollowup] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<AttendanceAnalyticsPayload | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Modals
  const [kioskOpen, setKioskOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);

  // 1. Fetch lookups & meeting list for selects
  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiCall<MeetingsFiltersLookup>("/meetings/filters/"),
      apiCall<{ results: MeetingListItem[] }>("/meetings/?page_size=100"),
    ])
      .then(([fRes, mRes]) => {
        if (!mounted) return;
        if (fRes) setFiltersLookup(fRes);
        if (mRes && mRes.results) setAllMeetings(mRes.results);
      })
      .catch(() => {
        // Silently caught
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Determine currently selected meeting object
  const selectedMeeting = useMemo(() => {
    if (!searchParams.meeting_id) {
      return allMeetings[0] || null;
    }
    return (
      allMeetings.find((m) => String(m.id) === searchParams.meeting_id) || null
    );
  }, [allMeetings, searchParams.meeting_id]);

  // 2. Fetch attendance summary for selected meeting
  const fetchSummary = useCallback(async () => {
    if (activeView === "meetings") return;
    setLoadingSummary(true);
    try {
      const q = searchParams.meeting_id ? `?meeting_id=${searchParams.meeting_id}` : "";
      const res = await apiCall<AttendanceSummary>(`/meetings/attendance/summary/${q}`);
      setSummary(res);
    } catch {
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  }, [activeView, searchParams.meeting_id]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // 3. Fetch check-in log for Overview tab
  const fetchAttendances = useCallback(async () => {
    if (!selectedMeeting || activeTab !== "overview" || activeView === "meetings") return;
    setLoadingAttendances(true);
    try {
      const res = await apiCall<AttendanceRecord[]>(
        `/meetings/${selectedMeeting.id}/attendance/`
      );
      setAttendances(res || []);
    } catch {
      setAttendances([]);
    } finally {
      setLoadingAttendances(false);
    }
  }, [selectedMeeting, activeTab, activeView]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  // 4. Fetch Individual Tracking
  const fetchIndividual = useCallback(async () => {
    if (activeTab !== "individual" || activeView === "meetings") return;
    setLoadingIndividual(true);
    try {
      const qp = new URLSearchParams();
      if (searchParams.meeting_id) qp.set("meeting_id", searchParams.meeting_id);
      if (searchParams.cell_id && searchParams.cell_id !== "all") qp.set("cell_id", searchParams.cell_id);
      if (searchParams.department_id && searchParams.department_id !== "all") qp.set("department_id", searchParams.department_id);
      if (searchParams.gender && searchParams.gender !== "all") qp.set("gender", searchParams.gender);
      if (searchParams.status && searchParams.status !== "all") qp.set("status", searchParams.status);
      if (searchParams.page) qp.set("page", searchParams.page);

      const res = await apiCall<IndividualTrackingResponse>(
        `/meetings/attendance/individual/?${qp.toString()}`
      );
      setIndividualMembers(res.results || []);
      setIndividualTotal(res.count || 0);
      setIndividualTotalPages(res.total_pages || 1);
      setIndividualCurrentPage(res.current_page || 1);
    } catch {
      setIndividualMembers([]);
      setIndividualTotal(0);
    } finally {
      setLoadingIndividual(false);
    }
  }, [activeTab, activeView, searchParams]);

  useEffect(() => {
    fetchIndividual();
  }, [fetchIndividual]);

  // 5. Fetch Follow-up records
  const fetchFollowup = useCallback(async () => {
    if (activeTab !== "followup" || activeView === "meetings") return;
    setLoadingFollowup(true);
    try {
      const res = await apiCall<AttendanceFollowupResponse>(
        "/meetings/attendance/followup/"
      );
      setFollowupMembers(res.results || []);
    } catch {
      setFollowupMembers([]);
    } finally {
      setLoadingFollowup(false);
    }
  }, [activeTab, activeView]);

  useEffect(() => {
    fetchFollowup();
  }, [fetchFollowup]);

  // 6. Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    if (activeTab !== "analytics" && activeView !== "analytics") return;
    setLoadingAnalytics(true);
    try {
      const yr = searchParams.year || String(new Date().getFullYear());
      const res = await apiCall<AttendanceAnalyticsPayload>(
        `/meetings/attendance/analytics/?year=${yr}`
      );
      setAnalytics(res);
    } catch {
      setAnalytics(null);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [activeTab, activeView, searchParams.year]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Handle remove attendance
  const handleRemoveAttendance = async (attId: number) => {
    if (!selectedMeeting) return;
    try {
      await apiCall(`/meetings/${selectedMeeting.id}/attendance/${attId}/`, {
        method: "DELETE",
      });
      toast.success("Attendance check-in removed.");
      fetchAttendances();
      fetchSummary();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove check-in.");
    }
  };

  // Handle member selection for offcanvas
  const handleOpenMemberOffcanvas = (memberId: number) => {
    setSelectedMemberId(memberId);
    setOffcanvasOpen(true);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (activeTab === "individual" && individualMembers.length > 0) {
      const headers = ["Member ID", "Name", "Cell", "Department", "Gender", "Attended", "Total", "Rate %", "Status", "Last Attended"];
      const rows = individualMembers.map((m) => [
        m.member_id,
        `"${m.name.replace(/"/g, '""')}"`,
        `"${(m.cell_name || "Unassigned").replace(/"/g, '""')}"`,
        `"${(m.department || "General").replace(/"/g, '""')}"`,
        m.gender,
        m.attended_count,
        m.total_meetings,
        `${m.attendance_rate}%`,
        m.status_label,
        m.last_attended ? new Date(m.last_attended).toISOString() : "Never",
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `attendance_individual_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV export downloaded successfully.");
      return;
    }

    if (attendances.length > 0) {
      const headers = ["ID", "Member ID", "Member Name", "Phone", "Login Time"];
      const rows = attendances.map((a) => [
        a.id,
        a.member_id,
        `"${a.member_name.replace(/"/g, '""')}"`,
        `"${(a.phone_no || "").replace(/"/g, '""')}"`,
        new Date(a.login_time).toISOString(),
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `attendance_checkins_${selectedMeeting?.name || "session"}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV export downloaded successfully.");
      return;
    }

    toast.info("No attendance records to export in current view.");
  };

  // If view is 'meetings', render the Meetings Hub
  if (activeView === "meetings") {
    return <MeetingsHubView searchParams={searchParams} />;
  }

  // Otherwise render Attendance with sub-views
  return (
    <div className="space-y-6">
      {/* 1. Persistent Filter Toolbar */}
      <AttendanceToolbar
        searchParams={searchParams}
        filtersLookup={filtersLookup}
        meetings={allMeetings}
        onOpenKiosk={() => setKioskOpen(true)}
        onExportCsv={handleExportCsv}
      />

      {/* 2. KPI Strip */}
      <AttendanceKpiStrip
        summary={summary}
        loading={loadingSummary}
        deltaPct={analytics?.overall_rate ? Math.round(summary?.attendance_pct ? summary.attendance_pct - analytics.overall_rate : 0) : null}
      />

      {/* 3. Sub-View Navigation Pills (URL-driven) */}
      <AttendanceSubNav
        currentTab={activeTab}
        searchParams={searchParams}
      />

      {/* 4. Active Tab Sub-view Content */}
      {activeTab === "overview" && (
        <AttendanceOverviewTab
          meeting={selectedMeeting}
          attendances={attendances}
          loading={loadingAttendances}
          onOpenKiosk={() => setKioskOpen(true)}
          onSelectMember={handleOpenMemberOffcanvas}
          onRemoveAttendance={handleRemoveAttendance}
        />
      )}

      {activeTab === "individual" && (
        <AttendanceIndividualTab
          members={individualMembers}
          totalCount={individualTotal}
          currentPage={individualCurrentPage}
          totalPages={individualTotalPages}
          loading={loadingIndividual}
          searchParams={searchParams}
          filtersLookup={filtersLookup}
          onSelectMember={handleOpenMemberOffcanvas}
        />
      )}

      {activeTab === "followup" && (
        <AttendanceFollowupTab
          members={followupMembers}
          loading={loadingFollowup}
          onSelectMember={handleOpenMemberOffcanvas}
        />
      )}

      {activeTab === "analytics" && (
        <AttendanceAnalyticsTab
          analytics={analytics}
          loading={loadingAnalytics}
          filtersLookup={filtersLookup}
          selectedYear={searchParams.year || String(new Date().getFullYear())}
        />
      )}

      {/* 5. Check-in Kiosk Modal */}
      <CheckInKioskModal
        open={kioskOpen}
        onOpenChange={setKioskOpen}
        meeting={selectedMeeting}
        onCheckInSuccess={() => {
          fetchAttendances();
          fetchSummary();
        }}
      />

      {/* 6. Member Attendance Offcanvas */}
      <MemberAttendanceOffcanvas
        memberId={selectedMemberId}
        open={offcanvasOpen}
        onOpenChange={setOffcanvasOpen}
      />
    </div>
  );
}
