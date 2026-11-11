from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from core.models import CustomUser, Member, Role


class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone_no = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.SerializerMethodField()
    member_id = serializers.SerializerMethodField()
    dob = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()
    marital = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()
    dashboard_role = serializers.SerializerMethodField()
    can_view_church_stats = serializers.SerializerMethodField()
    cell_info = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_no', 'member_id', 'is_staff', 'is_superuser',
            'status', 'bio', 'dob', 'gender', 'marital', 'location',
            'address', 'photo', 'role', 'roles', 'dashboard_role',
            'can_view_church_stats', 'cell_info', 'last_login', 'date'
        ]
        read_only_fields = ['id', 'is_staff', 'is_superuser', 'last_login', 'date']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Ensure first_name, last_name, phone_no default from member
        if instance.member:
            ret['first_name'] = instance.member.first_name or getattr(instance, 'first_name', '')
            ret['last_name'] = instance.member.last_name or getattr(instance, 'last_name', '')
            ret['phone_no'] = instance.member.phone_no or ''
        else:
            ret['first_name'] = getattr(instance, 'first_name', '')
            ret['last_name'] = getattr(instance, 'last_name', '')
            ret['phone_no'] = ''
        return ret

    def get_full_name(self, obj):
        if obj.member:
            name = f"{obj.member.first_name or ''} {obj.member.last_name or ''}".strip()
            if name:
                return name
        first = getattr(obj, 'first_name', '') or ''
        last = getattr(obj, 'last_name', '') or ''
        combined = f"{first} {last}".strip()
        return combined or obj.email.split('@')[0]

    def get_member_id(self, obj):
        return obj.member_id if obj.member_id else None

    def get_dob(self, obj):
        if obj.member and obj.member.bod:
            bod = obj.member.bod
            if hasattr(bod, 'isoformat'):
                return bod.isoformat()
            return str(bod)
        return None

    def get_gender(self, obj):
        return obj.member.gender if obj.member else None

    def get_marital(self, obj):
        return obj.member.marital if obj.member else None

    def get_location(self, obj):
        return obj.member.location if obj.member else None

    def get_address(self, obj):
        return obj.member.address if obj.member else None

    def get_photo(self, obj):
        if obj.member and obj.member.photo:
            photo = str(obj.member.photo).strip()
            if not photo:
                return None
            if photo.startswith('http://') or photo.startswith('https://'):
                return photo
            if photo.startswith('/media/'):
                path = photo
            elif photo.startswith('media/'):
                path = f"/{photo}"
            elif photo.startswith('/'):
                path = photo
            else:
                path = f"/media/{photo}"

            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(path)
            return f"http://localhost:8000{path}"
        return None

    def get_role(self, obj):
        if obj.is_superuser:
            return 'Super Administrator'
        if obj.is_staff:
            return 'Administrator'
        if obj.member:
            from core.models import Cell
            if Cell.objects.filter(cell_leader=obj.member).exists() or Cell.objects.filter(leader_in_training_id=obj.member).exists():
                return 'Cell Leader'
            if 'assimilation' in str(obj.member.department).lower() or 'follow' in str(obj.member.department).lower():
                return 'Assimilation Team'
        if obj.groups.filter(name__icontains='Coordinator').exists():
            return 'DC Coordinator'
        if obj.groups.filter(name__icontains='Assimilation').exists():
            return 'Assimilation Team'
        if obj.groups.filter(name__icontains='Cell Leader').exists():
            return 'Cell Leader'
        return 'Church Member'

    def get_roles(self, obj):
        role_list = []
        if obj.is_superuser:
            role_list.append({'id': 'superuser', 'name': 'Super Administrator'})
        if obj.is_staff:
            role_list.append({'id': 'admin', 'name': 'Administrator'})
        if obj.member:
            from core.models import Cell
            if Cell.objects.filter(cell_leader=obj.member).exists() or Cell.objects.filter(leader_in_training_id=obj.member).exists():
                role_list.append({'id': 'cell_leader', 'name': 'Cell Leader'})
            if 'assimilation' in str(obj.member.department).lower() or 'follow' in str(obj.member.department).lower():
                role_list.append({'id': 'assimilation', 'name': 'Assimilation Team'})
        if obj.groups.filter(name__icontains='Coordinator').exists():
            role_list.append({'id': 'dc_coordinator', 'name': 'DC Coordinator'})
        if not role_list:
            role_list.append({'id': 'member', 'name': 'Church Member'})
        return role_list

    def get_dashboard_role(self, obj):
        if obj.is_superuser or obj.is_staff:
            return 'admin'
        if obj.groups.filter(name__icontains='Coordinator').exists():
            return 'dc_coordinator'
        if obj.member:
            from core.models import Cell
            if Cell.objects.filter(cell_leader=obj.member).exists() or Cell.objects.filter(leader_in_training_id=obj.member).exists():
                return 'cell_leader'
            if 'assimilation' in str(obj.member.department).lower() or 'follow' in str(obj.member.department).lower():
                return 'assimilation'
        if obj.groups.filter(name__icontains='Assimilation').exists():
            return 'assimilation'
        if obj.groups.filter(name__icontains='Cell Leader').exists():
            return 'cell_leader'
        return 'member'

    def get_can_view_church_stats(self, obj):
        if obj.is_superuser or obj.is_staff:
            return True
        if obj.groups.filter(name__icontains='Coordinator').exists():
            return True
        return False

    def get_cell_info(self, obj):
        if not obj.member:
            return None
        from core.models import Cell
        led_cell = Cell.objects.filter(cell_leader=obj.member).first()
        if led_cell:
            return {
                'id': led_cell.id,
                'name': led_cell.name,
                'code': led_cell.code,
                'meeting_day': led_cell.meeting_day,
                'meeting_time': str(led_cell.meeting_time) if led_cell.meeting_time else None,
                'location': led_cell.location,
                'is_leader': True
            }
        if obj.member.cell_id:
            member_cell = Cell.objects.filter(id=obj.member.cell_id).first()
            if member_cell:
                leader_name = f"{member_cell.cell_leader.first_name} {member_cell.cell_leader.last_name or ''}".strip() if member_cell.cell_leader else 'Cell Leader'
                return {
                    'id': member_cell.id,
                    'name': member_cell.name,
                    'code': member_cell.code,
                    'meeting_day': member_cell.meeting_day,
                    'meeting_time': str(member_cell.meeting_time) if member_cell.meeting_time else None,
                    'location': member_cell.location,
                    'leader_name': leader_name,
                    'is_leader': False
                }
        return None

    def update(self, instance, validated_data):
        # Extract fields meant for Member
        first_name = self.initial_data.get('first_name')
        last_name = self.initial_data.get('last_name')
        phone_no = self.initial_data.get('phone_no') or self.initial_data.get('phone')
        dob = self.initial_data.get('dob')
        location = self.initial_data.get('location')
        address = self.initial_data.get('address')
        gender = self.initial_data.get('gender')
        marital = self.initial_data.get('marital')
        photo = self.initial_data.get('photo') or self.initial_data.get('profile_picture')

        # Update CustomUser direct fields
        if 'bio' in validated_data:
            instance.bio = validated_data['bio']
        elif 'bio' in self.initial_data:
            instance.bio = self.initial_data['bio']

        if first_name:
            instance.first_name = first_name
        if last_name:
            instance.last_name = last_name

        instance.save()

        # Update or create linked Member
        member = instance.member
        if not member:
            member = Member.objects.create(
                first_name=first_name or instance.email.split('@')[0],
                last_name=last_name or '',
                email=instance.email,
                phone_no=phone_no or ''
            )
            instance.member = member
            instance.save(update_fields=['member'])
        else:
            if first_name is not None:
                member.first_name = first_name
            if last_name is not None:
                member.last_name = last_name
            if phone_no is not None:
                member.phone_no = phone_no
            if dob:
                try:
                    if isinstance(dob, str):
                        from datetime import datetime
                        try:
                            member.bod = datetime.strptime(dob[:10], '%Y-%m-%d').date()
                        except Exception:
                            member.bod = dob
                    else:
                        member.bod = dob
                except Exception:
                    pass
            elif dob == '' or (dob is None and 'dob' in self.initial_data):
                member.bod = None
            if location is not None:
                member.location = location
            if address is not None:
                member.address = address
            if gender is not None:
                member.gender = gender
            if marital is not None:
                member.marital = marital
            if photo is not None:
                member.photo = photo
            member.save()

        return instance


class UserManagementSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    phone_no = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    member_name = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_no', 'member_id', 'member_name', 'is_staff',
            'is_superuser', 'status', 'is_active', 'role', 'bio',
            'last_login', 'date', 'password'
        ]
        read_only_fields = ['id', 'last_login', 'date']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.member:
            ret['first_name'] = instance.member.first_name or getattr(instance, 'first_name', '')
            ret['last_name'] = instance.member.last_name or getattr(instance, 'last_name', '')
            ret['phone_no'] = instance.member.phone_no or ''
        else:
            ret['first_name'] = getattr(instance, 'first_name', '')
            ret['last_name'] = getattr(instance, 'last_name', '')
            ret['phone_no'] = ''
        return ret

    def get_full_name(self, obj):
        if obj.member:
            name = f"{obj.member.first_name or ''} {obj.member.last_name or ''}".strip()
            if name:
                return name
        first = getattr(obj, 'first_name', '') or ''
        last = getattr(obj, 'last_name', '') or ''
        combined = f"{first} {last}".strip()
        return combined or obj.email.split('@')[0]

    def get_member_name(self, obj):
        if obj.member:
            return f"{obj.member.first_name} {obj.member.last_name or ''}".strip()
        return None

    def get_role(self, obj):
        if obj.is_superuser:
            return 'Super Admin'
        if obj.is_staff:
            return 'Admin'
        if obj.member and obj.member.cell_id:
            return 'Cell Leader'
        return 'Member'

    def create(self, validated_data):
        password = validated_data.pop('password', None) or 'JesusEnthroned2026!'
        first_name = self.initial_data.get('first_name', '')
        last_name = self.initial_data.get('last_name', '')
        phone_no = self.initial_data.get('phone_no', '')
        role = self.initial_data.get('role', 'Member')

        user = CustomUser(
            email=validated_data['email'],
            first_name=first_name,
            last_name=last_name,
            status=validated_data.get('status', True),
            is_active=validated_data.get('is_active', True)
        )

        if role == 'Super Admin':
            user.is_superuser = True
            user.is_staff = True
        elif role == 'Admin' or role == 'Staff':
            user.is_staff = True
            user.is_superuser = False
        else:
            user.is_staff = False
            user.is_superuser = False

        user.set_password(password)
        user.save()

        # Link to member or create member
        member_id = self.initial_data.get('member_id')
        if member_id:
            try:
                user.member = Member.objects.get(pk=member_id)
                user.save(update_fields=['member'])
            except Member.DoesNotExist:
                pass
        else:
            member = Member.objects.create(
                first_name=first_name or user.email.split('@')[0],
                last_name=last_name,
                email=user.email,
                phone_no=phone_no
            )
            user.member = member
            user.save(update_fields=['member'])

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        if 'email' in validated_data:
            instance.email = validated_data['email']
        if 'status' in validated_data:
            instance.status = validated_data['status']
            instance.is_active = validated_data['status']
        if 'is_staff' in validated_data:
            instance.is_staff = validated_data['is_staff']
        if 'is_superuser' in validated_data:
            instance.is_superuser = validated_data['is_superuser']

        role = self.initial_data.get('role')
        if role:
            if role == 'Super Admin':
                instance.is_superuser = True
                instance.is_staff = True
            elif role == 'Admin' or role == 'Staff':
                instance.is_staff = True
                instance.is_superuser = False
            elif role == 'Member':
                instance.is_staff = False
                instance.is_superuser = False

        first_name = self.initial_data.get('first_name')
        last_name = self.initial_data.get('last_name')
        phone_no = self.initial_data.get('phone_no')

        if first_name is not None:
            instance.first_name = first_name
        if last_name is not None:
            instance.last_name = last_name

        instance.save()

        # Update linked member if present
        if instance.member:
            if first_name is not None:
                instance.member.first_name = first_name
            if last_name is not None:
                instance.member.last_name = last_name
            if phone_no is not None:
                instance.member.phone_no = phone_no
            instance.member.save()

        return instance


class LegacyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email-username'] = serializers.CharField(required=False, write_only=True)
        self.fields['email'] = serializers.CharField(required=False, write_only=True)
        if 'username' in self.fields:
            self.fields['username'].required = False

    def validate(self, attrs):
        username = attrs.get('email-username') or attrs.get('email') or attrs.get('username')
        password = attrs.get('password')

        if not username:
            raise serializers.ValidationError({'detail': 'Email is required.'})

        user = authenticate(email=username, password=password)
        if not user:
            user = authenticate(username=username, password=password)

        if not user:
            raise serializers.ValidationError({'detail': 'No active account found with the given credentials'})

        if not user.is_active:
            raise serializers.ValidationError({'detail': 'User account is disabled.'})

        self.user = user
        refresh = self.get_token(self.user)

        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserProfileSerializer(self.user).data
        }
        return data


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']
