from django.urls import path
from .views import (
    EventLookupsView,
    EventListCreateView,
    EventDetailUpdateDeleteView,
    EventScheduleListCreateView,
    EventScheduleDetailView,
    EventRegistrationListCreateView,
    EventRegistrationDetailView,
    EventCheckinView,
    EventCheckinUndoView,
    EventCheckinStatusView,
    EventDemographicsAnalyticsView,
    EventBudgetView,
)
from .views_pdf import (
    EventAttendancePdfView,
    EventSchedulePdfView,
    EventDemographicsPdfView,
)

urlpatterns = [
    # Lookups & Metadata
    path('lookups/', EventLookupsView.as_view(), name='event-lookups'),

    # Event CRUD
    path('', EventListCreateView.as_view(), name='event-list-create'),
    path('<int:pk>/', EventDetailUpdateDeleteView.as_view(), name='event-detail'),

    # PDF Reports
    path('<int:event_id>/attendance/pdf/', EventAttendancePdfView.as_view(), name='event-attendance-pdf'),
    path('<int:event_id>/registrations/pdf/', EventAttendancePdfView.as_view(), name='event-registrations-pdf'),
    path('<int:event_id>/analytics/pdf/', EventDemographicsPdfView.as_view(), name='event-analytics-pdf'),
    path('<int:event_id>/schedule/pdf/', EventSchedulePdfView.as_view(), name='event-schedule-pdf'),

    # Schedules
    path('<int:event_id>/schedule/', EventScheduleListCreateView.as_view(), name='event-schedule-list-create'),
    path('<int:event_id>/schedule/<int:session_id>/', EventScheduleDetailView.as_view(), name='event-schedule-detail'),

    # Registrations
    path('<int:event_id>/registrations/', EventRegistrationListCreateView.as_view(), name='event-registration-list-create'),
    path('<int:event_id>/registrations/<int:reg_id>/', EventRegistrationDetailView.as_view(), name='event-registration-detail'),

    # Check-in & Undo
    path('<int:event_id>/checkin/', EventCheckinView.as_view(), name='event-checkin'),
    path('<int:event_id>/checkin/<int:reg_id>/', EventCheckinUndoView.as_view(), name='event-checkin-undo'),
    path('<int:event_id>/checkin/status/', EventCheckinStatusView.as_view(), name='event-checkin-status'),

    # Demographics Analytics
    path('<int:event_id>/analytics/demographics/', EventDemographicsAnalyticsView.as_view(), name='event-demographics-analytics'),

    # Event Budget
    path('<int:event_id>/budget/', EventBudgetView.as_view(), name='event-budget'),
]
