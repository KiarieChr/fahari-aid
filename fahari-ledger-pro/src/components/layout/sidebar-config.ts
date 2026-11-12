import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  Calendar,
  CalendarCheck,
  CalendarDays,
  BookOpen,
  Landmark,
  Settings,
  ShieldCheck,
  Award,
  Wallet,
  PiggyBank,
  Banknote,
  Receipt,
  FileText,
  UserCheck,
  UserPlus,
  UserX,
  Activity,
  GitBranch,
  Flame,
  ClipboardList,
  GraduationCap,
  History,
  TrendingUp,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface ContextualSubItem {
  title: string;
  url: string;
  search?: Record<string, string | number | undefined>;
  badge?: string;
  description?: string;
  icon?: LucideIcon;
}

export interface ContextualGroup {
  heading: string;
  items: ContextualSubItem[];
}

export interface PrimaryModule {
  id: string;
  title: string;
  shortTitle?: string;
  icon: LucideIcon;
  rootUrl: string;
  matchPrefixes: string[];
  description: string;
  groups: ContextualGroup[];
}

export const primaryModules: PrimaryModule[] = [
  {
    id: "dashboard",
    title: "Operational Command",
    shortTitle: "Dashboard",
    icon: LayoutDashboard,
    rootUrl: "/",
    matchPrefixes: ["/"],
    description: "Central command metrics, attendance summaries, and daily church operations.",
    groups: [
      {
        heading: "OVERVIEW",
        items: [
          { title: "General Analytics", url: "/", icon: LayoutDashboard },
          { title: "Leadership Command", url: "/leadership", badge: "Senior", icon: ShieldCheck },
        ],
      },
      {
        heading: "OPERATIONAL SHORTCUTS",
        items: [
          { title: "Active Members", url: "/members", icon: Users },
          { title: "Financial Ledger", url: "/accounting", icon: Landmark },
          { title: "Financial Reports", url: "/reports", icon: FileText },
        ],
      },
    ],
  },
  {
    id: "members",
    title: "Members & Growth",
    shortTitle: "Members",
    icon: Users,
    rootUrl: "/members",
    matchPrefixes: ["/members", "/assimilation"],
    description: "Member records, intake trajectories, cell assimilation, and committed guests.",
    groups: [
      {
        heading: "GROWTH & ANALYTICS",
        items: [
          {
            title: "Growth Analytics",
            url: "/members?view=analytics",
            icon: TrendingUp,
            description: "Intake timeline, cell & department representation",
          },
          {
            title: "Member Assimilation",
            url: "/assimilation",
            icon: Activity,
            description: "New member follow-up & assimilation oversight",
          },
        ],
      },
      {
        heading: "DIRECTORY & ROSTER",
        items: [
          {
            title: "Member Directory",
            url: "/members?view=directory",
            icon: Users,
            description: "Searchable congregational roster",
          },
          {
            title: "Committed Members",
            url: "/members?view=committed",
            icon: UserCheck,
            description: "Committed guest registrations and profile linking",
          },
          {
            title: "Unassigned Members",
            url: "/members?view=directory&cell_id=unassigned",
            badge: "Care",
            icon: UserX,
            description: "Unassigned congregants pending cell placement",
          },
          {
            title: "Register Member",
            url: "/members?action=register",
            icon: UserPlus,
            description: "New member intake registration",
          },
        ],
      },
      {
        heading: "CARE & STRUCTURE",
        items: [
          {
            title: "Pastoral Alerts & Senior Oversight",
            url: "/assimilation?view=oversight",
            badge: "Senior",
            icon: ShieldCheck,
            description: "Senior management oversight, SLA compliance & pastoral alerts",
          },
          {
            title: "Cell Fellowships",
            url: "/cells",
            icon: Flame,
            description: "Home cell groups and fellowship oversight",
          },
        ],
      },
    ],
  },
  {
    id: "cells",
    title: "Cell Ministry",
    shortTitle: "Cells",
    icon: HeartHandshake,
    rootUrl: "/cells",
    matchPrefixes: ["/cells"],
    description: "Cell group oversight, home fellowships, leader reports, and cell attendance.",
    groups: [
      {
        heading: "CELL OVERSIGHT",
        items: [
          { title: "Cell Oversight Dashboard", url: "/cells", icon: HeartHandshake },
          { title: "Cell Directory", url: "/cells?tab=directory", icon: Users },
        ],
      },
      {
        heading: "LEADERSHIP & OPERATIONS",
        items: [
          { title: "My Cell Dashboard", url: "/cells?tab=my-cell", badge: "Leader", icon: Flame },
          { title: "Weekly Attendance", url: "/cells?tab=attendance", icon: CalendarCheck },
          { title: "Cell Reports & Minutes", url: "/cells?tab=reports", icon: FileText },
        ],
      },
    ],
  },
  {
    id: "meetings",
    title: "Meetings & Services",
    shortTitle: "Meetings",
    icon: CalendarCheck,
    rootUrl: "/meetings",
    matchPrefixes: ["/meetings", "/minutes"],
    description: "Sunday services, mid-week fellowships, leadership meetings, and service attendance.",
    groups: [
      {
        heading: "MEETINGS",
        items: [
          {
            title: "Meetings Hub",
            url: "/meetings",
            search: { view: "meetings" },
            icon: Calendar,
            description: "All meetings and category directory",
          },
          {
            title: "Attendance & Tracking",
            url: "/meetings",
            search: { view: "attendance" },
            badge: "Care",
            icon: UserCheck,
            description: "Check-in logs and pastoral individual tracking",
          },
          {
            title: "Attendance Analytics",
            url: "/meetings",
            search: { view: "analytics" },
            icon: BarChart3,
            description: "Monthly trends, cell and department breakdowns",
          },
          {
            title: "Meeting Minutes",
            url: "/minutes",
            icon: BookOpen,
            description: "Meeting records and minutes documents",
          },
        ],
      },
    ],
  },
  {
    id: "events",
    title: "Events & Programs",
    shortTitle: "Events",
    icon: CalendarDays,
    rootUrl: "/events",
    matchPrefixes: ["/events"],
    description: "Conferences, camps, tickets, RSVPs, speaker schedules, and day-of QR check-in.",
    groups: [
      {
        heading: "EVENT MANAGEMENT",
        items: [
          { title: "Events Calendar", url: "/events", icon: CalendarDays },
          { title: "Event Schedules & Timetables", url: "/events?tab=schedules", icon: ClipboardList },
        ],
      },
      {
        heading: "ATTENDANCE & CHECK-IN",
        items: [
          { title: "Registrations & RSVPs", url: "/events?tab=registrations", icon: Users },
          { title: "Day-of QR Check-in", url: "/events?tab=checkin", badge: "Scanner", icon: UserCheck },
        ],
      },
    ],
  },
  {
    id: "training",
    title: "Equipping & Training",
    shortTitle: "Training",
    icon: BookOpen,
    rootUrl: "/training",
    matchPrefixes: ["/training"],
    description: "Discipleship curricula, leadership training tracks, modules, and mentorship hub.",
    groups: [
      {
        heading: "DISCIPLESHIP & COURSES",
        items: [
          { title: "Training Courses & Tracks", url: "/training", icon: GraduationCap },
          { title: "My Module Progress", url: "/training?tab=progress", icon: BookOpen },
        ],
      },
      {
        heading: "MENTORSHIP & COACHING",
        items: [
          { title: "Mentorship Hub", url: "/training?tab=mentorship", badge: "Hub", icon: ShieldCheck },
          { title: "Trainer Evaluations", url: "/training?tab=evaluations", icon: FileText },
        ],
      },
    ],
  },
  {
    id: "finance",
    title: "Finance & Stewardship",
    shortTitle: "Finance",
    icon: Landmark,
    rootUrl: "/accounting",
    matchPrefixes: ["/accounting", "/finance", "/reports", "/savings", "/loans", "/repayments", "/pos"],
    description: "Double-entry general ledger, tithes, offerings, pledges, budgets, and statements.",
    groups: [
      {
        heading: "GENERAL LEDGER",
        items: [
          { title: "General Ledger", url: "/accounting", icon: Landmark },
          { title: "Chart of Accounts", url: "/accounting?tab=accounts", icon: FileText },
          { title: "Journal Entries", url: "/accounting?tab=journals", icon: Receipt },
          { title: "Financial Reports", url: "/reports", icon: FileText },
        ],
      },
      {
        heading: "GIVING & PARTNERSHIPS",
        items: [
          { title: "Partnership Pledges", url: "/accounting?tab=pledges", badge: "Pledges", icon: Award },
          { title: "Tithes & Offerings", url: "/accounting?tab=collections", icon: Wallet },
        ],
      },
      {
        heading: "FINANCIAL MODULES (RETAINED)",
        items: [
          { title: "Savings & Funds", url: "/savings", icon: PiggyBank },
          { title: "Benevolence Loans", url: "/loans", icon: Banknote },
          { title: "Loan Repayments", url: "/repayments", icon: History },
          { title: "Merchandise POS", url: "/pos", icon: Receipt },
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "System & Governance",
    shortTitle: "Settings",
    icon: Settings,
    rootUrl: "/settings",
    matchPrefixes: ["/settings"],
    description: "System administration, portal access, security roles, and audit trail logs.",
    groups: [
      {
        heading: "ADMINISTRATION",
        items: [
          { title: "General Preferences", url: "/settings", icon: Settings },
          { title: "System Users & Portal", url: "/settings?tab=users", icon: Users },
        ],
      },
      {
        heading: "GOVERNANCE & SECURITY",
        items: [
          { title: "Roles & Permissions", url: "/settings?tab=roles", badge: "Security", icon: ShieldCheck },
          { title: "System Audit Trail", url: "/settings?tab=audit", icon: History },
        ],
      },
    ],
  },
];
