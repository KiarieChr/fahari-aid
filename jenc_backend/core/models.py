from django.conf import settings
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission as DjangoPermission


# ==============================================================================
# 1. DEPARTMENTS
# ==============================================================================
class Department(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=100, db_column='name')
    description = models.CharField(max_length=100, db_column='description')
    delete_status = models.IntegerField(default=0, db_column='delete_status')

    class Meta:
        db_table = 'departments'

    def __str__(self):
        return self.name


# ==============================================================================
# 2. SUB-DEPARTMENTS
# ==============================================================================
class SubDepartment(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        db_column='department',
        related_name='sub_departments'
    )
    name = models.CharField(max_length=100, db_column='name')

    class Meta:
        db_table = 'sub_departments'

    def __str__(self):
        return self.name


# ==============================================================================
# 3. MEMBER
# ==============================================================================
class Member(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    batch_id = models.IntegerField(blank=True, null=True, db_column='batch_id')
    cell_id = models.IntegerField(blank=True, null=True, db_column='cell_id')
    first_name = models.CharField(max_length=100, db_column='first_name')
    gender = models.CharField(max_length=100, blank=True, null=True, db_column='gender')
    marital = models.CharField(max_length=100, blank=True, null=True, db_column='marital')
    emp_status = models.CharField(max_length=200, blank=True, null=True, db_column='emp_status')
    phone_no = models.CharField(max_length=100, db_column='phone_no')
    email = models.CharField(max_length=100, db_column='email')
    bod = models.DateField(blank=True, null=True, db_column='bod')
    address = models.CharField(max_length=100, blank=True, null=True, db_column='address')
    photo = models.CharField(max_length=100, blank=True, null=True, db_column='photo')
    description = models.TextField(blank=True, null=True, db_column='description')
    photo1 = models.CharField(max_length=100, blank=True, null=True, db_column='photo1')
    location = models.CharField(max_length=100, blank=True, null=True, db_column='location')
    country_code = models.CharField(max_length=100, blank=True, null=True, db_column='country_code')
    testfield = models.CharField(max_length=100, blank=True, null=True, db_column='testfield')
    department = models.CharField(max_length=100, blank=True, null=True, db_column='department')
    study_level = models.CharField(max_length=100, blank=True, null=True, db_column='study_level')
    delete_status = models.CharField(
        max_length=100,
        default='Active',
        blank=True,
        null=True,
        db_column='delete_status'
    )
    department_id = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='department_id',
        related_name='members'
    )
    sub_ministerial = models.ForeignKey(
        SubDepartment,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='sub_ministerial',
        related_name='members'
    )
    last_name = models.CharField(max_length=100, blank=True, null=True, db_column='last_name')
    joined_on = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='joined_on')
    branch_id = models.CharField(max_length=100, default='1', blank=True, null=True, db_column='branch_id')

    class Meta:
        db_table = 'member'

    def __str__(self):
        return f"{self.first_name} {self.last_name or ''}".strip()


# ==============================================================================
# 4. ROLES
# ==============================================================================
# Legacy direct table mapping:
class Role(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=100, db_column='name')
    description = models.CharField(max_length=200, blank=True, null=True, db_column='description')
    delete_status = models.BooleanField(default=False, db_column='delete_status')

    class Meta:
        db_table = 'roles'

    def __str__(self):
        return self.name


# Proxy model to integrate with Django's Group subsystem:
class RoleGroupProxy(Group):
    class Meta:
        proxy = True
        verbose_name = 'Role (Group Proxy)'
        verbose_name_plural = 'Roles (Group Proxies)'


# ==============================================================================
# 5. PERMISSIONS
# ==============================================================================
# Legacy direct table mapping:
class Permission(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=100, unique=True, db_column='name')
    category = models.ForeignKey(
        'PermissionCategory',
        on_delete=models.CASCADE,
        db_column='category',
        related_name='legacy_permissions'
    )
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'permissions'

    def __str__(self):
        return self.name


# Proxy model to integrate with Django's Permission subsystem:
class PermissionProxy(DjangoPermission):
    class Meta:
        proxy = True
        verbose_name = 'Permission (Django Proxy)'
        verbose_name_plural = 'Permissions (Django Proxies)'


# ==============================================================================
# 6. PERMISSION CATEGORY
# ==============================================================================
class PermissionCategory(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=100, blank=True, null=True, db_column='name')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'permission_category'

    def __str__(self):
        return self.name or f"Category #{self.id}"


# ==============================================================================
# 7. USERS (Custom User Model)
# ==============================================================================
class CustomUserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifier for authentication
    instead of usernames.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('status', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    id = models.AutoField(primary_key=True, db_column='id')
    username = None  # Remove default username field
    email = models.EmailField(max_length=100, unique=True, db_column='email')

    member = models.OneToOneField(
        Member,
        on_delete=models.CASCADE,
        db_column='member_id',
        related_name='user',
        blank=True,
        null=True
    )

    date = models.DateTimeField(auto_now_add=True, db_column='date')
    update_date = models.DateTimeField(auto_now=True, db_column='update_date')
    status = models.BooleanField(default=True, db_column='status')
    bio = models.TextField(blank=True, null=True, db_column='bio')

    # Avoid reverse-accessor clashes with default auth.User
    groups = models.ManyToManyField(
        Group,
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        DjangoPermission,
        related_name='custom_user_permission_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


# ==============================================================================
# PHASE 2: CHURCH STRUCTURE AND EVENTS
# ==============================================================================

# ==============================================================================
# 8. MEETING_TYPES
# ==============================================================================
class MeetingType(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=100, unique=True, blank=True, null=True, db_column='name')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'meeting_types'

    def __str__(self):
        return self.name or f"MeetingType #{self.id}"


# Alias for plural naming compatibility
MeetingTypes = MeetingType


# ==============================================================================
# 9. MEETING
# ==============================================================================
class Meeting(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=100, db_column='name')
    start_time = models.DateTimeField(db_column='start_time')
    end_time = models.DateTimeField(blank=True, null=True, db_column='end_time')
    facilitator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='facilitator',
        related_name='facilitated_meetings',
    )
    meeting_link = models.CharField(max_length=200, blank=True, null=True, db_column='meeting_link')
    meeting_type = models.ForeignKey(
        MeetingType,
        on_delete=models.CASCADE,
        db_column='meeting_type',
        default=1,
        blank=True,
        null=True,
        related_name='meetings',
    )
    description = models.TextField(blank=True, null=True, db_column='description')
    banner = models.CharField(max_length=255, blank=True, null=True, db_column='banner')
    branch = models.CharField(max_length=100, blank=True, null=True, db_column='branch')
    meeting_code = models.CharField(max_length=50, blank=True, null=True, db_column='meeting_code')

    class Meta:
        db_table = 'meeting'

    def __str__(self):
        return self.name


# ==============================================================================
# 10. ATTENDANCE
# ==============================================================================
class Attendance(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    member_id = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        db_column='member_id',
        related_name='meeting_attendances',
    )
    meeting_id = models.ForeignKey(
        Meeting,
        on_delete=models.CASCADE,
        db_column='meeting_id',
        related_name='attendances',
    )
    login_time = models.DateTimeField(auto_now_add=True, db_column='login_time')

    class Meta:
        db_table = 'attendance'

    def __str__(self):
        return f"Attendance #{self.id} - Member #{self.member_id_id} at Meeting #{self.meeting_id_id}"


# ==============================================================================
# 11. CELLS
# ==============================================================================
class Cell(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    code = models.CharField(max_length=100, blank=True, null=True, db_column='code')
    name = models.CharField(max_length=100, blank=True, null=True, db_column='name')
    category = models.CharField(max_length=50, default='General', blank=True, null=True, db_column='category')
    meeting_day = models.CharField(max_length=20, blank=True, null=True, db_column='meeting_day')
    meeting_time = models.TimeField(blank=True, null=True, db_column='meeting_time')
    location = models.CharField(max_length=200, blank=True, null=True, db_column='location')
    capacity = models.IntegerField(default=15, blank=True, null=True, db_column='capacity')
    cell_leader = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        db_column='cell_leader',
        related_name='led_cells',
    )
    leader_in_training_id = models.ForeignKey(
        Member,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='leader_in_training_id',
        related_name='in_training_cells',
    )
    status = models.IntegerField(default=1, db_column='status')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'cells'

    def __str__(self):
        return self.name or self.code or f"Cell #{self.id}"


# Alias for plural naming compatibility
Cells = Cell


# ==============================================================================
# 12. CELL_ATTENDANCE
# ==============================================================================
class CellAttendance(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    cell_id = models.ForeignKey(
        Cell,
        on_delete=models.CASCADE,
        db_column='cell_id',
        related_name='attendances',
    )
    member_id = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        db_column='member_id',
        related_name='cell_attendances',
    )
    meeting_date = models.DateField(db_column='meeting_date')
    present = models.BooleanField(default=True, db_column='present')
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='recorded_by',
        related_name='recorded_cell_attendances',
    )
    recorded_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='recorded_at')

    class Meta:
        db_table = 'cell_attendance'
        constraints = [
            models.UniqueConstraint(
                fields=['cell_id', 'member_id', 'meeting_date'],
                name='unique_cell_member_date',
            )
        ]

    def __str__(self):
        return f"Cell #{self.cell_id_id} - Member #{self.member_id_id} on {self.meeting_date}"


# ==============================================================================
# 13. EVENT
# ==============================================================================
class Event(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    ename = models.CharField(max_length=100, db_column='ename')
    branch = models.CharField(max_length=100, db_column='branch')
    start_date = models.DateTimeField(db_column='start_date')
    end_date = models.DateTimeField(db_column='end_date')
    notes = models.TextField(blank=True, null=True, db_column='notes')
    delete_status = models.BooleanField(default=False, db_column='delete_status')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')
    target_attendees = models.IntegerField(default=100, db_column='target_attendees')
    facilitation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, db_column='facilitation_fee')
    total_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, db_column='total_budget')
    type = models.CharField(max_length=50, default='general', blank=True, null=True, db_column='type')
    image = models.CharField(max_length=500, blank=True, null=True, db_column='image')
    status = models.CharField(max_length=50, default='published', blank=True, null=True, db_column='status')
    start_time = models.TimeField(blank=True, null=True, db_column='start_time')

    class Meta:
        db_table = 'event'

    def __str__(self):
        return self.ename

    @property
    def location(self):
        return self.branch or 'Main Auditorium'


# ==============================================================================
# 14. EVENT_REGISTRATION
# ==============================================================================
class EventRegistration(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    names = models.CharField(max_length=200, db_column='names')
    gender = models.CharField(max_length=20, db_column='gender')
    serve = models.BooleanField(default=False, db_column='serve')
    attendees = models.CharField(max_length=20, blank=True, null=True, db_column='attendees')
    phone_no = models.CharField(max_length=200, db_column='phone_no')
    residence = models.CharField(max_length=200, db_column='residence')
    category = models.CharField(max_length=200, db_column='category')
    travelling_from = models.CharField(max_length=200, db_column='travelling_from')
    prayer = models.TextField(blank=True, null=True, db_column='prayer')
    special_needs = models.TextField(blank=True, null=True, db_column='special_needs')
    guardian_telno = models.CharField(max_length=20, blank=True, null=True, db_column='guardian_telno')
    email = models.CharField(max_length=100, blank=True, null=True, db_column='email')
    event_id = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        db_column='event_id',
        related_name='registrations',
    )
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, db_column='updated_at')
    sponsorship = models.CharField(max_length=100, blank=True, null=True, db_column='sponsorship')
    qr_token = models.CharField(max_length=64, blank=True, null=True, db_column='qr_token')

    class Meta:
        db_table = 'event_registration'

    def __str__(self):
        return f"{self.names} ({self.phone_no}) - Event #{self.event_id_id}"


# ==============================================================================
# 15. EVENT_ATTENDANCE
# ==============================================================================
class EventAttendance(models.Model):
    CHECK_IN_METHOD_CHOICES = [
        ('manual', 'Manual'),
        ('qr', 'QR Code'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    event_id = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        db_column='event_id',
        related_name='attendances',
    )
    registration_id = models.ForeignKey(
        EventRegistration,
        on_delete=models.CASCADE,
        db_column='registration_id',
        related_name='attendances',
    )
    check_in_time = models.DateTimeField(auto_now_add=True, db_column='check_in_time')
    check_in_method = models.CharField(
        max_length=10,
        choices=CHECK_IN_METHOD_CHOICES,
        default='manual',
        db_column='check_in_method',
    )
    checked_in_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='checked_in_by',
        related_name='checked_in_event_attendances',
    )
    notes = models.CharField(max_length=255, blank=True, null=True, db_column='notes')

    class Meta:
        db_table = 'event_attendance'
        constraints = [
            models.UniqueConstraint(
                fields=['event_id', 'registration_id'],
                name='unique_attendance',
            )
        ]

    def __str__(self):
        return f"Event #{self.event_id_id} - Reg #{self.registration_id_id} via {self.check_in_method}"


# ==============================================================================
# 16. EVENT_SCHEDULE
# ==============================================================================
class EventSchedule(models.Model):
    SESSION_TYPE_CHOICES = [
        ('worship', 'Worship'),
        ('teaching', 'Teaching'),
        ('prayer', 'Prayer'),
        ('break', 'Break'),
        ('meal', 'Meal'),
        ('registration', 'Registration'),
        ('panel', 'Panel'),
        ('activity', 'Activity'),
        ('announcement', 'Announcement'),
        ('other', 'Other'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    event_id = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        db_column='event_id',
        related_name='schedules',
    )
    day_number = models.IntegerField(default=1, db_column='day_number')
    start_time = models.TimeField(db_column='start_time')
    end_time = models.TimeField(db_column='end_time')
    title = models.CharField(max_length=255, db_column='title')
    description = models.TextField(blank=True, null=True, db_column='description')
    speaker = models.CharField(max_length=255, blank=True, null=True, db_column='speaker')
    session_type = models.CharField(
        max_length=20,
        choices=SESSION_TYPE_CHOICES,
        default='other',
        db_column='session_type',
    )
    location = models.CharField(max_length=255, blank=True, null=True, db_column='location')
    sort_order = models.IntegerField(default=0, db_column='sort_order')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, db_column='updated_at')

    class Meta:
        db_table = 'event_schedule'

    def __str__(self):
        return f"Day {self.day_number}: {self.title} ({self.start_time}-{self.end_time})"


# ==============================================================================
# PHASE 3: FINANCIAL & ACCOUNTING CORE
# ==============================================================================

# ==============================================================================
# 17. ACCOUNT
# ==============================================================================
class Account(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ('Asset', 'Asset'),
        ('Liability', 'Liability'),
        ('Equity', 'Equity'),
        ('Revenue', 'Revenue'),
        ('Expense', 'Expense'),
    ]

    NORMAL_BALANCE_CHOICES = [
        ('Debit', 'Debit'),
        ('Credit', 'Credit'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    account_code = models.CharField(max_length=20, unique=True, db_column='account_code')
    account_name = models.CharField(max_length=150, db_column='account_name')
    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPE_CHOICES,
        db_column='account_type',
    )
    # account_ibfk_1: FOREIGN KEY (parent_id) REFERENCES account(id) ON DELETE SET NULL
    parent_id = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='parent_id',
        related_name='children',
    )
    fund_id = models.ForeignKey(
        'Fund',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='fund_id',
        related_name='accounts',
    )
    is_active = models.BooleanField(default=True, db_column='is_active')
    description = models.TextField(blank=True, null=True, db_column='description')
    normal_balance = models.CharField(
        max_length=10,
        choices=NORMAL_BALANCE_CHOICES,
        db_column='normal_balance',
    )
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, db_column='updated_at')

    class Meta:
        db_table = 'account'

    def __str__(self):
        return f"{self.account_code} - {self.account_name}"


# ==============================================================================
# 18. ACCOUNTING_PERIOD
# ==============================================================================
class AccountingPeriod(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=100, db_column='name')
    start_date = models.DateField(db_column='start_date')
    end_date = models.DateField(db_column='end_date')
    is_closed = models.BooleanField(default=False, db_column='is_closed')
    closed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='closed_by',
        related_name='closed_accounting_periods',
    )
    closed_at = models.DateTimeField(blank=True, null=True, db_column='closed_at')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'accounting_period'

    def __str__(self):
        return self.name


# ==============================================================================
# 19. JOURNAL_ENTRY
# ==============================================================================
class JournalEntry(models.Model):
    SOURCE_TYPE_CHOICES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
        ('contribution', 'Contribution'),
        ('pledge', 'Pledge'),
        ('pledge_redeem', 'Pledge Redeem'),
        ('payroll', 'Payroll'),
        ('transfer', 'Transfer'),
        ('adjustment', 'Adjustment'),
        ('opening_balance', 'Opening Balance'),
        ('event_expense', 'Event Expense'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    entry_date = models.DateField(db_column='entry_date')
    reference_no = models.CharField(max_length=50, db_column='reference_no')
    description = models.CharField(max_length=255, db_column='description')
    source_type = models.CharField(
        max_length=30,
        choices=SOURCE_TYPE_CHOICES,
        db_column='source_type',
    )
    source_id = models.IntegerField(blank=True, null=True, db_column='source_id')
    # journal_entry_ibfk_1: FOREIGN KEY (accounting_period_id) REFERENCES accounting_period(id)
    accounting_period_id = models.ForeignKey(
        AccountingPeriod,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='accounting_period_id',
        related_name='journal_entries',
    )
    is_posted = models.BooleanField(default=True, db_column='is_posted')
    is_reversed = models.BooleanField(default=False, db_column='is_reversed')
    # journal_entry_ibfk_2: FOREIGN KEY (reversed_by_id) REFERENCES journal_entry(id)
    reversed_by_id = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='reversed_by_id',
        related_name='reversed_entries',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='created_by',
        related_name='created_journal_entries',
    )
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'journal_entry'

    def __str__(self):
        return f"{self.reference_no} ({self.entry_date}) - {self.description}"


# ==============================================================================
# 20. JOURNAL_ENTRY_LINE
# ==============================================================================
class JournalEntryLine(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    # journal_entry_line_ibfk_1: FOREIGN KEY (journal_entry_id) REFERENCES journal_entry(id) ON DELETE CASCADE
    journal_entry_id = models.ForeignKey(
        JournalEntry,
        on_delete=models.CASCADE,
        db_column='journal_entry_id',
        related_name='lines',
    )
    # journal_entry_line_ibfk_2: FOREIGN KEY (account_id) REFERENCES account(id)
    account_id = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        db_column='account_id',
        related_name='journal_lines',
    )
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, db_column='debit')
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, db_column='credit')
    description = models.CharField(max_length=255, blank=True, null=True, db_column='description')
    fund_id = models.ForeignKey(
        'Fund',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='fund_id',
        related_name='journal_lines',
    )

    class Meta:
        db_table = 'journal_entry_line'

    def __str__(self):
        return f"Line #{self.id} for JE #{self.journal_entry_id_id}: Dr {self.debit} / Cr {self.credit}"


# ==============================================================================
# 21. FUND
# ==============================================================================
class Fund(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=100, db_column='name')
    note = models.CharField(max_length=100, db_column='note')
    total = models.TextField(db_column='total')
    delete_status = models.IntegerField(default=0, db_column='delete_status')

    class Meta:
        db_table = 'fund'

    def __str__(self):
        return self.name


# ==============================================================================
# 22. INCOMETYPE
# ==============================================================================
class IncomeType(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=100, db_column='name')
    delete_status = models.IntegerField(default=0, db_column='delete_status')
    gl_account_id = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='gl_account_id',
        related_name='income_types',
    )

    class Meta:
        db_table = 'incometype'

    def __str__(self):
        return self.name


# Alias for legacy table name compatibility
Incometype = IncomeType


# ==============================================================================
# 23. EXPENSETYPE
# ==============================================================================
class ExpenseType(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=100, db_column='name')
    delete_status = models.IntegerField(default=0, db_column='delete_status')
    gl_account_id = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='gl_account_id',
        related_name='expense_types',
    )

    class Meta:
        db_table = 'expensetype'

    def __str__(self):
        return self.name


# Alias for legacy table name compatibility
Expensetype = ExpenseType


# ==============================================================================
# 24. PAYMENTMETHOD
# ==============================================================================
class PaymentMethod(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=100, db_column='name')
    delete_status = models.IntegerField(default=0, db_column='delete_status')

    class Meta:
        db_table = 'paymentmethod'

    def __str__(self):
        return self.name


# Alias for legacy table name compatibility
Paymentmethod = PaymentMethod


# ==============================================================================
# 25. PAYMENT_ACCOUNT_MAP
# ==============================================================================
class PaymentAccountMap(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    payment_method_id = models.ForeignKey(
        PaymentMethod,
        on_delete=models.CASCADE,
        db_column='payment_method_id',
        related_name='account_maps',
    )
    # payment_account_map_ibfk_1: FOREIGN KEY (account_id) REFERENCES account(id)
    account_id = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        db_column='account_id',
        related_name='payment_maps',
    )

    class Meta:
        db_table = 'payment_account_map'

    def __str__(self):
        return f"Method #{self.payment_method_id_id} -> Account #{self.account_id_id}"


# ==============================================================================
# 26. CONTRIBUTION
# ==============================================================================
class Contribution(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    branch = models.CharField(max_length=100, db_column='branch')
    member = models.CharField(max_length=100, db_column='member')
    amount = models.IntegerField(db_column='amount')
    batch = models.CharField(max_length=100, db_column='batch')
    contritype = models.CharField(max_length=100, db_column='contritype')
    fund = models.CharField(max_length=100, db_column='fund')
    paymentmethod = models.CharField(max_length=100, db_column='paymentmethod')
    date = models.DateTimeField(auto_now_add=True, db_column='date')
    payment_id = models.IntegerField(db_column='payment_id')
    total = models.IntegerField(db_column='total')
    status = models.IntegerField(default=0, db_column='status')
    delete_status = models.IntegerField(default=0, db_column='delete_status')
    journal_entry_id = models.ForeignKey(
        JournalEntry,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='journal_entry_id',
        related_name='contributions',
    )

    class Meta:
        db_table = 'contribution'

    def __str__(self):
        return f"Contribution #{self.id}: {self.amount} by {self.member}"


# ==============================================================================
# 27. CONTRIBUTION_DETAILS
# ==============================================================================
class ContributionDetails(models.Model):
    # Primary key is contribution_id (OneToOneField with contribution table)
    contribution_id = models.OneToOneField(
        Contribution,
        primary_key=True,
        on_delete=models.CASCADE,
        db_column='contribution_id',
        related_name='details',
    )
    amount = models.IntegerField(db_column='amount')
    batch = models.CharField(max_length=100, db_column='batch')
    contritype = models.CharField(max_length=100, db_column='contritype')
    fund = models.CharField(max_length=100, db_column='fund')
    paymentmethod = models.CharField(max_length=100, db_column='paymentmethod')
    delete_status = models.IntegerField(default=0, db_column='delete_status')

    class Meta:
        db_table = 'contribution_details'

    def __str__(self):
        return f"Details for Contribution #{self.contribution_id_id} ({self.amount})"

# ==============================================================================
# 28. EXPENSE
# ==============================================================================
class Expense(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    branch = models.CharField(max_length=100, db_column='branch')
    expensetype = models.CharField(max_length=100, db_column='expensetype')
    amount = models.TextField(db_column='amount')
    date = models.DateTimeField(db_column='date')
    recurring = models.CharField(max_length=100, db_column='recurring')
    description = models.CharField(max_length=100, db_column='description')
    photo1 = models.CharField(max_length=100, blank=True, null=True, db_column='photo1')
    total_expense = models.IntegerField(db_column='total_expense')
    delete_status = models.IntegerField(default=0, db_column='delete_status')
    journal_entry_id = models.ForeignKey(
        JournalEntry,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='journal_entry_id',
        related_name='expenses',
    )
    fund_id = models.ForeignKey(
        Fund,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='fund_id',
        related_name='expenses',
    )

    class Meta:
        db_table = 'expense'

    def __str__(self):
        return f"Expense #{self.id}: {self.description} ({self.total_expense})"

# ==============================================================================
# 29. INCOME
# ==============================================================================
class Income(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    branch = models.CharField(max_length=100, db_column='branch')
    incometype = models.CharField(max_length=100, db_column='incometype')
    amount = models.TextField(db_column='amount')
    date = models.DateTimeField(auto_now_add=True, db_column='date')
    description = models.CharField(max_length=100, db_column='description')
    photo1 = models.CharField(max_length=100, blank=True, null=True, db_column='photo1')
    total_income = models.IntegerField(db_column='total_income')
    delete_status = models.IntegerField(default=0, db_column='delete_status')
    journal_entry_id = models.ForeignKey(
        JournalEntry,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='journal_entry_id',
        related_name='incomes',
    )
    fund_id = models.ForeignKey(
        Fund,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='fund_id',
        related_name='incomes',
    )

    class Meta:
        db_table = 'income'

    def __str__(self):
        return f"Income #{self.id}: {self.description} ({self.total_income})"

# ==============================================================================
# 30. PLEDGES
# ==============================================================================
class Pledges(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    full_name = models.CharField(max_length=100, blank=True, null=True, db_column='full_name')
    purpose = models.CharField(max_length=100, blank=True, null=True, db_column='purpose')
    member = models.CharField(max_length=100, blank=True, null=True, db_column='member')
    pledges_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        blank=True,
        null=True,
        db_column='pledges_amount',
    )
    date = models.DateTimeField(auto_now_add=True, db_column='date')
    recurring = models.BooleanField(default=False, db_column='recurring')
    notes = models.CharField(max_length=100, blank=True, null=True, db_column='notes')
    phone_no = models.CharField(max_length=20, blank=True, null=True, db_column='phone_no')
    total_pledges = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        blank=True,
        null=True,
        db_column='total_pledges',
    )
    status = models.BooleanField(blank=True, null=True, db_column='status')
    # pledges_ibfk_1: FOREIGN KEY (member_id) REFERENCES member(id)
    member_id = models.ForeignKey(
        Member,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='member_id',
        related_name='pledges',
    )
    email = models.CharField(max_length=100, db_column='email')
    pledge_type = models.CharField(max_length=40, blank=True, null=True, db_column='pledge_type')
    attendees_sponsored = models.IntegerField(blank=True, null=True, db_column='attendees_sponsored')

    class Meta:
        db_table = 'pledges'

    def __str__(self):
        return f"Pledge #{self.id}: {self.full_name or self.email} ({self.pledges_amount})"


# Alias for singular reference
Pledge = Pledges


# ==============================================================================
# 31. PLEDGES_REDEEM
# ==============================================================================
class PledgesRedeem(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    email = models.CharField(max_length=50, db_column='email')
    mpesa_code = models.CharField(max_length=10, db_column='mpesa_code')
    pledge_id = models.ForeignKey(
        Pledges,
        on_delete=models.CASCADE,
        db_column='pledge_id',
        related_name='redemptions',
    )
    phone_no = models.CharField(max_length=10, db_column='phone_no')
    redeemed_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        db_column='redeemed_amount',
    )
    recorded_on = models.DateTimeField(auto_now_add=True, db_column='recorded_on')
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='recorded_by',
        default=8,
        related_name='recorded_pledge_redemptions',
    )
    journal_entry_id = models.ForeignKey(
        JournalEntry,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='journal_entry_id',
        related_name='pledge_redemptions',
    )

    class Meta:
        db_table = 'pledges_redeem'

    def __str__(self):
        return f"Redeem #{self.id}: {self.redeemed_amount} ({self.mpesa_code})"

# Alias for singular reference
PledgeRedeem = PledgesRedeem

# ==============================================================================
# 32. COLLECTIONS
# ==============================================================================
class Collections(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    payee = models.CharField(max_length=50, db_column='payee')
    description = models.TextField(db_column='description')
    doc_reference = models.CharField(max_length=200, db_column='doc_reference')
    payment_mode = models.CharField(max_length=200, db_column='payment_mode')
    payment_for = models.CharField(max_length=200, db_column='payment_for')
    cancelled = models.IntegerField(default=0, db_column='cancelled')
    recorded_on = models.DateTimeField(auto_now_add=True, db_column='recorded_on')
    reference = models.CharField(max_length=100, db_column='reference')
    actual_date = models.DateTimeField(auto_now_add=True, db_column='actual_date')
    collection_type = models.CharField(max_length=50, default='giving', db_column='collection_type')
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='recorded_by',
        related_name='recorded_collections',
    )
    transaction_id = models.CharField(max_length=200, db_column='transaction_id')
    amount = models.DecimalField(max_digits=15, decimal_places=2, db_column='amount')
    journal_entry_id = models.ForeignKey(
        JournalEntry,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='journal_entry_id',
        related_name='collections',
    )

    class Meta:
        db_table = 'collections'

    def __str__(self):
        return f"Collection #{self.id}: {self.payee} - {self.amount}"

# Alias for singular reference
Collection = Collections

# ==============================================================================
# PHASE 4: HR, PAYROLL, BUDGETS & TRAINING
# ==============================================================================
# ==============================================================================
# 33. BUDGET_CATEGORY
# ==============================================================================
class BudgetCategory(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=100, db_column='name')
    created_on = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_on')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='created_by',
        related_name='budget_categories',
    )

    class Meta:
        db_table = 'budget_category'

    def __str__(self):
        return self.name

# ==============================================================================
# 34. BUDGET
# ==============================================================================
class Budget(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    budget_name = models.CharField(max_length=100, db_column='budget_name')
    budget_purpose = models.CharField(max_length=50, db_column='budget_purpose')
    is_active = models.BooleanField(default=True, db_column='is_active')
    accounting_period_id = models.ForeignKey(
        AccountingPeriod,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='accounting_period_id',
        related_name='budgets',
    )
    fund_id = models.ForeignKey(
        Fund,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='fund_id',
        related_name='budgets',
    )
    reference_doc = models.IntegerField(default=1, db_column='reference_doc')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='created_by',
        default=8,
        related_name='created_budgets',
    )
    update_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='update_by',
        default=8,
        related_name='updated_budgets',
    )
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, blank=True, null=True, db_column='updated_at')

    class Meta:
        db_table = 'budget'

    def __str__(self):
        return f"{self.budget_name} ({self.budget_purpose})"

# ==============================================================================
# 35. BUDGET_DETAILS
# ==============================================================================
class BudgetDetails(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    budget_id = models.ForeignKey(
        Budget,
        on_delete=models.CASCADE,
        db_column='budget_id',
        related_name='details',
    )
    description = models.TextField(blank=True, null=True, db_column='description')
    amount = models.DecimalField(max_digits=15, decimal_places=2, db_column='amount')
    created_on = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_on')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='created_by',
        related_name='created_budget_details',
    )
    updated_on = models.DateTimeField(auto_now=True, blank=True, null=True, db_column='updated_on')
    category = models.ForeignKey(
        BudgetCategory,
        on_delete=models.CASCADE,
        db_column='category',
        related_name='budget_details',
    )
    account_id = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='account_id',
        related_name='budget_details',
    )

    class Meta:
        db_table = 'budget_details'

    def __str__(self):
        return f"Budget #{self.budget_id_id} - {self.description}: {self.amount}"


# Alias for singular reference
BudgetDetail = BudgetDetails


# ==============================================================================
# 36. PAYROLL_RUN
# ==============================================================================
class PayrollRun(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('paid', 'Paid'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    pay_period_start = models.DateField(db_column='pay_period_start')
    pay_period_end = models.DateField(db_column='pay_period_end')
    description = models.CharField(max_length=255, blank=True, null=True, db_column='description')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_column='status',
    )
    total_gross = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, db_column='total_gross')
    total_deductions = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, db_column='total_deductions')
    total_net = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, db_column='total_net')
    journal_entry_id = models.ForeignKey(
        JournalEntry,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='journal_entry_id',
        related_name='payroll_runs',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='created_by',
        related_name='created_payroll_runs',
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='approved_by',
        related_name='approved_payroll_runs',
    )
    approved_at = models.DateTimeField(blank=True, null=True, db_column='approved_at')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'payroll_run'

    def __str__(self):
        return f"Payroll Run #{self.id}: {self.pay_period_start} to {self.pay_period_end} ({self.status})"

# ==============================================================================
# 37. PAYROLL_ITEM
# ==============================================================================
class PayrollItem(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    # payroll_item_ibfk_1: FOREIGN KEY (payroll_run_id) REFERENCES payroll_run(id) ON DELETE CASCADE
    payroll_run_id = models.ForeignKey(
        PayrollRun,
        on_delete=models.CASCADE,
        db_column='payroll_run_id',
        related_name='items',
    )
    member_id = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        db_column='member_id',
        related_name='payroll_items',
    )
    employee_name = models.CharField(max_length=150, db_column='employee_name')
    basic_salary = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, db_column='basic_salary')
    allowances = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, db_column='allowances')
    deductions = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, db_column='deductions')
    net_pay = models.DecimalField(max_digits=15, decimal_places=2, default=0.00, db_column='net_pay')
    payment_method = models.CharField(max_length=50, blank=True, null=True, db_column='payment_method')
    bank_name = models.CharField(max_length=100, blank=True, null=True, db_column='bank_name')
    account_number = models.CharField(max_length=50, blank=True, null=True, db_column='account_number')
    notes = models.TextField(blank=True, null=True, db_column='notes')

    class Meta:
        db_table = 'payroll_item'

    def __str__(self):
        return f"{self.employee_name} - Net: {self.net_pay} (Run #{self.payroll_run_id_id})"

# ==============================================================================
# 38. PAYROLL (Legacy Payroll Table)
# ==============================================================================
class Payroll(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    branch = models.CharField(max_length=100, db_column='branch')
    user_name = models.CharField(max_length=100, db_column='user_name')
    employee_name = models.CharField(max_length=100, db_column='employee_name')
    payroll_date = models.DateTimeField(auto_now_add=True, db_column='payroll_date')
    extra_time = models.TextField(db_column='extra_time')
    timein_late = models.TextField(db_column='Timein_late')
    total_pay = models.IntegerField(db_column='total_pay')
    total_deduction = models.IntegerField(db_column='total_deduction')
    net_pay = models.IntegerField(db_column='net_pay')
    payment_method = models.CharField(max_length=100, db_column='payment_method')
    bank_name = models.CharField(max_length=100, db_column='bank_name')
    acc_no = models.CharField(max_length=100, db_column='acc_no')
    decription = models.CharField(max_length=100, db_column='decription')
    paid_amount = models.IntegerField(db_column='paid_amount')
    comment = models.CharField(max_length=100, db_column='comment')
    recurring = models.IntegerField(db_column='recurring')
    recur_frequency = models.IntegerField(db_column='recur_frequency')
    recur_type = models.CharField(max_length=100, db_column='recur_type')
    start_date = models.DateField(blank=True, null=True, db_column='start_date')
    end_date = models.DateField(blank=True, null=True, db_column='end_date')
    total_payroll = models.IntegerField(db_column='total_payroll')
    delete_status = models.IntegerField(db_column='delete_status')

    class Meta:
        db_table = 'payroll'

    def __str__(self):
        return f"Legacy Payroll #{self.id}: {self.employee_name} ({self.net_pay})"


# ==============================================================================
# 39. BILLS
# ==============================================================================
class Bills(models.Model):
    STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('partially_paid', 'Partially Paid'),
        ('paid', 'Paid'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    vendor_name = models.CharField(max_length=255, db_column='vendor_name')
    bill_number = models.CharField(max_length=100, db_column='bill_number')
    bill_date = models.DateField(db_column='bill_date')
    due_date = models.DateField(db_column='due_date')
    amount = models.DecimalField(max_digits=15, decimal_places=2, db_column='amount')
    balance_due = models.DecimalField(max_digits=15, decimal_places=2, db_column='balance_due')
    description = models.TextField(blank=True, null=True, db_column='description')
    # bills_ibfk_1: FOREIGN KEY (gl_account_id) REFERENCES account(id)
    gl_account_id = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        db_column='gl_account_id',
        related_name='bills',
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='unpaid',
        db_column='status',
    )
    # bills_ibfk_2: FOREIGN KEY (event_id) REFERENCES event(id)
    event_id = models.ForeignKey(
        Event,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='event_id',
        related_name='bills',
    )
    # bills_ibfk_3: FOREIGN KEY (event_budget_item_id) REFERENCES event_budget_item(id)
    # event_budget_item_id = models.ForeignKey(
    #     'EventBudgetItem',
    #     on_delete=models.SET_NULL,
    #     blank=True,
    #     null=True,
    #     db_column='event_budget_item_id',
    #     related_name='bills',
    # )
    # bills_ibfk_4: FOREIGN KEY (journal_entry_id) REFERENCES journal_entry(id)
    journal_entry_id = models.ForeignKey(
        JournalEntry,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='journal_entry_id',
        related_name='bills',
    )
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='recorded_by',
        related_name='recorded_bills',
    )
    recorded_on = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='recorded_on')
    delete_status = models.IntegerField(default=0, db_column='delete_status')

    class Meta:
        db_table = 'bills'

    def __str__(self):
        return f"Bill {self.bill_number}: {self.vendor_name} ({self.amount})"


# Alias for singular reference
Bill = Bills


# ==============================================================================
# 40. BILL_PAYMENTS
# ==============================================================================
class BillPayments(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    # bill_payments_ibfk_1: FOREIGN KEY (bill_id) REFERENCES bills(id)
    bill_id = models.ForeignKey(
        Bills,
        on_delete=models.CASCADE,
        db_column='bill_id',
        related_name='payments',
    )
    payment_date = models.DateField(db_column='payment_date')
    payment_method = models.CharField(max_length=50, db_column='payment_method')
    amount = models.DecimalField(max_digits=15, decimal_places=2, db_column='amount')
    reference_no = models.CharField(max_length=100, blank=True, null=True, db_column='reference_no')
    notes = models.TextField(blank=True, null=True, db_column='notes')
    # bill_payments_ibfk_2: FOREIGN KEY (journal_entry_id) REFERENCES journal_entry(id)
    journal_entry_id = models.ForeignKey(
        JournalEntry,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='journal_entry_id',
        related_name='bill_payments',
    )
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='recorded_by',
        related_name='recorded_bill_payments',
    )
    recorded_on = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='recorded_on')
    delete_status = models.IntegerField(default=0, db_column='delete_status')

    class Meta:
        db_table = 'bill_payments'

    def __str__(self):
        return f"Payment #{self.id} for Bill #{self.bill_id_id} ({self.amount})"


# Alias for singular reference
BillPayment = BillPayments

# ==============================================================================
# 41. TRN_LEARNING_TRACKS
# ==============================================================================
class TrnLearningTracks(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    title = models.CharField(max_length=255, db_column='title')
    description = models.TextField(blank=True, null=True, db_column='description')
    badge_icon = models.CharField(max_length=100, default='bx bx-book', blank=True, null=True, db_column='badge_icon')
    status = models.BooleanField(default=True, db_column='status')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'trn_learning_tracks'

    def __str__(self):
        return self.title


# Alias for singular reference
TrnLearningTrack = TrnLearningTracks


# ==============================================================================
# 42. TRN_LEARNING_MODULES
# ==============================================================================
class TrnLearningModules(models.Model):
    CONTENT_TYPE_CHOICES = [
        ('video', 'Video'),
        ('pdf', 'PDF'),
        ('audio', 'Audio'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    # trn_learning_modules_ibfk_1: FOREIGN KEY (track_id) REFERENCES trn_learning_tracks(id) ON DELETE CASCADE
    track_id = models.ForeignKey(
        TrnLearningTracks,
        on_delete=models.CASCADE,
        db_column='track_id',
        related_name='modules',
    )
    title = models.CharField(max_length=255, db_column='title')
    sequence_no = models.IntegerField(db_column='sequence_no')
    content_type = models.CharField(
        max_length=10,
        choices=CONTENT_TYPE_CHOICES,
        default='video',
        db_column='content_type',
    )
    media_url = models.CharField(max_length=500, blank=True, null=True, db_column='media_url')
    drip_days = models.IntegerField(default=0, db_column='drip_days')
    requires_practical = models.BooleanField(default=False, db_column='requires_practical')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'trn_learning_modules'

    def __str__(self):
        return f"{self.track_id.title} - M{self.sequence_no}: {self.title}"


# Alias for singular reference
TrnLearningModule = TrnLearningModules


# ==============================================================================
# 43. TRN_TRACK_ENROLLMENTS
# ==============================================================================
class TrnTrackEnrollments(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    # trn_track_enrollments_ibfk_1: FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE
    trainee_id = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='trainee_id',
        related_name='track_enrollments',
    )
    # trn_track_enrollments_ibfk_2: FOREIGN KEY (track_id) REFERENCES trn_learning_tracks(id) ON DELETE CASCADE
    track_id = models.ForeignKey(
        TrnLearningTracks,
        on_delete=models.CASCADE,
        db_column='track_id',
        related_name='enrollments',
    )
    # trn_track_enrollments_ibfk_3: FOREIGN KEY (coach_id) REFERENCES trn_coaches(id) ON DELETE SET NULL
    coach_id = models.ForeignKey(
        'TrnCoaches',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column='coach_id',
        related_name='mentee_enrollments',
    )
    progress_pct = models.IntegerField(default=0, db_column='progress_pct')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        db_column='status',
    )
    enrolled_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='enrolled_at')
    completed_at = models.DateTimeField(blank=True, null=True, db_column='completed_at')

    class Meta:
        db_table = 'trn_track_enrollments'

    def __str__(self):
        return f"Trainee #{self.trainee_id_id} in {self.track_id.title} ({self.status})"


# Alias for singular reference
TrnTrackEnrollment = TrnTrackEnrollments


# ==============================================================================
# 44. TRN_MODULE_PROGRESS
# ==============================================================================
class TrnModuleProgress(models.Model):
    STATUS_CHOICES = [
        ('locked', 'Locked'),
        ('unlocked', 'Unlocked'),
        ('completed', 'Completed'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    # trn_module_progress_ibfk_1: FOREIGN KEY (enrollment_id) REFERENCES trn_track_enrollments(id) ON DELETE CASCADE
    enrollment_id = models.ForeignKey(
        TrnTrackEnrollments,
        on_delete=models.CASCADE,
        db_column='enrollment_id',
        related_name='module_progress',
    )
    # trn_module_progress_ibfk_2: FOREIGN KEY (module_id) REFERENCES trn_learning_modules(id) ON DELETE CASCADE
    module_id = models.ForeignKey(
        TrnLearningModules,
        on_delete=models.CASCADE,
        db_column='module_id',
        related_name='progress_records',
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='locked',
        db_column='status',
    )
    unlocked_at = models.DateTimeField(blank=True, null=True, db_column='unlocked_at')
    completed_at = models.DateTimeField(blank=True, null=True, db_column='completed_at')

    class Meta:
        db_table = 'trn_module_progress'

    def __str__(self):
        return f"Enrollment #{self.enrollment_id_id} - Module #{self.module_id_id} ({self.status})"


# ==============================================================================
# 45. TRN_PRACTICAL_ASSIGNMENTS
# ==============================================================================
class TrnPracticalAssignments(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    # trn_practical_assignments_ibfk_1: FOREIGN KEY (module_id) REFERENCES trn_learning_modules(id) ON DELETE CASCADE
    module_id = models.ForeignKey(
        TrnLearningModules,
        on_delete=models.CASCADE,
        db_column='module_id',
        related_name='practical_assignments',
    )
    title = models.CharField(max_length=255, db_column='title')
    description = models.TextField(blank=True, null=True, db_column='description')
    rubric_json = models.JSONField(blank=True, null=True, db_column='rubric_json')
    requires_live_eval = models.BooleanField(default=False, db_column='requires_live_eval')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'trn_practical_assignments'

    def __str__(self):
        return f"Assignment: {self.title} (Module #{self.module_id_id})"


# Alias for singular reference
TrnPracticalAssignment = TrnPracticalAssignments


# ==============================================================================
# 46. TRN_ASSIGNMENT_SUBMISSIONS
# ==============================================================================

class TrnAssignmentSubmissions(models.Model):
    STATUS_CHOICES = [
        ('pending_review', 'Pending Review'),
        ('evaluated', 'Evaluated'),
        ('needs_resubmission', 'Needs Resubmission'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    # trn_assignment_submissions_ibfk_1: FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE
    trainee_id = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='trainee_id',
        related_name='assignment_submissions',
    )
    # trn_assignment_submissions_ibfk_2: FOREIGN KEY (assignment_id) REFERENCES trn_practical_assignments(id) ON DELETE CASCADE
    assignment_id = models.ForeignKey(
        TrnPracticalAssignments,
        on_delete=models.CASCADE,
        db_column='assignment_id',
        related_name='submissions',
    )
    media_url = models.CharField(max_length=500, blank=True, null=True, db_column='media_url')
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='pending_review',
        db_column='status',
    )
    submitted_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='submitted_at')

    class Meta:
        db_table = 'trn_assignment_submissions'

    def __str__(self):
        return f"Submission #{self.id} by User #{self.trainee_id_id} ({self.status})"


# Alias for singular reference
TrnAssignmentSubmission = TrnAssignmentSubmissions


# ==============================================================================
# 47. TRN_COACHES
# ==============================================================================

class TrnCoaches(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    # trn_coaches_ibfk_1: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    user_id = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='user_id',
        related_name='coach_profiles',
    )
    # trn_coaches_ibfk_2: FOREIGN KEY (track_id) REFERENCES trn_learning_tracks(id) ON DELETE CASCADE
    track_id = models.ForeignKey(
        TrnLearningTracks,
        on_delete=models.CASCADE,
        db_column='track_id',
        related_name='coaches',
    )
    status = models.BooleanField(default=True, db_column='status')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'trn_coaches'

    def __str__(self):
        return f"Coach User #{self.user_id_id} for Track #{self.track_id_id}"


# Alias for singular reference
TrnCoach = TrnCoaches


# ==============================================================================
# 48. TRN_COACH_EVALUATIONS
# ==============================================================================

class TrnCoachEvaluations(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    # trn_coach_evaluations_ibfk_1: FOREIGN KEY (submission_id) REFERENCES trn_assignment_submissions(id) ON DELETE CASCADE
    submission_id = models.ForeignKey(
        TrnAssignmentSubmissions,
        on_delete=models.CASCADE,
        db_column='submission_id',
        related_name='evaluations',
    )
    # trn_coach_evaluations_ibfk_2: FOREIGN KEY (coach_id) REFERENCES trn_coaches(id) ON DELETE CASCADE
    coach_id = models.ForeignKey(
        TrnCoaches,
        on_delete=models.CASCADE,
        db_column='coach_id',
        related_name='evaluations',
    )
    total_score = models.IntegerField(blank=True, null=True, db_column='total_score')
    rubric_scores_json = models.JSONField(blank=True, null=True, db_column='rubric_scores_json')
    feedback_text = models.TextField(blank=True, null=True, db_column='feedback_text')
    evaluated_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='evaluated_at')

    class Meta:
        db_table = 'trn_coach_evaluations'

    def __str__(self):
        return f"Eval #{self.id} for Submission #{self.submission_id_id} by Coach #{self.coach_id_id}"


# Alias for singular reference
TrnCoachEvaluation = TrnCoachEvaluations


# ==============================================================================
# 49. TRN_MENTORS
# ==============================================================================

class TrnMentors(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    # trn_mentors_ibfk_1: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    user_id = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='user_id',
        related_name='mentor_profiles',
    )
    max_mentees = models.IntegerField(default=3, db_column='max_mentees')
    status = models.BooleanField(default=True, db_column='status')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'trn_mentors'

    def __str__(self):
        return f"Mentor User #{self.user_id_id} (Max: {self.max_mentees})"


# Alias for singular reference
TrnMentor = TrnMentors


# ==============================================================================
# 50. TRN_MENTORSHIP_ASSIGNMENTS
# ==============================================================================

class TrnMentorshipAssignments(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('graduated', 'Graduated'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    # trn_mentorship_assignments_ibfk_1: FOREIGN KEY (mentor_id) REFERENCES trn_mentors(id) ON DELETE CASCADE
    mentor_id = models.ForeignKey(
        TrnMentors,
        on_delete=models.CASCADE,
        db_column='mentor_id',
        related_name='mentorship_assignments',
    )
    # trn_mentorship_assignments_ibfk_2: FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE
    trainee_id = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='trainee_id',
        related_name='mentorship_assignments',
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        db_column='status',
    )
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'trn_mentorship_assignments'

    def __str__(self):
        return f"Mentor #{self.mentor_id_id} -> Trainee #{self.trainee_id_id} ({self.status})"


# Alias for singular reference
TrnMentorshipAssignment = TrnMentorshipAssignments


# ==============================================================================
# 51. TRN_MENTORSHIP_SESSIONS
# ==============================================================================

class TrnMentorshipSessions(models.Model):
    SESSION_TYPE_CHOICES = [
        ('in-person', 'In-Person'),
        ('call', 'Call'),
        ('video', 'Video'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    # trn_mentorship_sessions_ibfk_1: FOREIGN KEY (mentor_id) REFERENCES trn_mentors(id) ON DELETE CASCADE
    mentor_id = models.ForeignKey(
        TrnMentors,
        on_delete=models.CASCADE,
        db_column='mentor_id',
        related_name='mentorship_sessions',
    )
    # trn_mentorship_sessions_ibfk_2: FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE
    trainee_id = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='trainee_id',
        related_name='mentorship_sessions',
    )
    session_date = models.DateField(db_column='session_date')
    duration_mins = models.IntegerField(default=60, db_column='duration_mins')
    session_type = models.CharField(
        max_length=20,
        choices=SESSION_TYPE_CHOICES,
        default='in-person',
        db_column='session_type',
    )
    key_points = models.TextField(blank=True, null=True, db_column='key_points')
    prayer_requests = models.TextField(blank=True, null=True, db_column='prayer_requests')
    action_items = models.TextField(blank=True, null=True, db_column='action_items')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'trn_mentorship_sessions'

    def __str__(self):
        return f"Session on {self.session_date}: Mentor #{self.mentor_id_id} & Trainee #{self.trainee_id_id}"


# Alias for singular reference
TrnMentorshipSession = TrnMentorshipSessions
# ==============================================================================
# 52. TRN_MODULE_REFLECTIONS
# ==============================================================================

class TrnModuleReflections(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    # trn_module_reflections_ibfk_1: FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE
    trainee_id = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='trainee_id',
        related_name='module_reflections',
    )
    # trn_module_reflections_ibfk_2: FOREIGN KEY (mentor_id) REFERENCES trn_mentors(id) ON DELETE CASCADE
    mentor_id = models.ForeignKey(
        TrnMentors,
        on_delete=models.CASCADE,
        db_column='mentor_id',
        related_name='mentee_reflections',
    )
    # trn_module_reflections_ibfk_3: FOREIGN KEY (module_id) REFERENCES trn_learning_modules(id) ON DELETE CASCADE
    module_id = models.ForeignKey(
        TrnLearningModules,
        on_delete=models.CASCADE,
        db_column='module_id',
        related_name='reflections',
    )
    reflection_text = models.TextField(db_column='reflection_text')
    mentor_response = models.TextField(blank=True, null=True, db_column='mentor_response')
    submitted_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='submitted_at')
    responded_at = models.DateTimeField(blank=True, null=True, db_column='responded_at')

    class Meta:
        db_table = 'trn_module_reflections'

    def __str__(self):
        return f"Reflection by Trainee #{self.trainee_id_id} on Module #{self.module_id_id}"


# Alias for singular reference
TrnModuleReflection = TrnModuleReflections


# ==============================================================================
# 53. TRN_SHARED_JOURNALS
# ==============================================================================

class TrnSharedJournals(models.Model):
    AUTHOR_TYPE_CHOICES = [
        ('trainee', 'Trainee'),
        ('mentor', 'Mentor'),
    ]

    id = models.AutoField(primary_key=True, db_column='id')
    # trn_shared_journals_ibfk_1: FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE
    trainee_id = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='trainee_id',
        related_name='shared_journals',
    )
    # trn_shared_journals_ibfk_2: FOREIGN KEY (mentor_id) REFERENCES trn_mentors(id) ON DELETE CASCADE
    mentor_id = models.ForeignKey(
        TrnMentors,
        on_delete=models.CASCADE,
        db_column='mentor_id',
        related_name='mentee_journals',
    )
    entry_text = models.TextField(db_column='entry_text')
    author_type = models.CharField(
        max_length=10,
        choices=AUTHOR_TYPE_CHOICES,
        db_column='author_type',
    )
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True, db_column='created_at')

    class Meta:
        db_table = 'trn_shared_journals'

    def __str__(self):
        return f"Journal Entry #{self.id} by {self.author_type} (Trainee #{self.trainee_id_id})"

# Alias for singular reference
TrnSharedJournal = TrnSharedJournals

# ==============================================================================
# 54. INSTITUTION_SETTING (Singleton Branding & System Configuration)
# ==============================================================================

class InstitutionSetting(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    name = models.CharField(max_length=200, default='Jesus Enthroned Network', db_column='name')
    short_name = models.CharField(max_length=50, default='J.E.N', db_column='short_name')
    tagline = models.CharField(max_length=255, blank=True, null=True, default='Enthroning Christ in all Spheres', db_column='tagline')
    logo_url = models.URLField(max_length=500, blank=True, null=True, db_column='logo_url')
    logo_dark_url = models.URLField(max_length=500, blank=True, null=True, db_column='logo_dark_url')
    favicon_url = models.URLField(max_length=500, blank=True, null=True, db_column='favicon_url')
    primary_color = models.CharField(max_length=50, default='#1e3a8a', db_column='primary_color')
    accent_color = models.CharField(max_length=50, default='#d97706', db_column='accent_color')
    secondary_color = models.CharField(max_length=50, default='#0f172a', db_column='secondary_color')
    official_email = models.EmailField(max_length=150, blank=True, null=True, db_column='official_email')
    official_phone = models.CharField(max_length=50, blank=True, null=True, db_column='official_phone')
    physical_address = models.CharField(max_length=255, blank=True, null=True, db_column='physical_address')
    currency_symbol = models.CharField(max_length=10, default='KSh', db_column='currency_symbol')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_institution_settings',
        db_column='updated_by'
    )

    class Meta:
        db_table = 'institution_setting'
        constraints = [
            models.CheckConstraint(condition=models.Q(id=1), name='institution_setting_singleton')
        ]

    def __str__(self):
        return self.name

    @classmethod
    def get_settings(cls):
        return cls.objects.get_or_create(id=1)[0]

    def save(self, *args, **kwargs):
        self.id = 1
        super().save(*args, **kwargs)


# ==============================================================================
# MEDIA & SERMON ARCHIVES
# ==============================================================================
class MediaItem(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('audio', 'Audio Sermon'),
        ('video', 'Video Broadcast'),
        ('photo_gallery', 'Photo Vault / Gallery'),
    ]

    title = models.CharField(max_length=255)
    media_type = models.CharField(max_length=30, choices=MEDIA_TYPE_CHOICES, default='audio')
    preacher = models.CharField(max_length=150, blank=True, null=True, help_text="Preacher, Speaker or Host")
    series = models.CharField(max_length=150, blank=True, null=True, default='Sunday Service')
    date = models.DateField(default=timezone.now)
    duration = models.CharField(max_length=50, blank=True, null=True, default='45:00')
    thumbnail_url = models.CharField(max_length=500, blank=True, null=True)
    media_file = models.FileField(upload_to='media_uploads/', blank=True, null=True)
    media_url = models.CharField(max_length=500, blank=True, null=True, help_text="Direct or external URL (YouTube, Vimeo, SoundCloud, CDN)")
    description = models.TextField(blank=True, null=True)
    featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    photos = models.JSONField(default=list, blank=True, help_text="List of photo URLs/objects for galleries")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'media_item'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"[{self.media_type.upper()}] {self.title}"

