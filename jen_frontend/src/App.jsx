import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './website/pages/Home';
import About from './website/pages/About';
import TeamMemberDetails from './website/pages/TeamMemberDetails';
import Give from './website/pages/Give';
import Sermons from './website/pages/Sermons';
import Events from './website/pages/Events';
import Contact from './website/pages/Contact';
import Devotionals from './website/pages/Devotionals';
import DevotionalDetails from './website/pages/DevotionalDetails';
import Talks from './website/pages/Talks';
import Blogs from './website/pages/Blogs';
import Portal from './Portal/pages/Portal';
import PortalLayout from './Portal/layout/PortalLayout';
import Dashboard from './Portal/pages/Dashboard';
import CellsDashboard from './Portal/pages/CellsDashboard';
import AssignMembersDashboard from './Portal/pages/AssignMembersDashboard';
import MyCellDashboard from './Portal/pages/MyCellDashboard';
import CellAttendancePage from './Portal/pages/CellAttendancePage';
import CellAnalyticsPage from './Portal/pages/CellAnalyticsPage';
import FollowUpDashboard from './Portal/pages/FollowUpDashboard';
import MeetingsDashboard from './Portal/pages/MeetingsDashboard';
import EventsDashboard from './Portal/pages/EventsDashboard';
import AttendanceDashboard from './Portal/pages/AttendanceDashboard';
import EventAttendancePage from './Portal/pages/EventAttendancePage';
import EventSchedulePage from './Portal/pages/EventSchedulePage';
import EventBudgetPage from './Portal/pages/EventBudgetPage';
import MembersDashboard from './Portal/pages/MembersDashboard';
import UsersDashboard from './Portal/pages/UsersDashboard';
import MyAccountDashboard from './Portal/pages/MyAccountDashboard';
import MediaDashboard from './Portal/pages/MediaDashboard';
import CalendarPage from './Portal/pages/CalendarPage';
import DevotionalsDashboard from './Portal/pages/DevotionalsDashboard';
import WatchLive from './Portal/pages/WatchLive';
// import PrayersDashboard from './Portal/pages/PrayersDashboard'; // Deprecated
import FastingCommitment from './Portal/pages/prayers/FastingCommitment';
import PropheticInstructions from './Portal/pages/prayers/PropheticInstructions';
import PrayerCommunications from './Portal/pages/prayers/PrayerCommunications';
import FinanceDashboard from './Portal/pages/FinanceDashboard';
import ContributionsDashboard from './Portal/pages/finance/ContributionsDashboard';
import PledgesDashboard from './Portal/pages/finance/PledgesDashboard';
import BudgetsDashboard from './Portal/pages/finance/BudgetsDashboard';
import FinanceSettings from './Portal/pages/finance/FinanceSettings';
import ChartOfAccountsPage from './Portal/pages/accounting/ChartOfAccountsPage';
import GeneralLedgerPage from './Portal/pages/accounting/GeneralLedgerPage';
import TrialBalancePage from './Portal/pages/accounting/TrialBalancePage';
import IncomeStatementPage from './Portal/pages/accounting/IncomeStatementPage';
import BalanceSheetPage from './Portal/pages/accounting/BalanceSheetPage';
import JournalEntriesPage from './Portal/pages/accounting/JournalEntriesPage';
import PayrollPage from './Portal/pages/accounting/PayrollPage';
import AuditLogPage from './Portal/pages/accounting/AuditLogPage';
import { ThemeProvider } from './context/ThemeContext';
import { EventProvider } from './context/EventContext';
import { AuthProvider } from './context/AuthContext';
import EventRegistration from './website/pages/EventRegistration';
import MeetingAttendance from './website/pages/MeetingAttendance';
import ProtectedRoute from './components/ProtectedRoute';
import AddMemberPage from './website/pages/AddMember';
import PartnerPledge from './website/pages/PartnerPledge';
import Partners from './website/pages/Partners';
import TeamManagement from './Portal/pages/TeamManagement';
import EvangelismDashboard from './Portal/pages/EvangelismDashboard';
import Membership from './website/pages/Membership';
import FloatingContactWidget from './website/components/FloatingContactWidget';
import MerchandisePage from './website/MerchandisePage';
import MerchandiseDashboard from './Portal/pages/merchandise/MerchandiseDashboard';
import OrdersDashboard from './Portal/pages/merchandise/OrdersDashboard';

// Placeholder Pages
const Placeholder = ({ title }) => <h1 style={{ color: 'white' }}>{title}</h1>;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EventProvider>
          <Router>
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/about/team/:id" element={<TeamMemberDetails />} />
              <Route path="/sermons" element={<Sermons />} />
              <Route path="/talks" element={<Talks />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/events" element={<Events />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/devotionals" element={<Devotionals />} />
              <Route path="/devotionals/:slug" element={<DevotionalDetails />} />
              <Route path="/events/:eventId/register" element={<EventRegistration />} />
              <Route path="/meetings/:meetingId/attend" element={<MeetingAttendance />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Portal />} />
              <Route path="/portal" element={<Portal />} />
              <Route path="/cells" element={<Portal />} />
              <Route path="/dockets" element={<Portal />} />
              <Route path="/give" element={<Give />} />
              <Route path="/partner-give" element={<PartnerPledge />} />
              <Route path="/add-member" element={<AddMemberPage />} />
              <Route path="/merchandise" element={<MerchandisePage />} />

              {/* Authenticated Portal Routes */}
              <Route path="/portal" element={
                <ProtectedRoute>
                  <PortalLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="cells" element={<CellsDashboard />} />
                <Route path="cells/assign" element={<AssignMembersDashboard />} />
                <Route path="cells/attendance" element={<CellAttendancePage />} />
                <Route path="cells/analytics" element={<CellAnalyticsPage />} />
                <Route path="my-cell" element={<MyCellDashboard />} />
                <Route path="followups" element={<FollowUpDashboard />} />
                <Route path="meetings" element={<MeetingsDashboard />} />
                <Route path="meetings/events" element={<EventsDashboard />} />
                <Route path="meetings/attendance" element={<AttendanceDashboard />} />
                <Route path="meetings/event-attendance" element={<EventAttendancePage />} />
                <Route path="meetings/event-schedule" element={<EventSchedulePage />} />
                <Route path="meetings/event-budget" element={<EventBudgetPage />} />
                <Route path="members" element={<MembersDashboard />} />

                {/* Prayer Module Routes */}
                <Route path="prayers/fasting" element={<FastingCommitment />} />
                <Route path="prayers/prophetic" element={<PropheticInstructions />} />
                <Route path="prayers/communications" element={<PrayerCommunications />} />
                <Route path="media" element={<MediaDashboard />} />
                <Route path="media/live" element={<WatchLive />} />
                <Route path="devotionals" element={<DevotionalsDashboard />} />
                <Route path="giving" element={<FinanceDashboard />} />

                {/* Financial Management Routes */}
                <Route path="finance" element={<FinanceDashboard />} />
                <Route path="finance/contributions" element={<ContributionsDashboard />} />
                <Route path="finance/pledges" element={<PledgesDashboard />} />
                <Route path="finance/budgets" element={<BudgetsDashboard />} />
                <Route path="finance/settings" element={<FinanceSettings />} />

                {/* Accounting Module Routes */}
                <Route path="accounting/chart-of-accounts" element={<ChartOfAccountsPage />} />
                <Route path="accounting/general-ledger" element={<GeneralLedgerPage />} />
                <Route path="accounting/trial-balance" element={<TrialBalancePage />} />
                <Route path="accounting/income-statement" element={<IncomeStatementPage />} />
                <Route path="accounting/balance-sheet" element={<BalanceSheetPage />} />
                <Route path="accounting/journal-entries" element={<JournalEntriesPage />} />
                <Route path="accounting/payroll" element={<PayrollPage />} />
                <Route path="accounting/audit-log" element={<AuditLogPage />} />

                {/* Merchandise & Orders Routes */}
                <Route path="merchandise" element={<MerchandiseDashboard />} />
                <Route path="merchandise/orders" element={<OrdersDashboard />} />

                <Route path="users" element={<UsersDashboard />} />
                <Route path="users/account" element={<MyAccountDashboard />} />
                <Route path="team" element={<TeamManagement />} />
                <Route path="evangelism" element={<EvangelismDashboard />} />
                <Route path="roles" element={<Placeholder title="Roles & Permissions" />} />
              </Route>
            </Routes>
            <FloatingContactWidget />
          </Router>
        </EventProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
