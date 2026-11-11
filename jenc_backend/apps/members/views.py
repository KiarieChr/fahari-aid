import csv
from datetime import timedelta
from django.utils import timezone
from django.http import HttpResponse
from django.db.models import Count, Q
from django.db.models.functions import TruncMonth
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.models import Member, Cell, Department, Attendance, Meeting
from core.pagination import StandardResultsPagination
from .models import CommittedMembers
from .serializers import MemberSerializer, CommittedMembersSerializer


class MemberViewSet(viewsets.ModelViewSet):
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        qs = Member.objects.all().order_by('-id')

        # 1. Search Query filter (q across first_name, last_name, email, phone_no, id)
        q = self.request.query_params.get('q', '').strip()
        if q:
            filter_q = (
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q) |
                Q(email__icontains=q) |
                Q(phone_no__icontains=q)
            )
            if q.isdigit():
                filter_q |= Q(id=int(q))
            qs = qs.filter(filter_q)

        # 2. Cell Filter (cell_id as integer, or literal 'unassigned')
        cell_id = self.request.query_params.get('cell_id', '').strip()
        if cell_id:
            if cell_id.lower() in ['unassigned', '0']:
                qs = qs.filter(Q(cell_id__isnull=True) | Q(cell_id=0))
            elif cell_id.isdigit():
                qs = qs.filter(cell_id=int(cell_id))

        # 3. Month Filter (month as YYYY-MM on joined_on)
        month = self.request.query_params.get('month', '').strip()
        if month and month.lower() != 'all':
            parts = month.split('-')
            if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
                qs = qs.filter(joined_on__year=int(parts[0]), joined_on__month=int(parts[1]))

        # 4. Status Filter
        status_param = self.request.query_params.get('status', '').strip()
        if status_param and status_param.lower() != 'all':
            qs = qs.filter(delete_status__iexact=status_param)

        # Pre-cache cells mapping on the request object to avoid N+1 queries during serialization
        if not hasattr(self.request, '_cells_cache'):
            self.request._cells_cache = {c.id: c.name for c in Cell.objects.all()}

        return qs

    def list(self, request, *args, **kwargs):
        """
        Support ?all=true&month=YYYY-MM for Joined Members Drilldown Modal.
        Returns up to 500 unpaginated rows for instant client-side table search.
        """
        if request.query_params.get('all') == 'true':
            qs = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(qs[:500], many=True)
            return Response({
                'count': qs.count(),
                'results': serializer.data
            })
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """
        B1. GET /api/members/analytics/
        Computes all growth, assimilation, departmental, and demographic metrics via ORM queries.
        """
        now = timezone.now()
        kpi_aggregates = Member.objects.aggregate(
            total=Count('id'),
            active=Count('id', filter=Q(delete_status__in=['Active', 'active', '0', 0, None])),
            new_30d=Count('id', filter=Q(joined_on__gte=now - timedelta(days=30))),
            unassigned_cells=Count('id', filter=Q(cell_id__isnull=True) | Q(cell_id=0)),
            unassigned_depts=Count('id', filter=Q(department_id__isnull=True) | Q(department_id=0))
        )
        total_members = kpi_aggregates['total'] or 0
        active_members = kpi_aggregates['active'] or 0
        new_last_30_days = kpi_aggregates['new_30d'] or 0
        unassigned_cell_count = kpi_aggregates['unassigned_cells'] or 0
        unassigned_dept_count = kpi_aggregates['unassigned_depts'] or 0

        assigned_cell_count = total_members - unassigned_cell_count
        cell_assimilation_pct = (
            round((assigned_cell_count / total_members) * 100, 1)
            if total_members > 0 else 0.0
        )
        dept_coverage_pct = (
            round(((total_members - unassigned_dept_count) / total_members) * 100, 1)
            if total_members > 0 else 0.0
        )

        # 3. Growth timeline (joined_on grouped chronologically, one entry per month with data)
        monthly_qs = list(
            Member.objects.filter(joined_on__isnull=False)
            .annotate(m=TruncMonth('joined_on'))
            .values('m')
            .annotate(count=Count('id'))
            .order_by('m')
        )
        growth_timeline = [
            {
                'month': r['m'].strftime('%Y-%m'),
                'label': r['m'].strftime('%b %Y'),
                'count': r['count']
            }
            for r in monthly_qs
        ]

        # 4. Growth calculations: Peak month & average monthly signups
        peak_month_raw = max(growth_timeline, key=lambda x: x['count']) if growth_timeline else {'label': 'N/A', 'count': 0}
        peak_month = {
            'label': peak_month_raw['label'],
            'count': peak_month_raw['count']
        }
        avg_monthly = (
            round(sum(r['count'] for r in growth_timeline) / len(growth_timeline), 1)
            if growth_timeline else 0.0
        )

        # 5. Cell group representation distribution (all cells + synthetic Unassigned bucket)
        all_cells = list(Cell.objects.all().order_by('id'))
        cell_counts_map = dict(
            Member.objects.values('cell_id')
            .annotate(c=Count('id'))
            .values_list('cell_id', 'c')
        )
        cells_distribution = []
        for c in all_cells:
            cnt = cell_counts_map.get(c.id, 0)
            cells_distribution.append({
                'cell_id': c.id,
                'cell_name': c.name,
                'count': cnt,
                'pct': round((cnt / total_members * 100), 1) if total_members > 0 else 0.0
            })
        cells_distribution.append({
            'cell_id': None,
            'cell_name': 'Unassigned',
            'count': unassigned_cell_count,
            'pct': round((unassigned_cell_count / total_members * 100), 1) if total_members > 0 else 0.0
        })

        # 6. Departmental Representation
        all_depts = list(Department.objects.all().order_by('id'))
        dept_counts_map = dict(
            Member.objects.values('department_id')
            .annotate(c=Count('id'))
            .values_list('department_id', 'c')
        )
        departments_distribution = []
        for d in all_depts:
            cnt = dept_counts_map.get(d.id, 0)
            departments_distribution.append({
                'dept_id': d.id,
                'dept_name': d.name,
                'count': cnt,
                'pct': round((cnt / total_members * 100), 1) if total_members > 0 else 0.0
            })
        departments_distribution.append({
            'dept_id': None,
            'dept_name': 'Unassigned',
            'count': unassigned_dept_count,
            'pct': round((unassigned_dept_count / total_members * 100), 1) if total_members > 0 else 0.0
        })

        # 7. Demographics: Gender distribution
        gender_qs = list(
            Member.objects.values('gender')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        gender_distribution = []
        for g in gender_qs:
            val = g['gender']
            lbl = val.capitalize() if val else 'Unspecified'
            gender_distribution.append({
                'label': lbl,
                'count': g['count']
            })

        # 8. Demographics: Marital status distribution
        marital_qs = list(
            Member.objects.values('marital')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        marital_distribution = []
        for m in marital_qs:
            val = m['marital']
            lbl = val.capitalize() if val else 'Unspecified'
            marital_distribution.append({
                'label': lbl,
                'count': m['count']
            })

        # 9. Demographics: Employment status distribution
        emp_qs = list(
            Member.objects.values('emp_status')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        emp_distribution = []
        for e in emp_qs:
            val = e['emp_status']
            lbl = val.replace('_', ' ').capitalize() if val else 'Unspecified'
            emp_distribution.append({
                'label': lbl,
                'count': e['count']
            })

        # 10. Server-side Insights object
        insights = {
            'peak_month': peak_month,
            'cell_integration': {
                'pct': cell_assimilation_pct,
                'unassigned_count': unassigned_cell_count
            },
            'dept_engagement': {
                'pct': dept_coverage_pct,
                'unassigned_count': unassigned_dept_count
            }
        }

        # 11. Recent members limited to latest 5, with is_new flag
        recent_qs = Member.objects.all().order_by('-joined_on', '-id')[:5]
        cells_map = {c.id: c.name for c in all_cells}
        recent_members = []
        for m in recent_qs:
            cname = cells_map.get(m.cell_id, 'Unassigned') if m.cell_id else 'Unassigned'
            is_new = False
            if m.joined_on:
                is_new = (now - m.joined_on).total_seconds() <= (2 * 86400)
            recent_members.append({
                'id': m.id,
                'member_id': m.id,
                'full_name': f"{m.first_name} {m.last_name or ''}".strip(),
                'cell_name': cname,
                'phone': m.phone_no or '—',
                'email': m.email or '—',
                'joined_on': m.joined_on.strftime('%b %d, %Y') if m.joined_on else '—',
                'is_new': is_new
            })

        # 12. Committed Members KPI stats for Directory & Committed views
        committed_agg = CommittedMembers.objects.aggregate(
            total=Count('id'),
            linked=Count('id', filter=Q(member__isnull=False)),
            unlinked=Count('id', filter=Q(member__isnull=True))
        )
        committed_total = committed_agg['total'] or 0
        committed_linked = committed_agg['linked'] or 0
        committed_unlinked = committed_agg['unlinked'] or 0


        return Response({
            'kpis': {
                'total_members': total_members,
                'active_members': active_members,
                'new_last_30_days': new_last_30_days,
                'assigned_cell_count': assigned_cell_count,
                'unassigned_cell_count': unassigned_cell_count,
                'cell_assimilation_pct': cell_assimilation_pct,
                'dept_coverage_pct': dept_coverage_pct,
                'unassigned_dept_count': unassigned_dept_count,
                'avg_monthly_registrations': avg_monthly,
                'peak_month': peak_month,
            },
            'committed_kpis': {
                'regular_total': total_members,
                'committed_total': committed_total,
                'committed_linked': committed_linked,
                'committed_unlinked': committed_unlinked,
            },
            'growth_timeline': growth_timeline,
            'cells_distribution': cells_distribution,
            'departments_distribution': departments_distribution,
            'gender_distribution': gender_distribution,
            'marital_distribution': marital_distribution,
            'employment_distribution': emp_distribution,
            'insights': insights,
            'recent_members': recent_members
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        """
        B4. GET /api/members/<id>/profile/
        Returns the full offcanvas payload matching legacy get-member-details.php.
        """
        member = self.get_object()

        # Attendance calculation
        total_meetings = Meeting.objects.count()
        attended_count = Attendance.objects.filter(member_id=member.id).count()
        attendance_rate = (
            round((attended_count / total_meetings * 100), 1)
            if total_meetings > 0 else 0.0
        )
        if attendance_rate >= 80:
            status_label = "Regular"
        elif attendance_rate >= 50:
            status_label = "Irregular"
        else:
            status_label = "Needs Follow-up"

        cell_obj = Cell.objects.filter(id=member.cell_id).first() if member.cell_id else None
        cell_code = f"CEL-{cell_obj.id:03d}" if cell_obj else "CEL-000"
        cell_name = cell_obj.name if cell_obj else "Unassigned"

        dept_name = member.department_id.name if member.department_id else (member.department or "General")

        # Last 10 meetings history
        recent_meetings = Meeting.objects.order_by('-start_time')[:10]
        attended_meeting_ids = set(
            Attendance.objects.filter(
                member_id=member.id,
                meeting_id__in=recent_meetings
            ).values_list('meeting_id', flat=True)
        )
        recent_attendance = [
            {
                'meeting_id': m.id,
                'meeting_name': m.name,
                'date': m.start_time.strftime('%Y-%m-%d'),
                'date_formatted': m.start_time.strftime('%b %d, %Y'),
                'attended': m.id in attended_meeting_ids,
            }
            for m in recent_meetings
        ]

        return Response({
            'id': member.id,
            'first_name': member.first_name,
            'last_name': member.last_name or '',
            'name': f"{member.first_name} {member.last_name or ''}".strip(),
            'photo': member.photo or None,
            'department': dept_name,
            'joined_on': member.joined_on.strftime('%Y-%m-%d') if member.joined_on else None,
            'joined_on_formatted': member.joined_on.strftime('%b %d, %Y') if member.joined_on else '—',
            'email': member.email or '—',
            'phone_no': member.phone_no or '—',
            'location': member.location or member.address or '—',
            'gender': (member.gender or 'Unspecified').capitalize(),
            'marital': (member.marital or 'Unspecified').capitalize(),
            'emp_status': (member.emp_status or 'Unspecified').replace('_', ' ').capitalize(),
            'cell_code': cell_code,
            'cell_name': cell_name,
            'attendance': {
                'attended_count': attended_count,
                'total_meetings': total_meetings,
                'attendance_rate': attendance_rate,
                'status_label': status_label
            },
            'recent_attendance': recent_attendance,
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        B3 helper: GET /api/members/search/?q=<term>
        Searches Member by first/last name, phone, email (min 3 chars).
        Used by the Link to Member modal.
        """
        term = request.query_params.get('q', '').strip()
        if len(term) < 3:
            return Response([])

        filter_q = (
            Q(first_name__icontains=term) |
            Q(last_name__icontains=term) |
            Q(phone_no__icontains=term) |
            Q(email__icontains=term)
        )
        if term.isdigit():
            filter_q |= Q(id=int(term))

        members = Member.objects.filter(filter_q).order_by('first_name', 'last_name')[:20]
        results = [
            {
                'id': m.id,
                'full_name': f"{m.first_name} {m.last_name or ''}".strip(),
                'phone_no': m.phone_no or '—',
                'email': m.email or '—',
                'department': m.department or 'General'
            }
            for m in members
        ]
        return Response(results, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        B4. GET /api/members/export/
        Streams a real CSV export of the currently filtered dataset.
        """
        qs = self.get_queryset()
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="members_export.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Member ID',
            'First Name',
            'Last Name',
            'Gender',
            'Phone',
            'Email',
            'Cell',
            'Marital',
            'Employment',
            'Joined On'
        ])

        cells_map = {c.id: c.name for c in Cell.objects.all()}
        for m in qs:
            cname = cells_map.get(m.cell_id, 'Unassigned') if m.cell_id else 'Unassigned'
            writer.writerow([
                m.id,
                m.first_name,
                m.last_name or '',
                m.gender or '',
                m.phone_no or '',
                m.email or '',
                cname,
                m.marital or '',
                m.emp_status or '',
                m.joined_on.strftime('%Y-%m-%d %H:%M') if m.joined_on else ''
            ])

        return response


class CommittedMembersViewSet(viewsets.ModelViewSet):
    """
    B3. Committed Members ViewSet
    Handles full CRUD, linking to Member profiles, and committed guest management.
    """
    queryset = CommittedMembers.objects.select_related('member').all().order_by('-created_at')
    serializer_class = CommittedMembersSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get('q', '').strip()
        if q:
            qs = qs.filter(
                Q(full_name__icontains=q) |
                Q(phone__icontains=q) |
                Q(email__icontains=q) |
                Q(residence__icontains=q)
            )
        status_filter = self.request.query_params.get('status', '').strip().lower()
        if status_filter == 'linked':
            qs = qs.filter(member__isnull=False)
        elif status_filter == 'unlinked':
            qs = qs.filter(member__isnull=True)
        return qs

    @action(detail=True, methods=['post'])
    def link(self, request, pk=None):
        """
        POST /api/members/committed/<id>/link/
        Body: { "member_id": <int> }
        Links target guest to an existing Member profile.
        """
        committed = self.get_object()
        member_id = request.data.get('member_id')
        if not member_id:
            return Response({'member_id': ['member_id is required']}, status=status.HTTP_400_BAD_REQUEST)

        member = Member.objects.filter(id=member_id).first()
        if not member:
            return Response({'member_id': ['Selected member does not exist']}, status=status.HTTP_400_BAD_REQUEST)

        committed.member = member
        committed.save(update_fields=['member'])
        return Response(self.get_serializer(committed).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def unlink(self, request, pk=None):
        """
        POST /api/members/committed/<id>/unlink/
        Removes link to Member profile.
        """
        committed = self.get_object()
        committed.member = None
        committed.save(update_fields=['member'])
        return Response(self.get_serializer(committed).data, status=status.HTTP_200_OK)
