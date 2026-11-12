export interface MeetingTypeItem {
  id: number;
  name: string;
  meeting_count?: number;
}

export interface FacilitatorItem {
  id: number;
  name: string;
}

export interface LookupItem {
  id: number;
  name: string;
}

export interface MeetingsFiltersLookup {
  types: LookupItem[];
  cells: LookupItem[];
  departments: LookupItem[];
  facilitators: FacilitatorItem[];
  years: number[];
}

export interface MeetingListItem {
  id: number;
  name: string;
  meeting_code?: string;
  meeting_type: number | { id: number; name: string };
  meeting_type_name?: string;
  facilitator_id?: number;
  facilitator: number | { id: number; name?: string; email?: string; member?: { first_name?: string; last_name?: string } };
  facilitator_name?: string;
  start_time: string;
  end_time: string | null;
  meeting_link: string | null;
  description: string | null;
  attendance_count: number;
  has_minutes: boolean;
  minutes_count?: number;
  last_updated?: string | null;
}

export interface AttendanceRecord {
  id: number;
  meeting_id: number;
  member_id: number;
  member_name: string;
  phone_no?: string;
  login_time: string;
}

export interface EligibleMember {
  id: number;
  member_id: number;
  member_name: string;
  phone_no: string;
}

export interface AttendanceSummary {
  meeting_id?: number;
  meeting_name?: string;
  total_members: number;
  attended: number;
  absent: number;
  total_checkins: number;
  attendance_pct: number;
  overall_attendance_pct?: number;
}

export interface IndividualAttendanceMember {
  member_id: number;
  name: string;
  cell_name: string;
  department: string;
  gender: string;
  attended_count: number;
  total_meetings: number;
  attendance_rate: number;
  status_label: "Regular" | "Irregular" | "Needs Follow-up" | string;
  last_attended: string | null;
  phone_no?: string;
}

export interface IndividualTrackingResponse {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  results: IndividualAttendanceMember[];
}

export interface AttendanceFollowupResponse {
  count: number;
  results: IndividualAttendanceMember[];
}

export interface AttendanceAnalyticsPayload {
  year: number;
  meetings_in_year: number;
  total_checkins: number;
  overall_rate: number;
  monthly: Array<{ month: string; label: string; count: number }>;
  by_cell: Array<{ cell_id: number | null; cell_name: string; count: number }>;
  by_department: Array<{ department_id: number | null; department_name: string; count: number }>;
  by_gender: Array<{ gender: string; count: number }>;
  // Extended keys if delivered:
  rate_trend?: Array<{ month: string; label: string; count: number; rate: number }>;
  by_type?: Array<{ type_name: string; meetings: number; avg_attendees: number; unique_attendees: number; return_rate: number; trend: number[] }>;
  top_attendees?: Array<{ member_id: number; name: string; attended_count: number; rate: number }>;
  at_risk?: Array<{ member_id: number; name: string; rate: number; last_attended: string | null }>;
  by_weekday?: Array<{ day: string; morning: number; midday: number; afternoon: number; evening: number }>;
  by_facilitator?: Array<{ name: string; avg_attendees: number; meeting_count: number }>;
  cell_vs_unassigned?: { cell_rate: number; unassigned_rate: number; ratio_phrase: string };
  growth_vs_attendance?: Array<{ month: string; new_members: number; avg_attendance: number }>;
}

export interface MeetingMinutesPayload {
  id: number | null;
  meeting_id: number;
  minutes: string | null;
  personnel_id: number | null;
  personnel_name: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MemberProfileAttendance {
  meeting_id: number;
  meeting_name: string;
  date: string;
  date_formatted: string;
  attended: boolean;
}

export interface MemberProfileResponse {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  gender: string;
  cell_name: string;
  cell_code?: string;
  department: string;
  attendance: {
    attended_count: number;
    total_meetings: number;
    attendance_rate: number;
    status_label: string;
  };
  recent_attendance: MemberProfileAttendance[];
}
