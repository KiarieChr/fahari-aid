from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LegacyTokenObtainPairView,
    UserProfileView,
    UserAvatarUploadView,
    UserPasswordChangeView,
    UserManagementListView,
    UserManagementDetailView,
    UserStatsView,
    UserRolesView,
    LogoutView
)

urlpatterns = [
    # Auth tokens
    path('token/', LegacyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Current authenticated user profile
    path('me/', UserProfileView.as_view(), name='user_me'),
    path('me/avatar/', UserAvatarUploadView.as_view(), name='user_avatar'),
    path('me/change-password/', UserPasswordChangeView.as_view(), name='user_change_password'),

    # User Management (Super Admin & Staff only)
    path('users/', UserManagementListView.as_view(), name='user_management_list'),
    path('users/<int:pk>/', UserManagementDetailView.as_view(), name='user_management_detail'),
    path('users/stats/', UserStatsView.as_view(), name='user_management_stats'),
    path('roles/', UserRolesView.as_view(), name='user_roles'),
]
