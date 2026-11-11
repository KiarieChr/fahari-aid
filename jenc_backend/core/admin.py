from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html

from .models import (
    Department,
    SubDepartment,
    Member,
    Role,
    Permission,
    PermissionCategory,
    CustomUser,
    MeetingType,
    Meeting,
    Attendance,
    Cell,
    CellAttendance,
    Event,
    EventRegistration,
    EventAttendance,
    EventSchedule,
    Account,
    AccountingPeriod,
    JournalEntry,
    JournalEntryLine,
    Fund,
    IncomeType,
    ExpenseType,
    PaymentMethod,
    PaymentAccountMap,
    Contribution,
    ContributionDetails,
    Expense,
    Income,
    Pledges,
    PledgesRedeem,
    Collections,
    BudgetCategory,
    Budget,
    BudgetDetails,
    PayrollRun,
    PayrollItem,
    Payroll,
    Bills,
    BillPayments,
    TrnLearningTracks,
    TrnLearningModules,
    TrnTrackEnrollments,
    TrnModuleProgress,
    TrnPracticalAssignments,
    TrnAssignmentSubmissions,
    TrnCoaches,
    TrnCoachEvaluations,
    TrnMentors,
    TrnMentorshipAssignments,
    TrnMentorshipSessions,
    TrnModuleReflections,
    TrnSharedJournals,
    InstitutionSetting,
    MediaItem,
)

# Admin Site Branding
admin.site.site_header = "Jesus Enthroned Network — Administration"
admin.site.site_title = "JEN Admin Portal"
admin.site.index_title = "Church Operations, Member Care & Financial Administration"


# ── 1. USERS & PERMISSIONS ──

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'status', 'member_link', 'date')
    list_filter = ('is_staff', 'is_superuser', 'status', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'member__first_name', 'member__last_name')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'member', 'bio')}),
        ('Permissions', {'fields': ('is_active', 'status', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'is_staff', 'is_superuser'),
        }),
    )

    def member_link(self, obj):
        if obj.member:
            return f"{obj.member.first_name} {obj.member.last_name} (#{obj.member.id})"
        return "—"
    member_link.short_description = "Linked Member"


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'delete_status')
    search_fields = ('name', 'description')
    list_filter = ('delete_status',)


@admin.register(PermissionCategory)
class PermissionCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'created_at')
    list_filter = ('category',)
    search_fields = ('name',)


# ── 2. MEMBERS & DEPARTMENTS ──

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'phone_no', 'gender', 'marital', 'emp_status', 'location', 'cell_id', 'delete_status')
    list_filter = ('gender', 'marital', 'emp_status', 'delete_status')
    search_fields = ('first_name', 'phone_no', 'email', 'location', 'address')
    ordering = ('id',)

    def full_name(self, obj):
        return f"{obj.first_name or ''}".strip()
    full_name.short_description = "Member Name"


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'delete_status')
    search_fields = ('name',)
    list_filter = ('delete_status',)


@admin.register(SubDepartment)
class SubDepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'department')
    search_fields = ('name', 'department__name')
    list_filter = ('department',)


# ── 3. CELLS & FELLOWSHIPS ──

@admin.register(Cell)
class CellAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'name', 'category', 'meeting_day', 'meeting_time', 'location', 'capacity')
    search_fields = ('code', 'name', 'location', 'category')
    list_filter = ('meeting_day', 'category')


@admin.register(CellAttendance)
class CellAttendanceAdmin(admin.ModelAdmin):
    list_display = ('id', 'cell_id', 'member_id', 'meeting_date', 'present', 'recorded_by', 'recorded_at')
    list_filter = ('meeting_date', 'present')
    search_fields = ('cell_id', 'member_id')
    date_hierarchy = 'meeting_date'


# ── 4. MEETINGS & CORPORATE WORSHIP ──

@admin.register(MeetingType)
class MeetingTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name',)


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'meeting_type', 'start_time', 'end_time', 'facilitator')
    list_filter = ('meeting_type',)
    search_fields = ('name', 'facilitator', 'description')
    date_hierarchy = 'start_time'


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('id', 'member_id', 'meeting_id', 'login_time')
    search_fields = ('member_id__first_name', 'member_id__phone_no', 'meeting_id__name')
    list_filter = ('login_time',)
    date_hierarchy = 'login_time'


# ── 5. EVENTS & CONFERENCES ──

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'ename', 'branch', 'start_date', 'end_date', 'delete_status', 'created_at')
    list_filter = ('branch', 'delete_status')
    search_fields = ('ename', 'notes')


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('id', 'names', 'gender', 'phone_no', 'residence', 'category', 'attendees')
    list_filter = ('gender', 'category', 'serve')
    search_fields = ('names', 'phone_no', 'residence')


@admin.register(EventAttendance)
class EventAttendanceAdmin(admin.ModelAdmin):
    list_display = ('id', 'event_id', 'registration_id', 'check_in_time', 'check_in_method', 'checked_in_by')
    list_filter = ('check_in_method', 'check_in_time')
    search_fields = ('checked_in_by', 'notes')
    date_hierarchy = 'check_in_time'


@admin.register(EventSchedule)
class EventScheduleAdmin(admin.ModelAdmin):
    list_display = ('id', 'event_id', 'day_number', 'title', 'speaker', 'start_time', 'end_time')
    list_filter = ('event_id', 'day_number')
    search_fields = ('title', 'speaker', 'description')


# ── 6. CONTRIBUTIONS, TITHES & GIVING ──

@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display = ('id', 'member', 'amount', 'contritype', 'fund', 'paymentmethod', 'date', 'status')
    list_filter = ('contritype', 'fund', 'paymentmethod', 'status', 'branch')
    search_fields = ('member', 'contritype', 'fund', 'paymentmethod')
    date_hierarchy = 'date'


@admin.register(ContributionDetails)
class ContributionDetailsAdmin(admin.ModelAdmin):
    list_display = ('contribution_id', 'amount', 'batch', 'contritype', 'fund', 'paymentmethod', 'delete_status')
    list_filter = ('contritype', 'fund', 'paymentmethod')
    search_fields = ('contritype', 'fund', 'batch')


@admin.register(Pledges)
class PledgesAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'purpose', 'pledges_amount', 'date', 'recurring', 'notes')
    list_filter = ('purpose', 'recurring', 'date')
    search_fields = ('full_name', 'purpose', 'notes')


@admin.register(PledgesRedeem)
class PledgesRedeemAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'mpesa_code', 'pledge_id', 'phone_no', 'redeemed_amount', 'recorded_on')
    list_filter = ('recorded_on',)
    search_fields = ('email', 'mpesa_code', 'phone_no')


@admin.register(Collections)
class CollectionsAdmin(admin.ModelAdmin):
    list_display = ('id', 'payee', 'payment_for', 'payment_mode', 'doc_reference', 'recorded_on', 'cancelled')
    list_filter = ('payment_mode', 'cancelled')
    search_fields = ('payee', 'doc_reference', 'description')


# ── 7. FINANCIAL SETTINGS & FUNDS ──

@admin.register(Fund)
class FundAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'note', 'total', 'delete_status')
    list_filter = ('delete_status',)
    search_fields = ('name', 'note')


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'delete_status')
    list_filter = ('delete_status',)
    search_fields = ('name',)


@admin.register(PaymentAccountMap)
class PaymentAccountMapAdmin(admin.ModelAdmin):
    list_display = ('id', 'payment_method_id', 'account_id')


@admin.register(IncomeType)
class IncomeTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'gl_account_id', 'delete_status')
    list_filter = ('delete_status',)
    search_fields = ('name',)


@admin.register(ExpenseType)
class ExpenseTypeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'gl_account_id', 'delete_status')
    list_filter = ('delete_status',)
    search_fields = ('name',)


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ('id', 'branch', 'incometype', 'amount', 'date', 'description')
    list_filter = ('incometype', 'branch')
    search_fields = ('description', 'branch')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'branch', 'expensetype', 'amount', 'date', 'description')
    list_filter = ('expensetype', 'branch')
    search_fields = ('description', 'branch')


# ── 8. ACCOUNTING & GENERAL LEDGER ──

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('id', 'account_code', 'account_name', 'account_type', 'is_active', 'description')
    list_filter = ('account_type', 'is_active')
    search_fields = ('account_code', 'account_name', 'description')


@admin.register(AccountingPeriod)
class AccountingPeriodAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'start_date', 'end_date', 'is_closed', 'closed_by', 'closed_at')
    list_filter = ('is_closed',)
    search_fields = ('name',)


class JournalEntryLineInline(admin.TabularInline):
    model = JournalEntryLine
    extra = 2


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'entry_date', 'reference_no', 'description', 'source_type', 'is_posted')
    list_filter = ('is_posted', 'source_type', 'entry_date')
    search_fields = ('reference_no', 'description')
    inlines = [JournalEntryLineInline]
    date_hierarchy = 'entry_date'


@admin.register(BudgetCategory)
class BudgetCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_on', 'created_by')
    search_fields = ('name',)


class BudgetDetailsInline(admin.TabularInline):
    model = BudgetDetails
    extra = 1


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('id', 'budget_name', 'budget_purpose', 'is_active', 'fund_id', 'accounting_period_id')
    list_filter = ('is_active', 'fund_id')
    search_fields = ('budget_name', 'budget_purpose')
    inlines = [BudgetDetailsInline]


# ── 9. PAYROLL & BILLS ──

@admin.register(PayrollRun)
class PayrollRunAdmin(admin.ModelAdmin):
    list_display = ('id', 'pay_period_start', 'pay_period_end', 'description', 'status', 'total_gross', 'total_net')
    list_filter = ('status',)
    search_fields = ('description',)


@admin.register(PayrollItem)
class PayrollItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee_name', 'payroll_run_id', 'basic_salary', 'allowances', 'deductions', 'net_pay')
    search_fields = ('employee_name',)


@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = ('id', 'employee_name', 'user_name', 'branch', 'payroll_date', 'total_pay')
    list_filter = ('branch', 'payroll_date')
    search_fields = ('employee_name', 'user_name')


@admin.register(Bills)
class BillsAdmin(admin.ModelAdmin):
    list_display = ('id', 'vendor_name', 'bill_number', 'bill_date', 'due_date', 'amount', 'balance_due')
    search_fields = ('vendor_name', 'bill_number', 'description')
    list_filter = ('bill_date', 'due_date')


@admin.register(BillPayments)
class BillPaymentsAdmin(admin.ModelAdmin):
    list_display = ('id', 'bill_id', 'payment_date', 'payment_method', 'amount', 'reference_no')
    list_filter = ('payment_method', 'payment_date')
    search_fields = ('reference_no', 'notes')


# ── 10. MEDIA & SERMONS ──

@admin.register(MediaItem)
class MediaItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'media_type', 'preacher', 'series', 'date', 'duration', 'views_count', 'featured')
    list_filter = ('media_type', 'featured', 'date')
    search_fields = ('title', 'preacher', 'series', 'description')
    date_hierarchy = 'date'


# ── 11. INSTITUTION & BRANDING SETTINGS ──

@admin.register(InstitutionSetting)
class InstitutionSettingAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'short_name', 'tagline', 'primary_color')
    search_fields = ('name', 'tagline')


# ── 12. TRAINING, DISCIPLESHIP & MENTORSHIP ──

@admin.register(TrnLearningTracks)
class TrnLearningTracksAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('title', 'description')


@admin.register(TrnLearningModules)
class TrnLearningModulesAdmin(admin.ModelAdmin):
    list_display = ('id', 'track_id', 'title', 'sequence_no', 'content_type', 'requires_practical')
    list_filter = ('content_type', 'requires_practical')
    search_fields = ('title',)


@admin.register(TrnTrackEnrollments)
class TrnTrackEnrollmentsAdmin(admin.ModelAdmin):
    list_display = ('id', 'trainee_id', 'track_id', 'coach_id', 'progress_pct', 'status', 'enrolled_at')
    list_filter = ('status',)


@admin.register(TrnMentors)
class TrnMentorsAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'max_mentees', 'status', 'created_at')
    list_filter = ('status',)


@admin.register(TrnMentorshipSessions)
class TrnMentorshipSessionsAdmin(admin.ModelAdmin):
    list_display = ('id', 'mentor_id', 'trainee_id', 'session_date', 'duration_mins', 'session_type')
    list_filter = ('session_type', 'session_date')
