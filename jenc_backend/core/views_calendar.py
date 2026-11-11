import calendar
from datetime import datetime, date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from core.models import Event, Meeting

LABEL_COLORS = {
    'conference': '#2563eb',       # Blue
    'service': '#7c3aed',          # Violet
    'concert': '#db2777',          # Pink
    'workshop': '#d97706',         # Amber
    'outreach': '#ea580c',         # Orange
    'prayer': '#059669',           # Emerald
    'cell': '#10b981',             # Green
    'meeting': '#0284c7',          # Sky
    'general': '#64748b',          # Slate
}


class CalendarEventsView(APIView):
    """
    Unified Master Calendar API
    Aggregates Church Events & Conferences + Church Meetings & Services
    into a consolidated date timetable.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        now = datetime.now()
        year_param = request.query_params.get('year')
        month_param = request.query_params.get('month')

        try:
            year = int(year_param) if year_param else now.year
            month = int(month_param) if month_param else now.month
        except (ValueError, TypeError):
            year = now.year
            month = now.month

        # Month boundaries
        num_days = calendar.monthrange(year, month)[1]
        start_date = date(year, month, 1)
        end_date = date(year, month, num_days)

        exclude_planning = request.query_params.get('exclude') == 'planning'
        category_filter = request.query_params.get('category', '').strip().lower()

        events_list = []

        # 1. Fetch Events
        events_qs = Event.objects.filter(delete_status=False).filter(
            Q(start_date__date__gte=start_date, start_date__date__lte=end_date) |
            Q(end_date__date__gte=start_date, end_date__date__lte=end_date) |
            Q(start_date__date__lte=start_date, end_date__date__gte=end_date)
        )

        if exclude_planning:
            events_qs = events_qs.exclude(status__iexact='planning')

        for ev in events_qs:
            ev_type = (ev.type or 'general').lower()
            ev_label = ev.type.capitalize() if ev.type else 'Conference'
            color = LABEL_COLORS.get(ev_type, '#2563eb')
            start_str = ev.start_date.strftime('%Y-%m-%d') if ev.start_date else ''
            time_str = ev.start_time.strftime('%H:%M') if ev.start_time else '09:00'
            end_date_str = ev.end_date.strftime('%Y-%m-%d') if ev.end_date else start_str

            events_list.append({
                'id': f"evt_{ev.id}",
                'raw_id': ev.id,
                'title': ev.ename or 'Church Event',
                'item_type': 'event',
                'type': ev_type,
                'label': ev_label,
                'color': color,
                'date': start_str,
                'start': f"{start_str}T{time_str}:00" if start_str else '',
                'start_time': time_str,
                'end_date': end_date_str,
                'venue': ev.branch or 'Main Auditorium',
                'location': ev.branch or 'Main Auditorium',
                'facilitator': 'Pastoral Directorate',
                'description': ev.notes or '',
                'target_attendees': ev.target_attendees or 0,
                'registrations_count': ev.registrations.count() if hasattr(ev, 'registrations') else 0,
                'status': ev.status or 'published',
            })

        # 2. Fetch Meetings
        meetings_qs = Meeting.objects.select_related('meeting_type', 'facilitator').filter(
            start_time__date__gte=start_date,
            start_time__date__lte=end_date
        )

        for mt in meetings_qs:
            mt_type_name = mt.meeting_type.name if mt.meeting_type else 'Meeting'
            mt_key = mt_type_name.lower()
            color = '#059669' if 'cell' in mt_key or 'prayer' in mt_key else '#0284c7'

            fac_name = 'Ministry Facilitator'
            if mt.facilitator:
                fn = f"{getattr(mt.facilitator, 'first_name', '')} {getattr(mt.facilitator, 'last_name', '')}".strip()
                if fn:
                    fac_name = fn
                elif hasattr(mt.facilitator, 'get_full_name'):
                    fac_name = mt.facilitator.get_full_name() or mt.facilitator.username

            d_str = mt.start_time.strftime('%Y-%m-%d') if mt.start_time else ''
            t_str = mt.start_time.strftime('%H:%M') if mt.start_time else '18:00'
            end_t_str = mt.end_time.strftime('%H:%M') if mt.end_time else ''

            events_list.append({
                'id': f"mtg_{mt.id}",
                'raw_id': mt.id,
                'title': mt.name or 'Church Meeting',
                'item_type': 'meeting',
                'type': 'meeting',
                'label': mt_type_name,
                'color': color,
                'date': d_str,
                'start': mt.start_time.isoformat() if mt.start_time else '',
                'start_time': t_str,
                'end_time': end_t_str,
                'end_date': d_str,
                'venue': 'Church Sanctuary / Cell Location',
                'location': 'Church Sanctuary / Cell Location',
                'meeting_link': mt.meeting_link or '',
                'meeting_code': mt.meeting_code or '',
                'facilitator': fac_name,
                'description': mt.description or '',
                'target_attendees': 0,
                'status': 'scheduled',
            })

        # Sort chronologically
        events_list.sort(key=lambda x: (x.get('date') or '', x.get('start_time') or ''))

        # Filter by category if requested
        if category_filter and category_filter != 'all':
            events_list = [
                e for e in events_list
                if e['label'].lower() == category_filter or e['type'].lower() == category_filter
            ]

        # Extract distinct filter labels
        available_filters = sorted(list({e['label'] for e in events_list}))

        return Response({
            'success': True,
            'year': year,
            'month': month,
            'events': events_list,
            'filters': available_filters,
            'summary': {
                'total_items': len(events_list),
                'events_count': len([e for e in events_list if e['item_type'] == 'event']),
                'meetings_count': len([e for e in events_list if e['item_type'] == 'meeting']),
            }
        })
