from django.urls import path
from .views import FinanceSettingsView, ContributionListView

urlpatterns = [
    path('settings/', FinanceSettingsView.as_view(), name='finance-settings'),
    path('contributions/', ContributionListView.as_view(), name='finance-contributions'),
]

