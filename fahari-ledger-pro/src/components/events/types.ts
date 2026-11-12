export interface EventItem {
  id: number;
  ename: string;
  branch: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  type: string | null;
  status: string | null;
  target_attendees: number;
  facilitation_fee: string;
  total_budget: string;
  image: string | null;
  registrations_count: number;
  attendance_count: number;
  registration_count?: number;
  checked_in_count?: number;
  budget_status: null;
  facilitator?: string | null;
}

export interface EventDetail extends EventItem {
  notes: string | null;
  delete_status: boolean;
  created_at: string;
  schedule_count: number;
}

export interface SessionTypeChoice {
  value: string;
  label: string;
}

export interface EventLookups {
  types: string[];
  branches: string[];
  statuses: string[];
  session_types: SessionTypeChoice[];
}

export interface EventScheduleItem {
  id: number;
  event_id: number;
  day_number: number;
  start_time: string;
  end_time: string;
  title: string;
  description: string | null;
  speaker: string | null;
  session_type: string;
  location: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EventRegistrationItem {
  id: number;
  event_id: number;
  names: string;
  gender: string;
  serve: boolean;
  attendees: string | null;
  phone_no: string;
  residence: string;
  category: string;
  travelling_from: string;
  prayer: string | null;
  special_needs: string | null;
  guardian_telno: string | null;
  email: string | null;
  sponsorship: string | null;
  qr_token?: string; // only present in detail or create responses
  created_at: string;
  updated_at: string | null;
  is_checked_in: boolean;
  check_in_time: string | null;
}

export interface EventAttendanceRecord {
  id: number;
  event_id: number;
  registration_id: number;
  check_in_time: string;
  check_in_method: "manual" | "qr";
  checked_in_by: number | null;
  checked_in_by_name: string | null;
  notes: string | null;
  names: string;
  phone_no: string;
}

export interface EventCheckinStatus {
  event_id: number;
  event_name: string;
  total_registered: number;
  total_checked_in: number;
  total_pending: number;
  attendance_rate: number;
  recent_checkins: EventAttendanceRecord[];
}

export interface DistributionItem {
  gender?: string;
  category?: string;
  residence?: string;
  travelling_from?: string;
  serve?: boolean;
  sponsorship?: string;
  count: number;
}

export interface EventDemographics {
  event_id: number;
  event_name: string;
  total_registrations: number;
  total_attended: number;
  attendance_rate: number;
  gender_distribution: { gender: string; count: number }[];
  category_distribution: { category: string; count: number }[];
  top_residences: { residence: string; count: number }[];
  travelling_from: { residence: string; count: number }[];
  serving_breakdown: { serve: boolean; count: number }[];
  sponsorship_breakdown: { sponsorship: string; count: number }[];
  financials: null;
}

export interface EventsSearchParams {
  view?: "hub" | "calendar" | "kiosk";
  tab?: "details" | "schedule" | "registrations" | "checkin" | "analytics" | "budget";
  eventId?: string;
  id?: string;
  q?: string;
  type?: string;
  status?: string;
  branch?: string;
  date_from?: string;
  date_to?: string;
  checked_in?: string;
  category?: string;
  gender?: string;
  page?: string;
}
