from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from core.models import Meeting, Attendance
from .models import MeetingMinutes
from apps.documents.services.renderer import render_pdf
from apps.documents.views_base import BasePdfView


class MeetingMinutesPdfView(BasePdfView):

    def get(self, request, pk):
        meeting = get_object_or_404(
            Meeting.objects.select_related('meeting_type', 'facilitator', 'facilitator__member'),
            pk=pk
        )

        minutes_obj = MeetingMinutes.objects.filter(meeting=meeting).first()
        minutes_content = minutes_obj.minutes if minutes_obj else ""

        # Query attendances using correct ForeignKey meeting_id and select_related member_id
        attendances = Attendance.objects.filter(meeting_id=meeting).select_related('member_id').order_by('login_time')
        attendees_data = []
        for att in attendances:
            name = None
            phone = None
            if att.member_id:
                name = f"{att.member_id.first_name or ''} {att.member_id.last_name or ''}".strip()
                phone = att.member_id.phone_no
            if not name:
                name = f"Member #{att.member_id_id}"
            attendees_data.append({
                'member_name': name,
                'phone_number': phone,
                'check_in_time': att.login_time,
            })

        facilitator_name = None
        if meeting.facilitator:
            if getattr(meeting.facilitator, 'member', None):
                facilitator_name = f"{meeting.facilitator.member.first_name or ''} {meeting.facilitator.member.last_name or ''}".strip()
            if not facilitator_name and hasattr(meeting.facilitator, 'get_full_name'):
                facilitator_name = meeting.facilitator.get_full_name()
            if not facilitator_name:
                facilitator_name = meeting.facilitator.email

        context = {
            'id': meeting.id,
            'meeting': {
                'id': meeting.id,
                'name': meeting.name,
                'mname': meeting.name,
                'meeting_type': meeting.meeting_type,
                'mdate': (meeting.start_time.date() if meeting.start_time else None),
                'start_time': meeting.start_time.strftime('%I:%M %p') if meeting.start_time else None,
                'end_time': meeting.end_time.strftime('%I:%M %p') if meeting.end_time else None,
                'facilitator_name': facilitator_name,
            },
            'minutes': minutes_content,
            'attendees': attendees_data,
        }

        orientation = request.GET.get('orientation', 'portrait')
        pdf_bytes, file_name = render_pdf('meeting_minutes', context, user=request.user, persist=True, orientation=orientation)

        disposition = 'inline' if request.GET.get('preview') == '1' else 'attachment'
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'{disposition}; filename="{file_name}"'
        return response
