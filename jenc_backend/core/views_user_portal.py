from datetime import datetime
from django.utils import timezone
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.models import Member, Attendance, Meeting, Pledges, Contribution


class UserAttendanceView(APIView):
    """
    Returns authenticated user's personal attendance statistics, recent history, and monthly trend.
    Compatible with /api/get_my_attendance.php and modern portal widgets.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        member = getattr(user, 'member', None)
        if not member and user.email:
            member = Member.objects.filter(email=user.email).first()

        now = timezone.now()

        if member:
            my_attendance = Attendance.objects.filter(
                member_id=member,
                login_time__year=now.year,
                login_time__month=now.month
            ).count()
        else:
            my_attendance = 0

        # Total corporate meetings this month
        total_meetings = Meeting.objects.filter(
            start_time__year=now.year,
            start_time__month=now.month
        ).count()

        percentage = round((my_attendance / total_meetings * 100), 2) if total_meetings > 0 else 0.0

        # Recent attendance (last 10)
        recent_list = []
        if member:
            recent_qs = Attendance.objects.filter(
                member_id=member
            ).select_related('meeting_id').order_by('-login_time')[:10]

            for a in recent_qs:
                recent_list.append({
                    'id': a.id,
                    'login_time': a.login_time.isoformat() if a.login_time else None,
                    'meeting_name': a.meeting_id.name if a.meeting_id else 'Meeting',
                    'meeting_date': a.meeting_id.start_time.isoformat() if (a.meeting_id and a.meeting_id.start_time) else None,
                    'attended': True
                })

        # Monthly trend (last 6 months)
        monthly_trend = []
        if member:
            trend_qs = Attendance.objects.filter(
                member_id=member,
                login_time__gte=now - timezone.timedelta(days=180)
            ).annotate(month=TruncMonth('login_time')).values('month').annotate(count=Count('id')).order_by('month')

            for t in trend_qs:
                if t['month']:
                    monthly_trend.append({
                        'month': t['month'].strftime('%Y-%m'),
                        'count': t['count']
                    })

        data = {
            'my_attendance': {
                'attended': my_attendance,
                'total_meetings': total_meetings,
                'percentage': percentage
            },
            'recent_attendance': recent_list,
            'monthly_trend': monthly_trend
        }

        return Response({
            'success': True,
            'message': 'Attendance data retrieved',
            'data': data
        })


class UserPledgesView(APIView):
    """
    Returns authenticated user's personal pledges and giving progress.
    Compatible with /api/get_my_pledges.php and portal finance widgets.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        member = getattr(user, 'member', None)
        if not member and user.email:
            member = Member.objects.filter(email=user.email).first()

        pledges_qs = Pledges.objects.none()
        if member:
            pledges_qs = Pledges.objects.filter(
                Q(member=str(member.id)) |
                Q(member=f"{member.first_name} {member.last_name}".strip()) |
                Q(full_name__icontains=member.first_name or '')
            ).order_by('-id')
        elif user.email:
            pledges_qs = Pledges.objects.filter(
                Q(full_name__icontains=user.email)
            ).order_by('-id')

        total_pledged = 0.0
        pledges_list = []
        for p in pledges_qs:
            amt = float(p.pledges_amount or 0)
            total_pledged += amt
            pledges_list.append({
                'id': p.id,
                'title': p.purpose or 'General Pledge',
                'amount': amt,
                'frequency': 'Monthly' if p.recurring else 'One-Time',
                'start_date': p.date.strftime('%Y-%m-%d') if p.date else None,
                'end_date': None,
                'notes': p.notes or '',
                'created_at': p.date.isoformat() if p.date else None
            })

        now = timezone.now()
        ytd_giving = 0.0
        if member:
            try:
                ytd_sum = Contribution.objects.filter(
                    Q(member=str(member.id)) | Q(member=f"{member.first_name} {member.last_name}".strip()),
                    date__year=now.year
                ).aggregate(total=Sum('amount'))['total']
                ytd_giving = float(ytd_sum or 0)
            except Exception:
                ytd_giving = 0.0

        summary = {
            'total_pledges': len(pledges_list),
            'active_pledges': len(pledges_list),
            'total_pledged': total_pledged,
            'ytd_giving': ytd_giving
        }

        return Response({
            'success': True,
            'message': 'Pledges retrieved successfully',
            'data': {
                'pledges': pledges_list,
                'total_pledged': total_pledged,
                'ytd_giving': ytd_giving,
                'summary': summary
            }
        })

