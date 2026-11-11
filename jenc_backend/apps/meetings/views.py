from datetime import datetime
from django.db.models import Count, Q, Max, Min, F, OuterRef, Exists, Subquery
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination

from core.models import MeetingType, Meeting, Attendance, Member, Cell, Department, CustomUser
from .models import MeetingMinutes
from .serializers import (
    MeetingTypeSerializer,
    MeetingListSerializer,
    MeetingDetailSerializer,
    MeetingMinutesSerializer,
    AttendanceRecordSerializer,
    AttendanceMemberRowSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class MeetingTypeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        types = MeetingType.objects.annotate(
            meeting_count=Count('meetings')
        ).order_by('id')
        serializer = MeetingTypeSerializer(types, many=True)
        return Response(serializer.data)

    def post(self, request):
        name = request.data.get('name', '').strip()
        if not name:
            return Response({'name': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)
        if MeetingType.objects.filter(name__iexact=name).exists():
            return Response({'name': ['Meeting type with this name already exists.']}, status=status.HTTP_400_BAD_REQUEST)
        m_type = MeetingType.objects.create(name=name)
        serializer = MeetingTypeSerializer(m_type)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MeetingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Meeting.objects.all().select_related(
            'meeting_type', 'facilitator', 'facilitator__member'
        ).annotate(
            attendance_count=Count('attendances', distinct=True),
            has_minutes=Exists(MeetingMinutes.objects.filter(meeting=OuterRef('pk')))
        ).order_by('-start_time')

        # Filters
        q = request.query_params.get('q', '').strip()
        if q:
            queryset = queryset.filter(
                Q(name__icontains=q) |
                Q(facilitator__member__first_name__icontains=q) |
                Q(facilitator__member__last_name__icontains=q) |
                Q(facilitator__email__icontains=q)
            )

        type_id = request.query_params.get('type_id')
        if type_id:
            queryset = queryset.filter(meeting_type_id=type_id)

        facilitator_id = request.query_params.get('facilitator_id')
        if facilitator_id:
            queryset = queryset.filter(facilitator_id=facilitator_id)

        date_from = request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(start_time__date__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(start_time__date__lte=date_to)

        has_minutes_param = request.query_params.get('has_minutes')
        if has_minutes_param is not None and has_minutes_param != '':
            val = str(has_minutes_param).lower() in ['true', '1']
            queryset = queryset.filter(has_minutes=val)

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = MeetingListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        data = request.data
        name = data.get('name', '').strip()
        meeting_type_id = data.get('meeting_type_id') or data.get('meeting_type')
        facilitator_id = data.get('facilitator_id') or data.get('facilitator')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        meeting_link = data.get('meeting_link', '').strip() or None
        description = data.get('description', '').strip() or None

        errors = {}
        if not name:
            errors['name'] = ['Name is required.']
        if not meeting_type_id:
            errors['meeting_type_id'] = ['Meeting type is required.']
        if not facilitator_id:
            errors['facilitator_id'] = ['Facilitator is required.']
        if not start_time:
            errors['start_time'] = ['Start time is required.']

        if start_time and end_time:
            try:
                st = datetime.fromisoformat(str(start_time).replace('Z', '+00:00'))
                et = datetime.fromisoformat(str(end_time).replace('Z', '+00:00'))
                if et <= st:
                    errors['end_time'] = ['End time must be after start time.']
            except Exception:
                pass

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Verification of FKs
        try:
            m_type = MeetingType.objects.get(id=meeting_type_id)
        except MeetingType.DoesNotExist:
            return Response({'meeting_type_id': ['Invalid meeting type.']}, status=status.HTTP_400_BAD_REQUEST)

        try:
            fac = CustomUser.objects.get(id=facilitator_id)
        except CustomUser.DoesNotExist:
            return Response({'facilitator_id': ['Invalid facilitator user.']}, status=status.HTTP_400_BAD_REQUEST)

        meeting = Meeting.objects.create(
            name=name,
            meeting_type=m_type,
            facilitator=fac,
            start_time=start_time,
            end_time=end_time or None,
            meeting_link=meeting_link,
            description=description,
        )

        # Fetch with relations for serialization
        fresh = Meeting.objects.select_related(
            'meeting_type', 'facilitator', 'facilitator__member'
        ).annotate(
            attendance_count=Count('attendances', distinct=True),
            has_minutes=Exists(MeetingMinutes.objects.filter(meeting=OuterRef('pk')))
        ).get(id=meeting.id)

        return Response(MeetingListSerializer(fresh).data, status=status.HTTP_201_CREATED)


class MeetingDetailUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Meeting.objects.select_related(
                'meeting_type', 'facilitator', 'facilitator__member'
            ).annotate(
                attendance_count=Count('attendances', distinct=True),
                has_minutes=Exists(MeetingMinutes.objects.filter(meeting=OuterRef('pk')))
            ).get(pk=pk)
        except Meeting.DoesNotExist:
            return None

    def get(self, request, pk):
        meeting = self.get_object(pk)
        if not meeting:
            return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = MeetingDetailSerializer(meeting)
        return Response(serializer.data)

    def patch(self, request, pk):
        meeting = self.get_object(pk)
        if not meeting:
            return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'name' in data and data['name'].strip():
            meeting.name = data['name'].strip()
        if 'meeting_type_id' in data:
            meeting.meeting_type_id = data['meeting_type_id']
        elif 'meeting_type' in data:
            meeting.meeting_type_id = data['meeting_type']
        if 'facilitator_id' in data:
            meeting.facilitator_id = data['facilitator_id']
        elif 'facilitator' in data:
            meeting.facilitator_id = data['facilitator']
        if 'start_time' in data:
            meeting.start_time = data['start_time']
        if 'end_time' in data:
            meeting.end_time = data['end_time'] or None
        if 'meeting_link' in data:
            meeting.meeting_link = data['meeting_link'].strip() or None
        if 'description' in data:
            meeting.description = data['description'].strip() or None

        if meeting.start_time and meeting.end_time:
            try:
                st = datetime.fromisoformat(str(meeting.start_time).replace('Z', '+00:00'))
                et = datetime.fromisoformat(str(meeting.end_time).replace('Z', '+00:00'))
                if et <= st:
                    return Response({'end_time': ['End time must be after start time.']}, status=status.HTTP_400_BAD_REQUEST)
            except Exception:
                pass

        meeting.save()
        fresh = self.get_object(pk)
        return Response(MeetingDetailSerializer(fresh).data)

    def delete(self, request, pk):
        try:
            meeting = Meeting.objects.get(pk=pk)
        except Meeting.DoesNotExist:
            return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)

        # Blocker 2 Resolution: Explicit attendance safety check
        att_count = meeting.attendances.count()
        if att_count > 0:
            return Response(
                {'error': f'Cannot delete meeting with {att_count} attendance records — archive instead or remove attendance first'},
                status=status.HTTP_409_CONFLICT
            )

        meeting.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeetingAttendanceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            meeting = Meeting.objects.get(pk=pk)
        except Meeting.DoesNotExist:
            return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)

        attendances = Attendance.objects.filter(
            meeting_id=meeting
        ).select_related('member_id', 'meeting_id').order_by('-login_time')

        serializer = AttendanceRecordSerializer(attendances, many=True)
        return Response(serializer.data)

    def post(self, request, pk):
        try:
            meeting = Meeting.objects.get(pk=pk)
        except Meeting.DoesNotExist:
            return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)

        member_id = request.data.get('member_id')
        phone_no = request.data.get('phone_no')
        if not member_id and not phone_no:
            return Response({'error': 'member_id or phone_no is required.'}, status=status.HTTP_400_BAD_REQUEST)

        member = None
        if member_id:
            member = Member.objects.filter(pk=member_id).first()
        elif phone_no:
            cleaned_phone = str(phone_no).strip()
            member = Member.objects.filter(phone_no=cleaned_phone).first()

        if not member:
            return Response({'error': 'Member not found with the provided ID or phone number.'}, status=status.HTTP_404_NOT_FOUND)

        if Attendance.objects.filter(meeting_id=meeting, member_id=member).exists():
            return Response({'error': 'Member already checked in for this meeting'}, status=status.HTTP_400_BAD_REQUEST)

        att = Attendance.objects.create(
            meeting_id=meeting,
            member_id=member,
            login_time=timezone.now()
        )
        return Response(AttendanceRecordSerializer(att).data, status=status.HTTP_201_CREATED)


class MeetingAttendanceDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, att_id):
        try:
            attendance = Attendance.objects.get(pk=att_id, meeting_id_id=pk)
        except Attendance.DoesNotExist:
            return Response({'error': 'Attendance record not found for this meeting'}, status=status.HTTP_404_NOT_FOUND)

        attendance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeetingAttendanceEligibleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            meeting = Meeting.objects.get(pk=pk)
        except Meeting.DoesNotExist:
            return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)

        checked_in_ids = Attendance.objects.filter(
            meeting_id=meeting
        ).values_list('member_id_id', flat=True)

        members = Member.objects.filter(
            Q(delete_status='Active') | Q(delete_status__isnull=True) | Q(delete_status='0')
        ).exclude(id__in=checked_in_ids)

        q = request.query_params.get('q', '').strip()
        if q:
            members = members.filter(
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q) |
                Q(phone_no__icontains=q)
            )

        members = members.order_by('first_name', 'last_name')[:20]

        results = [
            {
                'id': m.id,
                'member_id': m.id,
                'member_name': f"{m.first_name or ''} {m.last_name or ''}".strip(),
                'phone_no': m.phone_no,
            }
            for m in members
        ]
        return Response(results)


class AttendanceSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        meeting_id = request.query_params.get('meeting_id')

        # Active members total
        active_members_count = Member.objects.filter(
            Q(delete_status='Active') | Q(delete_status__isnull=True) | Q(delete_status='0')
        ).count()

        if meeting_id:
            try:
                meeting = Meeting.objects.get(pk=meeting_id)
            except Meeting.DoesNotExist:
                return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)

            attended = Attendance.objects.filter(meeting_id=meeting).count()
            absent = max(0, active_members_count - attended)
            pct = round((attended / active_members_count * 100), 1) if active_members_count else 0.0

            return Response({
                'meeting_id': meeting.id,
                'meeting_name': meeting.name,
                'total_members': active_members_count,
                'attended': attended,
                'absent': absent,
                'total_checkins': attended,
                'attendance_pct': pct,
            })

        # Aggregated across all meetings
        total_checkins = Attendance.objects.count()
        meeting_count = Meeting.objects.count()
        unique_attendees = Attendance.objects.values('member_id').distinct().count()
        absent_overall = max(0, active_members_count - unique_attendees)

        overall_pct = (
            round(total_checkins / (active_members_count * meeting_count) * 100, 1)
            if (active_members_count and meeting_count) else 0.0
        )

        return Response({
            'total_members': active_members_count,
            'attended': unique_attendees,
            'absent': absent_overall,
            'total_checkins': total_checkins,
            'meeting_count': meeting_count,
            'attendance_pct': overall_pct,
            'overall_attendance_pct': overall_pct,
        })


class AttendanceIndividualTrackingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        meeting_id = request.query_params.get('meeting_id')
        cell_id = request.query_params.get('cell_id')
        department_id = request.query_params.get('department_id')
        gender = request.query_params.get('gender')
        status_filter = request.query_params.get('status', '').strip()

        members = Member.objects.filter(
            Q(delete_status='Active') | Q(delete_status__isnull=True) | Q(delete_status='0')
        ).select_related('department_id')

        if cell_id:
            members = members.filter(cell_id=cell_id)
        if department_id:
            members = members.filter(department_id_id=department_id)
        if gender:
            members = members.filter(gender__iexact=gender)

        if meeting_id:
            total_meetings = 1
            members = members.annotate(
                attended_count=Count(
                    'meeting_attendances',
                    filter=Q(meeting_attendances__meeting_id_id=meeting_id)
                ),
                last_attended=Max('meeting_attendances__login_time')
            )
        else:
            total_meetings = Meeting.objects.count() or 1
            members = members.annotate(
                attended_count=Count('meeting_attendances'),
                last_attended=Max('meeting_attendances__login_time')
            )

        # Pre-cache cell names for efficiency
        cell_map = {c.id: c.name for c in Cell.objects.all()}

        rows = []
        for m in members:
            att_cnt = m.attended_count
            rate = round(att_cnt / total_meetings * 100.0, 1) if total_meetings else 0.0
            if rate >= 80.0:
                s_label = 'Regular'
            elif rate >= 50.0:
                s_label = 'Irregular'
            else:
                s_label = 'Needs Follow-up'

            if status_filter and s_label.lower() != status_filter.lower():
                continue

            rows.append({
                'member_id': m.id,
                'name': f"{m.first_name or ''} {m.last_name or ''}".strip(),
                'cell_name': cell_map.get(m.cell_id, "Unassigned") if m.cell_id else "Unassigned",
                'department': m.department_id.name if m.department_id else (m.department or "General"),
                'gender': m.gender or "Unknown",
                'attended_count': att_cnt,
                'total_meetings': total_meetings,
                'attendance_rate': rate,
                'status_label': s_label,
                'last_attended': m.last_attended,
            })

        # Manual pagination over python rows
        page_size = int(request.query_params.get('page_size', 20))
        page_num = int(request.query_params.get('page', 1))
        total_records = len(rows)
        total_pages = max(1, (total_records + page_size - 1) // page_size)
        start_idx = (page_num - 1) * page_size
        end_idx = start_idx + page_size
        page_results = rows[start_idx:end_idx]

        serializer = AttendanceMemberRowSerializer(page_results, many=True)
        return Response({
            'count': total_records,
            'total_pages': total_pages,
            'current_page': page_num,
            'page_size': page_size,
            'results': serializer.data
        })


class AttendanceFollowupView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_meetings = Meeting.objects.count() or 1
        members = Member.objects.filter(
            Q(delete_status='Active') | Q(delete_status__isnull=True) | Q(delete_status='0')
        ).select_related('department_id').annotate(
            attended_count=Count('meeting_attendances'),
            last_attended=Max('meeting_attendances__login_time')
        )

        cell_map = {c.id: c.name for c in Cell.objects.all()}

        rows = []
        for m in members:
            att_cnt = m.attended_count
            rate = round(att_cnt / total_meetings * 100.0, 1) if total_meetings else 0.0
            if rate < 50.0:
                rows.append({
                    'member_id': m.id,
                    'name': f"{m.first_name or ''} {m.last_name or ''}".strip(),
                    'phone_no': m.phone_no,
                    'cell_name': cell_map.get(m.cell_id, "Unassigned") if m.cell_id else "Unassigned",
                    'department': m.department_id.name if m.department_id else (m.department or "General"),
                    'gender': m.gender or "Unknown",
                    'attended_count': att_cnt,
                    'total_meetings': total_meetings,
                    'attendance_rate': rate,
                    'status_label': 'Needs Follow-up',
                    'last_attended': m.last_attended,
                })

        # Sort by attendance_rate ascending, then name
        rows.sort(key=lambda r: (r['attendance_rate'], r['name']))
        serializer = AttendanceMemberRowSerializer(rows, many=True)
        return Response({
            'count': len(rows),
            'results': serializer.data
        })


class AttendanceAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        year_param = request.query_params.get('year')
        current_year = timezone.now().year
        try:
            year = int(year_param) if year_param else current_year
        except ValueError:
            year = current_year

        attendances_in_year = Attendance.objects.filter(login_time__year=year)

        # 1. Monthly series via single aggregate
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        monthly_counts = {m: 0 for m in range(1, 13)}
        month_qs = attendances_in_year.annotate(
            month_trunc=TruncMonth('login_time')
        ).values('month_trunc').annotate(count=Count('id')).order_by('month_trunc')

        total_checkins = 0
        for entry in month_qs:
            dt = entry['month_trunc']
            cnt = entry['count']
            total_checkins += cnt
            if dt and dt.year == year:
                monthly_counts[dt.month] = cnt

        monthly = [
            {
                'month': f"{year}-{m:02d}",
                'label': month_names[m - 1],
                'count': monthly_counts[m]
            }
            for m in range(1, 13)
        ]

        # 2. Cell counts & map
        cell_dict = dict(Cell.objects.values_list('id', 'name'))
        cell_counts = attendances_in_year.values('member_id__cell_id').annotate(
            count=Count('id')
        ).order_by('-count')

        by_cell = [
            {
                'cell_id': item['member_id__cell_id'],
                'cell_name': cell_dict.get(item['member_id__cell_id'], 'Unassigned') if item['member_id__cell_id'] else 'Unassigned',
                'count': item['count']
            }
            for item in cell_counts
        ]

        # 3. Department counts
        dept_counts = attendances_in_year.values(
            'member_id__department_id__id',
            'member_id__department_id__name',
            'member_id__department'
        ).annotate(count=Count('id')).order_by('-count')

        by_department = [
            {
                'department_id': item['member_id__department_id__id'],
                'department_name': item['member_id__department_id__name'] or item['member_id__department'] or 'General',
                'count': item['count']
            }
            for item in dept_counts
        ]

        # 4. Gender counts
        gender_counts = attendances_in_year.values('member_id__gender').annotate(
            count=Count('id')
        )
        by_gender = [
            {
                'gender': item['member_id__gender'] or 'Unknown',
                'count': item['count']
            }
            for item in gender_counts
        ]

        # Summary KPIs
        meetings_in_year = Meeting.objects.filter(start_time__year=year).count()
        active_members_count = Member.objects.filter(
            Q(delete_status='Active') | Q(delete_status__isnull=True) | Q(delete_status='0')
        ).count()

        overall_rate = (
            round(total_checkins / (meetings_in_year * active_members_count) * 100, 1)
            if (meetings_in_year and active_members_count) else 0.0
        )

        return Response({
            'year': year,
            'meetings_in_year': meetings_in_year,
            'total_checkins': total_checkins,
            'overall_rate': overall_rate,
            'monthly': monthly,
            'by_cell': by_cell,
            'by_department': by_department,
            'by_gender': by_gender,
        })


class MeetingMinutesDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            meeting = Meeting.objects.get(pk=pk)
        except Meeting.DoesNotExist:
            return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)

        minutes = MeetingMinutes.objects.filter(meeting=meeting).select_related('personnel', 'personnel__member').first()
        if not minutes:
            return Response({
                'id': None,
                'meeting_id': meeting.id,
                'minutes': None,
                'personnel_id': None,
                'personnel_name': None,
                'created_at': None,
                'updated_at': None,
            })
        serializer = MeetingMinutesSerializer(minutes)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            meeting = Meeting.objects.get(pk=pk)
        except Meeting.DoesNotExist:
            return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)

        minutes_content = request.data.get('minutes', '')
        personnel_id = request.data.get('personnel_id') or request.user.id

        personnel = None
        if personnel_id:
            personnel = CustomUser.objects.filter(id=personnel_id).first()

        minutes_obj, created = MeetingMinutes.objects.update_or_create(
            meeting=meeting,
            defaults={
                'minutes': minutes_content,
                'personnel': personnel,
            }
        )
        serializer = MeetingMinutesSerializer(minutes_obj)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

    def delete(self, request, pk):
        try:
            minutes = MeetingMinutes.objects.get(meeting_id=pk)
            minutes.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except MeetingMinutes.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)


class MeetingMinutesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Legacy excludes meeting_type = 1
        queryset = Meeting.objects.exclude(
            meeting_type_id=1
        ).select_related(
            'meeting_type', 'facilitator', 'facilitator__member'
        ).annotate(
            minutes_count=Count('minutes_records', distinct=True),
            attendance_count=Count('attendances', distinct=True),
            has_minutes=Exists(MeetingMinutes.objects.filter(meeting=OuterRef('pk'))),
            last_updated=Max('minutes_records__updated_at')
        ).order_by('-start_time')

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = MeetingListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class MeetingsFilterLookupView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        types = MeetingType.objects.values('id', 'name').order_by('name')
        cells = Cell.objects.values('id', 'name').order_by('name')
        departments = Department.objects.values('id', 'name').order_by('name')

        # Facilitators who have facilitated at least one meeting
        fac_ids = Meeting.objects.values_list('facilitator_id', flat=True).distinct()
        users = CustomUser.objects.filter(id__in=fac_ids).select_related('member')

        facilitators = []
        for u in users:
            name = None
            if getattr(u, 'member', None):
                name = f"{u.member.first_name or ''} {u.member.last_name or ''}".strip()
            if not name and hasattr(u, 'get_full_name'):
                name = u.get_full_name()
            if not name:
                name = u.email or f"User #{u.id}"
            facilitators.append({'id': u.id, 'name': name})

        facilitators.sort(key=lambda x: x['name'])

        # Years with meetings
        meeting_dates = Meeting.objects.dates('start_time', 'year')
        years = sorted(list({d.year for d in meeting_dates}), reverse=True)
        current_year = timezone.now().year
        if current_year not in years:
            years.insert(0, current_year)

        return Response({
            'types': list(types),
            'cells': list(cells),
            'departments': list(departments),
            'facilitators': facilitators,
            'years': years,
        })
