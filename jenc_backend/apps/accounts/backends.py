import bcrypt
from django.contrib.auth.backends import ModelBackend
from core.models import CustomUser


class LegacyAuthBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        lookup_email = email or username or kwargs.get('email-username')
        if not lookup_email or not password:
            return None

        try:
            user = CustomUser.objects.get(email__iexact=lookup_email)
        except CustomUser.DoesNotExist:
            return None

        # Check for PHP $2y$, $2a$, $2b$ bcrypt hashes
        raw_pwd = user.password or ''
        if raw_pwd.startswith(('$2y$', '$2a$', '$2b$')):
            compat_hash = raw_pwd.replace('$2y$', '$2b$').encode('utf-8')
            try:
                if bcrypt.checkpw(password.encode('utf-8'), compat_hash):
                    if self.user_can_authenticate(user):
                        return user
            except Exception:
                pass
            return None

        # Standard Django password check
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
