import os
import sys
import json
from datetime import timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.db import connection, reset_queries
from django.utils import timezone
from django.contrib.admin.models import LogEntry, CHANGE
from django.contrib.contenttypes.models import ContentType
from core.models import (
    Member, Cell, CellAttendance, Attendance,
    TrnLearningTracks, TrnLearningModules,
    TrnTrackEnrollments, TrnModuleProgress,
    CustomUser
)

reset_queries()

now = timezone.now()

# 1. Pastoral Actions logged in LogEntry
action_logs = {}
for entry in LogEntry.objects.filter(change_message__contains='"alert_id":'):
    try:
        msg = json.loads(entry.change_message)
        if 'alert_id' in msg:
            action_logs[msg['alert_id']] = msg
    except Exception:
        pass

# 2. Alerts query
alerts = []
alert_id = 1

# Check uncontacted members (active members with zero attendance)
uncontacted_members = Member.objects.filter(
    delete_status__in=['Active', 'active', '0', 0, None]
).exclude(
    meeting_attendances__isnull=False
).order_by('id')[:3]

for m in uncontacted_members:
    log = action_logs.get(alert_id, {})
    days = (now - m.joined_on).days if m.joined_on else 30
    alerts.append({
        'id': alert_id,
        'member_id': m.id,
        'member_name': f"{m.first_name} {m.last_name or ''}".strip(),
        'severity': 'Red',
        'stalled_days': f"{days} days ago",
        'source_module': 'New Members',
        'status': log.get('status', 'pending'),
        'assigned_to': log.get('assignee', None),
        'created_at': m.joined_on.isoformat() if m.joined_on else now.isoformat(),
        'action_label': 'Assign Follow-Up',
        'action_url': '/members'
    })
    alert_id += 1

# Check LMS stalled enrollments
stalled_enrollments = TrnTrackEnrollments.objects.filter(
    progress_pct=0
).select_related('track_id', 'trainee_id').order_by('id')[:2]

for enr in stalled_enrollments:
    log = action_logs.get(alert_id, {})
    user = enr.trainee_id
    member_id = getattr(user, 'member_id', None)
    name = f"{user.first_name} {user.last_name}".strip() if (user.first_name or user.last_name) else user.email
    alerts.append({
        'id': alert_id,
        'member_id': member_id,
        'member_name': name,
        'severity': 'Amber',
        'stalled_days': '30+ days ago',
        'source_module': 'Leadership LMS',
        'status': log.get('status', 'pending'),
        'assigned_to': log.get('assignee', None),
        'created_at': enr.enrolled_at.isoformat() if enr.enrolled_at else now.isoformat(),
        'action_label': 'Message Coach',
        'action_url': '/training'
    })
    alert_id += 1

# 3. Cells & Weekly returns
cells_data = []
all_cells = Cell.objects.select_related('cell_leader').order_by('id')
for c in all_cells:
    leader_name = f"{c.cell_leader.first_name} {c.cell_leader.last_name or ''}".strip() if c.cell_leader else 'Unassigned'
    cells_data.append({
        'cell_id': c.id,
        'code': c.code or f"CEL-00{c.id}",
        'name': c.name or f"Cell #{c.id}",
        'leader': leader_name,
        'meeting_day': c.meeting_day or 'Wednesday',
        'meeting_time': str(c.meeting_time)[:5] if c.meeting_time else '18:00',
        'status': 'Pending',
        'attendance_count': 0,
        'offering_amount': 0.0,
        'topic': None,
        'scripture': None,
        'prayer_requests': None,
        'submitted_at': None
    })

active_cells_count = len(cells_data)
submitted_count = sum(1 for c in cells_data if c['status'] == 'Submitted')
pending_count = sum(1 for c in cells_data if c['status'] == 'Pending')
overdue_count = sum(1 for c in cells_data if c['status'] == 'Overdue')
total_offerings = sum(c['offering_amount'] for c in cells_data)
submitted_pct = round((submitted_count / active_cells_count) * 100) if active_cells_count > 0 else 0

cell_weekly_returns = {
    'summary': {
        'active_cells': active_cells_count,
        'submitted': submitted_count,
        'submitted_pct': submitted_pct,
        'pending': pending_count,
        'overdue': overdue_count,
        'total_offerings': total_offerings
    },
    'cells': cells_data
}

# 4. Members 360 & Milestones
milestones = {}
members_360 = []

cells_by_id = {c.id: c for c in all_cells}

featured_members = Member.objects.select_related('department_id').filter(
    id__in=[21, 22, 32, 34, 35, 30, 73, 74, 179, 420]
)

enrollments_by_member = {
    e.trainee_id.member_id: e
    for e in TrnTrackEnrollments.objects.filter(trainee_id__member__isnull=False).select_related('track_id', 'trainee_id')
}

for m in featured_members:
    cell = cells_by_id.get(m.cell_id)
    enrollment = enrollments_by_member.get(m.id)

    milestones[str(m.id)] = {
        'salvation_intake': {
            'date': m.joined_on.strftime('%Y-%m-%d') if m.joined_on else None,
            'service': None,
            'intake_officer': None,
            'complete': bool(m.joined_on)
        },
        'baptism': {
            'status': None,
            'date': None,
            'officiator': None,
            'complete': False
        },
        'cell_life': {
            'cell_name': cell.name if cell else None,
            'leader': f"{cell.cell_leader.first_name} {cell.cell_leader.last_name or ''}".strip() if cell and cell.cell_leader else None,
            'streak_days': None,
            'attendance_frequency_pct': None,
            'complete': bool(cell)
        },
        'discipleship': {
            'discipler_name': None,
            'rubric_score': None,
            'completed_sessions': None,
            'total_sessions': None,
            'complete': False
        },
        'lms': {
            'track': enrollment.track_id.title if enrollment and enrollment.track_id else None,
            'modules_completed': None,
            'modules_total': None,
            'practical_score': None,
            'complete': bool(enrollment and enrollment.progress_pct >= 100)
        },
        'commissioning': {
            'date': None,
            'ordained_role': None,
            'department': m.department_id.name if m.department_id else (m.department or None),
            'complete': bool(m.department_id)
        }
    }

print("Queries executed:", len(connection.queries))
for q in connection.queries:
    print(" - ", q['sql'][:120])
