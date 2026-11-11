from datetime import datetime, timedelta
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from core.models import Member, Meeting, Attendance, Cell
from apps.documents.services.renderer import render_pdf
from apps.documents.views_base import BasePdfView


class MemberProfilePdfView(BasePdfView):
    def get(self, request, pk):
        member = get_object_or_404(Member, pk=pk)

        total_meetings = Meeting.objects.count()
        attended_count = Attendance.objects.filter(member_id=member.id).count()
        attendance_rate = (
            round((attended_count / total_meetings * 100), 1)
            if total_meetings > 0 else 0.0
        )

        cell_obj = Cell.objects.filter(id=member.cell_id).first() if member.cell_id else None
        cell_name = cell_obj.name if cell_obj else "Unassigned"
        dept_name = member.department_id.name if member.department_id else (member.department or "General Assembly")

        # Recent attendance
        attendances = Attendance.objects.filter(member_id=member.id).select_related('meeting').order_by('-check_in_time')[:10]
        recent_records = []
        for a in attendances:
            m_title = getattr(a.meeting, 'mname', None) or getattr(a.meeting, 'name', 'Sunday Service')
            m_date = getattr(a.meeting, 'mdate', None) or (a.meeting.start_time.date() if getattr(a.meeting, 'start_time', None) else a.check_in_time.date() if a.check_in_time else timezone.now().date())
            recent_records.append({
                'meeting_name': m_title,
                'mdate': m_date,
                'check_in_time': a.check_in_time,
                'method': 'Biometric / Kiosk' if getattr(a, 'kiosk_id', None) else 'Manual Roll',
            })

        full_name = f"{member.first_name or ''} {member.last_name or ''}".strip()
        context = {
            'id': member.id,
            'member': {
                'id': member.id,
                'full_name': full_name,
                'names': full_name,
                'phone_number': getattr(member, 'phone_no', None) or getattr(member, 'phone_number', '—'),
                'email': member.email or '—',
                'gender': getattr(member, 'gender', '—'),
                'marital_status': getattr(member, 'marital_status', '—'),
                'residence': getattr(member, 'residence', '—'),
                'date_joined': getattr(member, 'joined_on', getattr(member, 'date_joined', None)),
                'cell_group': cell_name,
                'fellowship': cell_name,
                'department': dept_name,
                'ministry': dept_name,
                'status': 'Active Member',
            },
            'attendance_stats': {
                'total_attended': attended_count,
                'attendance_rate': attendance_rate,
                'recent_records': recent_records,
            },
            'pledges': {
                'total_pledged': 0,
                'total_fulfilled': 0,
                'items': [],
            },
        }

        orientation = request.GET.get('orientation', 'portrait')
        pdf_bytes, file_name = render_pdf('member_profile_360', context, user=request.user, persist=True, orientation=orientation)

        disposition = 'inline' if request.GET.get('preview') == '1' else 'attachment'
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'{disposition}; filename="{file_name}"'
        return response


class AssimilationPdfView(BasePdfView):
    def get(self, request):
        now = timezone.now()
        active_members = Member.objects.filter(
            delete_status__in=['Active', 'active', '0', 0, None]
        )

        total_count = active_members.count()
        recent_30d = active_members.filter(joined_on__gte=now - timedelta(days=30)).count()

        # Build follow-up list (unassigned to cells or newly joined)
        followup_qs = active_members.filter(cell_id__isnull=True).order_by('-joined_on')[:50]
        followup_list = []
        for m in followup_qs:
            full_name = f"{m.first_name or ''} {m.last_name or ''}".strip()
            followup_list.append({
                'name': full_name,
                'phone': getattr(m, 'phone_no', None) or getattr(m, 'phone_number', '—'),
                'residence': getattr(m, 'residence', '—'),
                'assigned_to': 'Pastoral Care Team',
                'stage': 'Pending First Touch',
                'last_contact_date': m.joined_on,
            })

        completed_count = max(0, total_count - len(followup_list))
        integration_rate = round((completed_count / total_count * 100), 1) if total_count > 0 else 0

        context = {
            'summary_data': {
                'period_label': now.strftime('%B %Y'),
                'total_new_converts': recent_30d or total_count,
                'completed_followups': completed_count,
                'pending_followups': len(followup_list),
                'conversion_rate': integration_rate,
            },
            'followup_list': followup_list,
        }

        orientation = request.GET.get('orientation', 'portrait')
        pdf_bytes, file_name = render_pdf('assimilation_followup_summary', context, user=request.user, persist=True, orientation=orientation)

        disposition = 'inline' if request.GET.get('preview') == '1' else 'attachment'
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'{disposition}; filename="{file_name}"'
        return response
