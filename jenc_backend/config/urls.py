"""
URL configuration for jenc_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.views_branding import PublicBrandingView, ManageBrandingView, BrandingAssetUploadView
from core.views_cells import CellListView
from apps.members.views_pdf import AssimilationPdfView
from core.views_user_portal import UserAttendanceView, UserPledgesView
from apps.finance.views import FinanceSettingsView, ContributionListView
from core.views_calendar import CalendarEventsView
from core.views_media import (
    MediaListView,
    MediaDetailView,
    MediaStatsView,
    MediaLatestView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/members/', include('apps.members.urls')),
    path('api/cells/', CellListView.as_view(), name='cells-list'),
    path('api/assimilation/reports/pdf/', AssimilationPdfView.as_view(), name='assimilation-reports-pdf'),
    path('api/analytics/', include('core.urls')),
    path('api/branding/', PublicBrandingView.as_view(), name='public-branding'),
    path('api/admin/branding/', ManageBrandingView.as_view(), name='manage-branding'),
    path('api/admin/branding/upload/', BrandingAssetUploadView.as_view(), name='branding-upload'),
    path('api/meetings/', include('apps.meetings.urls')),
    path('api/events/', include('apps.events.urls')),
    path('api/finance/', include('apps.finance.urls')),

    # Personal Attendance & Pledges (Legacy PHP compatibility & modern DRF routes)
    path('api/get_my_attendance.php', UserAttendanceView.as_view(), name='my-attendance-legacy'),
    path('api/attendance/my/', UserAttendanceView.as_view(), name='my-attendance'),
    path('api/get_my_pledges.php', UserPledgesView.as_view(), name='my-pledges-legacy'),
    path('api/pledges/my/', UserPledgesView.as_view(), name='my-pledges'),
    path('api/finance_settings.php', FinanceSettingsView.as_view(), name='finance-settings-legacy'),
    path('api/get_contributions.php', ContributionListView.as_view(), name='contributions-legacy'),
    path('api/contributions/', ContributionListView.as_view(), name='contributions-alias'),

    # Master Calendar (Unified Events & Meetings)
    path('api/calendar/events/', CalendarEventsView.as_view(), name='calendar-events'),
    path('api/get_calendar_events.php', CalendarEventsView.as_view(), name='calendar-events-legacy'),

    # Media & Sermon Center
    path('api/media/', MediaListView.as_view(), name='media-list'),
    path('api/media/<int:pk>/', MediaDetailView.as_view(), name='media-detail'),
    path('api/media/stats/', MediaStatsView.as_view(), name='media-stats'),
    path('api/media/latest/', MediaLatestView.as_view(), name='media-latest'),
    path('api/sermons/', MediaListView.as_view(), name='sermons-list-alias'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

