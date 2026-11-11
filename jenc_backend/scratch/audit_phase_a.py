import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from core.models import (
    Member, Cell, CellAttendance, Attendance,
    Meeting, MeetingType, TrnLearningTracks, TrnLearningModules,
    TrnTrackEnrollments, TrnModuleProgress, TrnPracticalAssignments,
    TrnAssignmentSubmissions, TrnCoaches, TrnCoachEvaluations,
    TrnMentors, TrnMentorshipAssignments, TrnMentorshipSessions,
    TrnModuleReflections, TrnSharedJournals,
    Pledges, PledgesRedeem, Contribution, Department, SubDepartment
)
from django.db import connection

print("--- TABLE ROW COUNTS ---")
models_to_check = [
    ('Member', Member),
    ('Cell', Cell),
    ('CellAttendance', CellAttendance),
    ('Attendance', Attendance),
    ('Meeting', Meeting),
    ('TrnLearningTracks', TrnLearningTracks),
    ('TrnLearningModules', TrnLearningModules),
    ('TrnTrackEnrollments', TrnTrackEnrollments),
    ('TrnModuleProgress', TrnModuleProgress),
    ('TrnPracticalAssignments', TrnPracticalAssignments),
    ('TrnAssignmentSubmissions', TrnAssignmentSubmissions),
    ('TrnCoaches', TrnCoaches),
    ('TrnCoachEvaluations', TrnCoachEvaluations),
    ('TrnMentors', TrnMentors),
    ('TrnMentorshipAssignments', TrnMentorshipAssignments),
    ('TrnMentorshipSessions', TrnMentorshipSessions),
    ('TrnModuleReflections', TrnModuleReflections),
    ('TrnSharedJournals', TrnSharedJournals),
    ('Pledges', Pledges),
    ('Contribution', Contribution),
    ('Department', Department),
]

for name, m in models_to_check:
    try:
        cnt = m.objects.count()
        print(f"{name}: {cnt}")
    except Exception as e:
        print(f"{name}: ERROR {e}")

print("\n--- CELLS ---")
for c in Cell.objects.select_related('cell_leader').all():
    print(f"ID: {c.id}, Code: {c.code}, Name: {c.name}, Leader: {c.cell_leader_id} ({c.cell_leader.first_name if c.cell_leader else 'N/A'}), Day: {c.meeting_day}, Time: {c.meeting_time}, Status: {c.status}")

print("\n--- CELL ATTENDANCE SAMPLE ---")
for ca in CellAttendance.objects.all()[:10]:
    print(f"Cell: {ca.cell_id_id}, Member: {ca.member_id_id}, Date: {ca.meeting_date}, Present: {ca.present}")

print("\n--- ALL 63 TABLES IN DB ---")
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
    """)
    tables = [r[0] for r in cursor.fetchall()]
    print(f"Total tables: {len(tables)}")
    for t in tables:
        print(t)
