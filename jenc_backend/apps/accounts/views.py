from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q
from django.core.files.storage import default_storage

from core.models import CustomUser, Role, Member
from .serializers import (
    LegacyTokenObtainPairSerializer,
    UserProfileSerializer,
    UserManagementSerializer,
    RoleSerializer
)


class IsSuperAdminOrAdmin(permissions.BasePermission):
    """
    Allows access only to Super Admins or Staff users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_superuser or request.user.is_staff)
        )


class LegacyTokenObtainPairView(TokenObtainPairView):
    serializer_class = LegacyTokenObtainPairSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET: Retrieve current authenticated user profile
    PATCH / PUT: Update current user profile fields (bio, name, phone, dob, etc.)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class UserAvatarUploadView(APIView):
    """
    POST: Upload profile avatar picture for current user
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('avatar') or request.FILES.get('photo')
        if not file:
            return Response({'success': False, 'error': 'No image file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file type
        if not file.content_type.startswith('image/'):
            return Response({'success': False, 'error': 'Uploaded file is not a valid image.'}, status=status.HTTP_400_BAD_REQUEST)

        filename = f"avatars/user_{request.user.id}_{file.name}"
        saved_path = default_storage.save(filename, file)
        avatar_url = default_storage.url(saved_path)
        full_avatar_url = request.build_absolute_uri(avatar_url)

        # Update Member record
        user = request.user
        if user.member:
            user.member.photo = full_avatar_url
            user.member.save(update_fields=['photo'])
        else:
            member = Member.objects.create(
                first_name=user.first_name or user.email.split('@')[0],
                last_name=user.last_name or '',
                email=user.email,
                photo=full_avatar_url
            )
            user.member = member
            user.save(update_fields=['member'])

        return Response({
            'success': True,
            'message': 'Profile picture updated successfully',
            'avatar_url': full_avatar_url
        })


class UserPasswordChangeView(APIView):
    """
    POST: Change current user password
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'success': False, 'error': 'Both old and new passwords are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({'success': False, 'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({'success': False, 'error': 'New password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'success': True, 'message': 'Password changed successfully'})


# ==============================================================================
# USER MANAGEMENT (Super Admins & Staff Only)
# ==============================================================================

class UserManagementListView(APIView):
    """
    GET: List all user credentials and roles (Super Admin & Staff only)
    POST: Create new user account
    """
    permission_classes = [IsSuperAdminOrAdmin]

    def get(self, request):
        search = request.query_params.get('search')
        role = request.query_params.get('role')
        status_filter = request.query_params.get('status')
        limit = request.query_params.get('limit')

        queryset = CustomUser.objects.all().select_related('member').order_by('-date_joined', '-id')

        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(member__first_name__icontains=search) |
                Q(member__last_name__icontains=search) |
                Q(member__phone_no__icontains=search)
            )

        if role and role != 'All':
            if role == 'Super Admin':
                queryset = queryset.filter(is_superuser=True)
            elif role == 'Admin' or role == 'Staff':
                queryset = queryset.filter(is_staff=True, is_superuser=False)
            elif role == 'Cell Leader':
                queryset = queryset.filter(member__cell_id__isnull=False)
            elif role == 'Member':
                queryset = queryset.filter(is_staff=False, is_superuser=False)

        if status_filter and status_filter != 'All':
            if status_filter.lower() == 'active':
                queryset = queryset.filter(status=True, is_active=True)
            elif status_filter.lower() in ['inactive', 'locked']:
                queryset = queryset.filter(Q(status=False) | Q(is_active=False))

        total_count = queryset.count()

        if limit:
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass

        serializer = UserManagementSerializer(queryset, many=True)
        return Response({
            'success': True,
            'count': total_count,
            'results': serializer.data
        })

    def post(self, request):
        serializer = UserManagementSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'success': True,
                'message': 'User created successfully',
                'user': UserManagementSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class UserManagementDetailView(APIView):
    """
    GET: Get user detail
    PATCH / PUT: Update user roles, credentials or active status
    DELETE: Deactivate or remove user
    """
    permission_classes = [IsSuperAdminOrAdmin]

    def get_object(self, pk):
        try:
            return CustomUser.objects.select_related('member').get(pk=pk)
        except CustomUser.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserManagementSerializer(user)
        return Response({'success': True, 'user': serializer.data})

    def patch(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserManagementSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            updated_user = serializer.save()
            return Response({
                'success': True,
                'message': 'User updated successfully',
                'user': UserManagementSerializer(updated_user).data
            })
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'success': False, 'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user == request.user:
            return Response({'success': False, 'error': 'You cannot deactivate your own account.'}, status=status.HTTP_400_BAD_REQUEST)

        # Soft deactivate
        user.status = False
        user.is_active = False
        user.save(update_fields=['status', 'is_active'])
        return Response({'success': True, 'message': f"User {user.email} deactivated successfully"})


class UserStatsView(APIView):
    """
    GET: Overview metrics of registered users and access roles
    """
    permission_classes = [IsSuperAdminOrAdmin]

    def get(self, request):
        total_users = CustomUser.objects.count()
        active_users = CustomUser.objects.filter(status=True, is_active=True).count()
        super_admins = CustomUser.objects.filter(is_superuser=True).count()
        staff_admins = CustomUser.objects.filter(is_staff=True, is_superuser=False).count()
        cell_leaders = CustomUser.objects.filter(member__cell_id__isnull=False).count()
        inactive_users = CustomUser.objects.filter(Q(status=False) | Q(is_active=False)).count()

        return Response({
            'success': True,
            'stats': {
                'total_users': total_users,
                'active_users': active_users,
                'super_admins': super_admins,
                'staff_admins': staff_admins,
                'cell_leaders': cell_leaders,
                'inactive_users': inactive_users,
            }
        })


class UserRolesView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdminOrAdmin]
    queryset = Role.objects.all()
    serializer_class = RoleSerializer


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({'detail': 'Logged out'}, status=status.HTTP_205_RESET_CONTENT)
