from django.urls import path
from .views import (
    MeetingTypeListView,
    MeetingListCreateView,
    MeetingDetailUpdateDeleteView,
    MeetingAttendanceListView,
    MeetingAttendanceDeleteView,
    MeetingAttendanceEligibleView,
    AttendanceSummaryView,
    AttendanceIndividualTrackingView,
    AttendanceFollowupView,
    AttendanceAnalyticsView,
    MeetingMinutesDetailView,
    MeetingMinutesListView,
    MeetingsFilterLookupView,
)
from .views_pdf import MeetingMinutesPdfView

urlpatterns = [
    # Metadata & Filters
    path('filters/', MeetingsFilterLookupView.as_view(), name='meetings-filters'),
    path('types/', MeetingTypeListView.as_view(), name='meeting-types'),

    # Attendance standalone / aggregate endpoints
    path('attendance/summary/', AttendanceSummaryView.as_view(), name='attendance-summary'),
    path('attendance/individual/', AttendanceIndividualTrackingView.as_view(), name='attendance-individual'),
    path('attendance/followup/', AttendanceFollowupView.as_view(), name='attendance-followup'),
    path('attendance/analytics/', AttendanceAnalyticsView.as_view(), name='attendance-analytics'),

    # Minutes list (landing)
    path('minutes/list/', MeetingMinutesListView.as_view(), name='minutes-list'),

    # Meeting CRUD
    path('', MeetingListCreateView.as_view(), name='meeting-list-create'),
    path('<int:pk>/', MeetingDetailUpdateDeleteView.as_view(), name='meeting-detail'),

    # Per-meeting Attendance
    path('<int:pk>/attendance/', MeetingAttendanceListView.as_view(), name='meeting-attendance-list'),
    path('<int:pk>/attendance/<int:att_id>/', MeetingAttendanceDeleteView.as_view(), name='meeting-attendance-delete'),
    path('<int:pk>/attendance/eligible/', MeetingAttendanceEligibleView.as_view(), name='meeting-attendance-eligible'),

    # Per-meeting Minutes
    path('<int:pk>/minutes/', MeetingMinutesDetailView.as_view(), name='meeting-minutes-detail'),
    path('<int:pk>/minutes/pdf/', MeetingMinutesPdfView.as_view(), name='meeting-minutes-pdf'),
]
