from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import MemberViewSet, CommittedMembersViewSet
from .views_pdf import MemberProfilePdfView

router = DefaultRouter()
router.register(r'committed', CommittedMembersViewSet, basename='committed-member')
router.register(r'', MemberViewSet, basename='member')

urlpatterns = [
    path('<int:pk>/profile/pdf/', MemberProfilePdfView.as_view(), name='member-profile-pdf'),
] + router.urls

