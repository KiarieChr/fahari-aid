from datetime import timedelta
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q

from core.models import Event, EventSchedule, EventRegistration, EventAttendance
from apps.documents.services.renderer import render_pdf
from apps.documents.views_base import BasePdfView


class EventAttendancePdfView(BasePdfView):

    def get(self, request, event_id):
        event = get_object_or_404(Event.objects.filter(delete_status=False), pk=event_id)

        registrations_qs = EventRegistration.objects.filter(
            event_id=event
        ).prefetch_related('attendances').order_by('names')

        regs_data = []
        checked_in_count = 0
        for r in registrations_qs:
            att = r.attendances.first()
            has_att = att is not None
            check_in_time = att.check_in_time if has_att else None
            if has_att:
                checked_in_count += 1
            regs_data.append({
                'names': r.names or 'Anonymous',
                'full_name': r.names or 'Anonymous',
                'name': r.names or 'Anonymous',
                'phone': getattr(r, 'phone_no', None) or getattr(r, 'phone', '—'),
                'phone_number': getattr(r, 'phone_no', None) or getattr(r, 'phone', '—'),
                'category': r.category or 'General',
                'attendee_type': r.category or 'General',
                'checked_in': has_att,
                'check_in_time': check_in_time,
            })

        total_registered = len(regs_data)
        rate = round((checked_in_count / total_registered * 100), 1) if total_registered > 0 else 0

        context = {
            'id': event.id,
            'event': event,
            'registrations': regs_data,
            'total_registered': total_registered,
            'total_checked_in': checked_in_count,
            'checkin_rate': rate,
        }

        orientation = request.GET.get('orientation', 'portrait')
        pdf_bytes, file_name = render_pdf('event_attendance_report', context, user=request.user, persist=True, orientation=orientation)

        disposition = 'inline' if request.GET.get('preview') == '1' else 'attachment'
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'{disposition}; filename="{file_name}"'
        return response


class EventSchedulePdfView(BasePdfView):
    def get(self, request, event_id):
        event = get_object_or_404(Event.objects.filter(delete_status=False), pk=event_id)

        sessions_qs = EventSchedule.objects.filter(event_id=event).order_by('day_number', 'sort_order', 'start_time')

        # Group sessions by day_number
        days_dict = {}
        for s in sessions_qs:
            day_num = s.day_number or 1
            if day_num not in days_dict:
                day_date = None
                date_display = ''
                if event.start_date:
                    try:
                        base_date = event.start_date.date() if hasattr(event.start_date, 'date') else event.start_date
                        day_date = base_date + timedelta(days=day_num - 1)
                        date_display = day_date.strftime('%A, %B %d, %Y')
                    except Exception:
                        pass
                if not date_display:
                    date_display = f"Day {day_num}"

                days_dict[day_num] = {
                    'day_number': day_num,
                    'date': day_date,
                    'date_display': date_display,
                    'sessions': [],
                }
            days_dict[day_num]['sessions'].append({
                'start_time': s.start_time.strftime('%I:%M %p') if s.start_time else 'TBD',
                'end_time': s.end_time.strftime('%I:%M %p') if s.end_time else 'TBD',
                'title': s.title or 'Session',
                'speaker': s.speaker or '—',
                'venue': s.location or getattr(event, 'branch', None) or 'Main Auditorium',
                'description': s.description or '',
            })

        schedule_list = [days_dict[k] for k in sorted(days_dict.keys())]

        context = {
            'id': event.id,
            'event': event,
            'schedule': schedule_list,
        }

        orientation = request.GET.get('orientation', 'landscape')
        pdf_bytes, file_name = render_pdf('event_schedule_report', context, user=request.user, persist=True, orientation=orientation)

        disposition = 'inline' if request.GET.get('preview') == '1' else 'attachment'
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'{disposition}; filename="{file_name}"'
        return response


class EventDemographicsPdfView(BasePdfView):
    def get(self, request, event_id):
        event = get_object_or_404(Event.objects.filter(delete_status=False), pk=event_id)

        total_registered = EventRegistration.objects.filter(event_id=event).count()
        total_attended = EventAttendance.objects.filter(event_id=event).count()
        turnout_rate = round((total_attended / total_registered * 100), 1) if total_registered > 0 else 0

        # Gender breakdown
        gender_data = []
        g_counts = EventRegistration.objects.filter(event_id=event).values('gender').annotate(count=Count('id'))
        for g in g_counts:
            label = g['gender'] or 'Unspecified'
            c = g['count']
            pct = round((c / total_registered * 100), 1) if total_registered > 0 else 0
            gender_data.append({'gender': label, 'label': label, 'count': c, 'percentage': pct})

        # Category breakdown
        cat_data = []
        c_counts = EventRegistration.objects.filter(event_id=event).values('category').annotate(count=Count('id'))
        for c_item in c_counts:
            label = c_item['category'] or 'General'
            c = c_item['count']
            pct = round((c / total_registered * 100), 1) if total_registered > 0 else 0
            cat_data.append({'category': label, 'label': label, 'count': c, 'percentage': pct})

        # Residence breakdown
        res_data = []
        r_counts = EventRegistration.objects.filter(event_id=event).exclude(residence__isnull=True).exclude(residence='').values('residence').annotate(count=Count('id')).order_by('-count')[:8]
        for r_item in r_counts:
            label = r_item['residence']
            c = r_item['count']
            pct = round((c / total_registered * 100), 1) if total_registered > 0 else 0
            res_data.append({'residence': label, 'label': label, 'count': c, 'percentage': pct})

        context = {
            'id': event.id,
            'event': event,
            'analytics_data': {
                'total_registered': total_registered,
                'total_attended': total_attended,
                'turnout_rate': turnout_rate,
                'gender_breakdown': gender_data,
                'category_breakdown': cat_data,
                'residence_breakdown': res_data,
            }
        }

        orientation = request.GET.get('orientation', 'portrait')
        pdf_bytes, file_name = render_pdf('event_demographics_summary', context, user=request.user, persist=True, orientation=orientation)

        disposition = 'inline' if request.GET.get('preview') == '1' else 'attachment'
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'{disposition}; filename="{file_name}"'
        return response
