from rest_framework.permissions import BasePermission


class CanViewEventRegistrations(BasePermission):
    """
    Permission to view event registrations.
    Grants access to authenticated active portal users, staff, and superusers.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff or request.user.is_superuser:
            return True
        # Allow authenticated active portal users
        if getattr(request.user, 'status', True) and getattr(request.user, 'is_active', True):
            return True
        return (
            request.user.has_perm('core.view_event_registrations') or
            request.user.has_perm('events.view_event_registrations')
        )
