from django.urls import path
from .views import (
    AnalyticsOverviewView,
    AnalyticsLeadershipView,
    PastoralActionView,
    AssimilationAnalyticsView,
    AssimilationFollowupView,
    AssimilationAssignView,
    AssimilationExportView,
)

urlpatterns = [
    path('overview/', AnalyticsOverviewView.as_view(), name='analytics-overview'),
    path('leadership/', AnalyticsLeadershipView.as_view(), name='analytics-leadership'),
    path('pastoral-action/', PastoralActionView.as_view(), name='pastoral-action'),
    path('assimilation/', AssimilationAnalyticsView.as_view(), name='analytics-assimilation'),
    path('assimilation/followup/', AssimilationFollowupView.as_view(), name='assimilation-followup'),
    path('assimilation/assign/', AssimilationAssignView.as_view(), name='assimilation-assign'),
    path('assimilation/export/', AssimilationExportView.as_view(), name='assimilation-export'),
]
